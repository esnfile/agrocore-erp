import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormRow } from "@/components/FormRow";
import { toast } from "@/hooks/use-toast";
import { romaneioService, motoristaService, veiculoService, pontoEstoqueService } from "@/lib/services";
import { produtos as mockProdutos, type Motorista, type Veiculo, type PontoEstoque } from "@/lib/mock-data";
import type { TipoRomaneio } from "@/lib/mock-data";

interface Props {
  open: boolean;
  onClose: () => void;
  ctx: { grupoId: string; empresaId: string; filialId: string };
}

export function NovoRomaneioAvulsoModal({ open, onClose, ctx }: Props) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [tipoRomaneio, setTipoRomaneio] = useState<TipoRomaneio>("ENTRADA");
  const [produtoId, setProdutoId] = useState("");
  const [pontoEstoqueId, setPontoEstoqueId] = useState("");
  const [motoristaId, setMotoristaId] = useState("");
  const [veiculoId, setVeiculoId] = useState("");

  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [pontos, setPontos] = useState<PontoEstoque[]>([]);

  const produtosAtivos = useMemo(
    () => mockProdutos.filter((p) => p.deletadoEm === null && p.ativo),
    []
  );

  useEffect(() => {
    if (!open) return;
    // reset
    setTipoRomaneio("ENTRADA");
    setProdutoId("");
    setPontoEstoqueId("");
    setMotoristaId("");
    setVeiculoId("");
    Promise.all([
      motoristaService.listar(ctx.empresaId, ctx.filialId),
      veiculoService.listar(ctx.empresaId, ctx.filialId),
      pontoEstoqueService.listar(ctx.empresaId, ctx.filialId),
    ]).then(([m, v, p]) => {
      setMotoristas(m.filter((x) => x.ativo));
      setVeiculos(v.filter((x) => x.ativo));
      setPontos(p.filter((x) => x.ativo));
    });
  }, [open, ctx.empresaId, ctx.filialId]);

  const handleSalvar = async () => {
    if (!produtoId || !pontoEstoqueId || !motoristaId || !veiculoId) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const duplicado = await romaneioService.verificarDuplicado({
        empresaId: ctx.empresaId,
        filialId: ctx.filialId,
        origem: "AVULSO",
        tipoRomaneio,
        produtoId,
        pontoEstoqueId,
        motoristaId,
        veiculoId,
      });
      if (duplicado) {
        toast({
          title: "Romaneio já existe",
          description: "Selecione-o na listagem.",
          variant: "destructive",
        });
        return;
      }

      const motorista = motoristas.find((m) => m.id === motoristaId);
      const veiculo = veiculos.find((v) => v.id === veiculoId);

      const novo = await romaneioService.salvar(
        {
          origem: "AVULSO",
          tipoRomaneio,
          produtoId,
          pontoEstoqueId,
          motoristaId,
          motoristaNome: motorista?.nome ?? "",
          motoristaDocumento: motorista?.documento ?? "",
          veiculoId,
          placaVeiculo: veiculo?.placa ?? "",
          status: "AGUARDANDO_PESAGEM",
          origemCriacao: "TELA_PESAGEM",
        },
        ctx
      );
      toast({ title: "Romaneio criado. Inicie a pesagem." });
      onClose();
      navigate(`/balanca/pesagem/${novo.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Romaneio Avulso</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <FormRow columns={2}>
            <div>
              <Label>Origem</Label>
              <Select value="AVULSO" disabled>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="AVULSO">Avulso</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo *</Label>
              <Select value={tipoRomaneio} onValueChange={(v) => setTipoRomaneio(v as TipoRomaneio)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRADA">Entrada</SelectItem>
                  <SelectItem value="SAIDA">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FormRow>
          <FormRow columns={2}>
            <div>
              <Label>Produto *</Label>
              <Select value={produtoId} onValueChange={setProdutoId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {produtosAtivos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.descricao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ponto de Estoque *</Label>
              <Select value={pontoEstoqueId} onValueChange={setPontoEstoqueId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {pontos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.descricao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FormRow>
          <FormRow columns={2}>
            <div>
              <Label>Motorista *</Label>
              <Select value={motoristaId} onValueChange={setMotoristaId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {motoristas.length === 0 ? (
                    <div className="p-2 text-xs text-muted-foreground">Nenhum motorista cadastrado. Cadastre em Romaneios → Cadastros → Motoristas.</div>
                  ) : motoristas.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.nome}{m.documento ? ` — ${m.documento}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Veículo *</Label>
              <Select value={veiculoId} onValueChange={setVeiculoId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {veiculos.length === 0 ? (
                    <div className="p-2 text-xs text-muted-foreground">Nenhum veículo cadastrado. Cadastre em Romaneios → Cadastros → Veículos.</div>
                  ) : veiculos.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.placa}{v.tipoVeiculo ? ` — ${v.tipoVeiculo}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FormRow>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSalvar} disabled={saving}>Avançar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
