import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  // Motorista (texto livre + autocomplete + quick-add)
  const [motoristaId, setMotoristaId] = useState<string>("");
  const [motoristaNome, setMotoristaNome] = useState("");
  const [motoristaDocumento, setMotoristaDocumento] = useState("");
  const [motSugg, setMotSugg] = useState<Motorista[]>([]);
  const [showMotSugg, setShowMotSugg] = useState(false);
  const [motHi, setMotHi] = useState(0);
  const [quickMotOpen, setQuickMotOpen] = useState(false);
  const [quickMotNome, setQuickMotNome] = useState("");
  const [quickMotDoc, setQuickMotDoc] = useState("");

  // Veículo
  const [veiculoId, setVeiculoId] = useState<string>("");
  const [placaVeiculo, setPlacaVeiculo] = useState("");
  const [tipoVeiculo, setTipoVeiculo] = useState("");
  const [veicSugg, setVeicSugg] = useState<Veiculo[]>([]);
  const [showVeicSugg, setShowVeicSugg] = useState(false);
  const [veicHi, setVeicHi] = useState(0);
  const [quickVeicOpen, setQuickVeicOpen] = useState(false);
  const [quickVeicPlaca, setQuickVeicPlaca] = useState("");
  const [quickVeicTipo, setQuickVeicTipo] = useState("");

  const [pontos, setPontos] = useState<PontoEstoque[]>([]);

  const produtosAtivos = useMemo(
    () => mockProdutos.filter((p) => p.deletadoEm === null && p.ativo),
    []
  );

  // Use a ref to avoid duplicate-open races
  const blurMotRef = useRef<number | null>(null);
  const blurVeicRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setTipoRomaneio("ENTRADA");
    setProdutoId("");
    setPontoEstoqueId("");
    setMotoristaId(""); setMotoristaNome(""); setMotoristaDocumento("");
    setVeiculoId(""); setPlacaVeiculo(""); setTipoVeiculo("");
    pontoEstoqueService.listar(ctx.empresaId, ctx.filialId).then((p) => setPontos(p.filter((x) => x.ativo)));
  }, [open, ctx.empresaId, ctx.filialId]);

  // ===== Motorista =====
  const searchMotorista = async (termo: string) => {
    setMotoristaNome(termo);
    setMotoristaId("");
    setMotoristaDocumento("");
    if (termo.length < 2) { setShowMotSugg(false); return; }
    const r = await motoristaService.buscarPorNome(ctx.empresaId, ctx.filialId, termo);
    setMotSugg(r); setMotHi(0); setShowMotSugg(r.length > 0);
  };
  const selectMotorista = (m: Motorista) => {
    setMotoristaId(m.id);
    setMotoristaNome(m.nome);
    setMotoristaDocumento(m.documento || "");
    setShowMotSugg(false);
  };
  const handleMotKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showMotSugg || motSugg.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setMotHi((i) => (i + 1) % motSugg.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setMotHi((i) => (i - 1 + motSugg.length) % motSugg.length); }
    else if (e.key === "Enter") { e.preventDefault(); const m = motSugg[motHi]; if (m) selectMotorista(m); }
    else if (e.key === "Escape") setShowMotSugg(false);
  };
  const handleMotBlur = () => {
    if (blurMotRef.current) window.clearTimeout(blurMotRef.current);
    blurMotRef.current = window.setTimeout(async () => {
      setShowMotSugg(false);
      if (!motoristaNome.trim() || motoristaId) return;
      const r = await motoristaService.buscarPorNome(ctx.empresaId, ctx.filialId, motoristaNome);
      const exact = r.find((m) => m.nome.toLowerCase() === motoristaNome.trim().toLowerCase());
      if (exact) { selectMotorista(exact); return; }
      if (!quickMotOpen) {
        setQuickMotNome(motoristaNome);
        setQuickMotDoc("");
        setQuickMotOpen(true);
      }
    }, 200);
  };
  const quickRegMotorista = async () => {
    if (!quickMotNome.trim()) { toast({ title: "Informe o nome", variant: "destructive" }); return; }
    const m = await motoristaService.salvar({ nome: quickMotNome.trim(), documento: quickMotDoc.trim() }, ctx);
    setMotoristaId(m.id); setMotoristaNome(m.nome); setMotoristaDocumento(m.documento || "");
    setQuickMotOpen(false);
    toast({ title: "Motorista cadastrado" });
  };

  // ===== Veículo =====
  const searchVeiculo = async (termo: string) => {
    const up = termo.toUpperCase();
    setPlacaVeiculo(up);
    setVeiculoId("");
    setTipoVeiculo("");
    if (up.length < 2) { setShowVeicSugg(false); return; }
    const r = await veiculoService.buscarPorPlaca(ctx.empresaId, ctx.filialId, up);
    setVeicSugg(r); setVeicHi(0); setShowVeicSugg(r.length > 0);
  };
  const selectVeiculo = (v: Veiculo) => {
    setVeiculoId(v.id);
    setPlacaVeiculo(v.placa);
    setTipoVeiculo(v.tipoVeiculo || "");
    setShowVeicSugg(false);
  };
  const handleVeicKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showVeicSugg || veicSugg.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setVeicHi((i) => (i + 1) % veicSugg.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setVeicHi((i) => (i - 1 + veicSugg.length) % veicSugg.length); }
    else if (e.key === "Enter") { e.preventDefault(); const v = veicSugg[veicHi]; if (v) selectVeiculo(v); }
    else if (e.key === "Escape") setShowVeicSugg(false);
  };
  const handleVeicBlur = () => {
    if (blurVeicRef.current) window.clearTimeout(blurVeicRef.current);
    blurVeicRef.current = window.setTimeout(async () => {
      setShowVeicSugg(false);
      if (!placaVeiculo.trim() || veiculoId) return;
      const r = await veiculoService.buscarPorPlaca(ctx.empresaId, ctx.filialId, placaVeiculo);
      const exact = r.find((v) => v.placa.toUpperCase() === placaVeiculo.trim().toUpperCase());
      if (exact) { selectVeiculo(exact); return; }
      if (!quickVeicOpen) {
        setQuickVeicPlaca(placaVeiculo);
        setQuickVeicTipo("");
        setQuickVeicOpen(true);
      }
    }, 200);
  };
  const quickRegVeiculo = async () => {
    if (!quickVeicPlaca.trim()) { toast({ title: "Informe a placa", variant: "destructive" }); return; }
    const v = await veiculoService.salvar(
      { placa: quickVeicPlaca.trim().toUpperCase(), tipoVeiculo: quickVeicTipo.trim() },
      ctx
    );
    setVeiculoId(v.id); setPlacaVeiculo(v.placa); setTipoVeiculo(v.tipoVeiculo || "");
    setQuickVeicOpen(false);
    toast({ title: "Veículo cadastrado" });
  };

  const handleSalvar = async () => {
    if (!produtoId || !pontoEstoqueId) {
      toast({ title: "Selecione produto e ponto de estoque", variant: "destructive" });
      return;
    }
    if (!motoristaId || !motoristaNome.trim()) {
      toast({ title: "Informe o motorista (cadastre se necessário)", variant: "destructive" });
      return;
    }
    if (!veiculoId || !placaVeiculo.trim()) {
      toast({ title: "Informe o veículo (cadastre se necessário)", variant: "destructive" });
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
        toast({ title: "Romaneio já existe", description: "Selecione-o na listagem.", variant: "destructive" });
        return;
      }
      const novo = await romaneioService.salvar(
        {
          origem: "AVULSO",
          tipoRomaneio,
          produtoId,
          pontoEstoqueId,
          motoristaId,
          motoristaNome,
          motoristaDocumento,
          veiculoId,
          placaVeiculo,
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
    <>
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
              <div className="relative">
                <Label>Motorista *</Label>
                <Input
                  value={motoristaNome}
                  onChange={(e) => searchMotorista(e.target.value)}
                  onKeyDown={handleMotKey}
                  onBlur={handleMotBlur}
                  onFocus={() => motSugg.length > 0 && setShowMotSugg(true)}
                  placeholder="Digite o nome do motorista"
                  autoComplete="off"
                />
                {showMotSugg && (
                  <div className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded-md border bg-popover shadow-md">
                    {motSugg.map((m, i) => (
                      <button
                        type="button"
                        key={m.id}
                        onMouseDown={(e) => { e.preventDefault(); selectMotorista(m); }}
                        className={`block w-full text-left px-3 py-2 text-sm hover:bg-accent ${i === motHi ? "bg-accent" : ""}`}
                      >
                        <div className="font-medium">{m.nome}</div>
                        {m.documento && <div className="text-xs text-muted-foreground">{m.documento}</div>}
                      </button>
                    ))}
                  </div>
                )}
                {motoristaDocumento && (
                  <p className="text-xs text-muted-foreground mt-1">Doc: {motoristaDocumento}</p>
                )}
              </div>
              <div className="relative">
                <Label>Veículo (Placa) *</Label>
                <Input
                  value={placaVeiculo}
                  onChange={(e) => searchVeiculo(e.target.value)}
                  onKeyDown={handleVeicKey}
                  onBlur={handleVeicBlur}
                  onFocus={() => veicSugg.length > 0 && setShowVeicSugg(true)}
                  placeholder="Digite a placa"
                  autoComplete="off"
                  className="font-mono uppercase"
                />
                {showVeicSugg && (
                  <div className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded-md border bg-popover shadow-md">
                    {veicSugg.map((v, i) => (
                      <button
                        type="button"
                        key={v.id}
                        onMouseDown={(e) => { e.preventDefault(); selectVeiculo(v); }}
                        className={`block w-full text-left px-3 py-2 text-sm hover:bg-accent ${i === veicHi ? "bg-accent" : ""}`}
                      >
                        <div className="font-mono font-medium">{v.placa}</div>
                        {v.tipoVeiculo && <div className="text-xs text-muted-foreground">{v.tipoVeiculo}</div>}
                      </button>
                    ))}
                  </div>
                )}
                {tipoVeiculo && (
                  <p className="text-xs text-muted-foreground mt-1">Tipo: {tipoVeiculo}</p>
                )}
              </div>
            </FormRow>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSalvar} disabled={saving}>Avançar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick add Motorista */}
      <Dialog open={quickMotOpen} onOpenChange={setQuickMotOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Cadastrar Motorista</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Nome *</Label>
              <Input value={quickMotNome} onChange={(e) => setQuickMotNome(e.target.value)} autoFocus />
            </div>
            <div>
              <Label>CPF / Documento</Label>
              <Input value={quickMotDoc} onChange={(e) => setQuickMotDoc(e.target.value)} placeholder="Opcional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickMotOpen(false)}>Cancelar</Button>
            <Button onClick={quickRegMotorista}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick add Veículo */}
      <Dialog open={quickVeicOpen} onOpenChange={setQuickVeicOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Cadastrar Veículo</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Placa *</Label>
              <Input
                value={quickVeicPlaca}
                onChange={(e) => setQuickVeicPlaca(e.target.value.toUpperCase())}
                className="font-mono uppercase"
                autoFocus
              />
            </div>
            <div>
              <Label>Tipo de Veículo</Label>
              <Input value={quickVeicTipo} onChange={(e) => setQuickVeicTipo(e.target.value)} placeholder="Ex: Truck, Carreta..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickVeicOpen(false)}>Cancelar</Button>
            <Button onClick={quickRegVeiculo}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
