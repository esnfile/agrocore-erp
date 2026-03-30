import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useOrganization } from "@/contexts/OrganizationContext";
import { pontoEstoqueService, movimentacaoEstoqueService, empresaService, filialService } from "@/lib/services";
import {
  produtos as mockProdutos,
  unidadesMedida as mockUnidades,
} from "@/lib/mock-data";
import type { PontoEstoque, MovimentacaoEstoque, Produto, UnidadeMedida, Empresa, Filial } from "@/lib/mock-data";

const schema = z.object({
  produtoId: z.string().min(1, "Produto é obrigatório"),
  pontoEstoqueId: z.string().min(1, "Ponto de estoque é obrigatório"),
  tipoMovimento: z.enum(["ENTRADA", "SAIDA", "AJUSTE"]),
  unidadeMovimentacaoId: z.string().min(1, "Unidade é obrigatória"),
  quantidadeInformada: z.coerce.number().positive("Quantidade deve ser maior que 0"),
  dataMovimentacao: z.string().min(1, "Data é obrigatória"),
  observacao: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function MovimentacaoEstoquePage() {
  const { grupoAtual, empresaAtual, filialAtual, empresas: empresasCtx } = useOrganization();
  const selectedGrupo = grupoAtual?.id ?? null;

  // Empresa/Filial local (permite alteração manual)
  const [empresasList, setEmpresasList] = useState<Empresa[]>([]);
  const [filiaisList, setFiliaisList] = useState<Filial[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>(empresaAtual?.id ?? "");
  const [selectedFilial, setSelectedFilial] = useState<string>(filialAtual?.id ?? "");

  const [pontos, setPontos] = useState<PontoEstoque[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      produtoId: "", pontoEstoqueId: "", tipoMovimento: "ENTRADA",
      unidadeMovimentacaoId: "", quantidadeInformada: 0,
      dataMovimentacao: new Date().toISOString().slice(0, 10), observacao: "",
    },
  });

  const produtoId = watch("produtoId");
  const unidadeMovimentacaoId = watch("unidadeMovimentacaoId");
  const quantidadeInformada = watch("quantidadeInformada");

  // Sync from context when context changes
  useEffect(() => {
    if (empresaAtual) setSelectedEmpresa(empresaAtual.id);
  }, [empresaAtual]);
  useEffect(() => {
    if (filialAtual) setSelectedFilial(filialAtual.id);
  }, [filialAtual]);

  // Load empresas do grupo
  useEffect(() => {
    if (selectedGrupo) {
      empresaService.listar(selectedGrupo).then(setEmpresasList);
    }
  }, [selectedGrupo]);

  // Load filiais da empresa selecionada
  useEffect(() => {
    if (selectedEmpresa) {
      filialService.listarPorEmpresa(selectedEmpresa).then((list) => {
        setFiliaisList(list);
        if (!list.find((f) => f.id === selectedFilial) && list.length > 0) {
          setSelectedFilial(list[0].id);
        }
      });
    } else {
      setFiliaisList([]);
      setSelectedFilial("");
    }
  }, [selectedEmpresa]);

  // Produtos ativos filtrados
  const produtosAtivos = useMemo(
    () => mockProdutos.filter((p) => p.deletadoEm === null && p.ativo && p.empresaId === selectedEmpresa),
    [selectedEmpresa]
  );

  // Produto selecionado
  const produtoSelecionado = useMemo(
    () => produtosAtivos.find((p) => p.id === produtoId),
    [produtoId, produtosAtivos]
  );

  // Unidades compatíveis com a unidade base do produto
  const unidadesCompativeis = useMemo(() => {
    if (!produtoSelecionado) return [];
    const unidadeBase = mockUnidades.find((u) => u.id === produtoSelecionado.unidadeBaseId && u.deletadoEm === null);
    if (!unidadeBase) return [];
    return mockUnidades.filter((u) => u.deletadoEm === null && u.ativo && u.tipo === unidadeBase.tipo);
  }, [produtoSelecionado]);

  // Unidade base do produto
  const unidadeBase = useMemo(() => {
    if (!produtoSelecionado) return null;
    return mockUnidades.find((u) => u.id === produtoSelecionado.unidadeBaseId && u.deletadoEm === null) ?? null;
  }, [produtoSelecionado]);

  // Conversão em tempo real
  const quantidadeConvertida = useMemo(() => {
    if (!produtoSelecionado || !unidadeMovimentacaoId || !quantidadeInformada || quantidadeInformada <= 0) return null;
    if (unidadeMovimentacaoId === produtoSelecionado.unidadeBaseId) return quantidadeInformada;
    if (unidadeMovimentacaoId === produtoSelecionado.unidadeEntradaId) return quantidadeInformada * produtoSelecionado.quantidadeEmbalagemEntrada;
    if (unidadeMovimentacaoId === produtoSelecionado.unidadeSaidaId) return quantidadeInformada * produtoSelecionado.quantidadeEmbalagemSaida;
    const unidadeMov = mockUnidades.find((u) => u.id === unidadeMovimentacaoId);
    const unBase = mockUnidades.find((u) => u.id === produtoSelecionado.unidadeBaseId);
    if (unidadeMov && unBase && unBase.fatorBase > 0) return (quantidadeInformada * unidadeMov.fatorBase) / unBase.fatorBase;
    return null;
  }, [quantidadeInformada, unidadeMovimentacaoId, produtoSelecionado]);

  useEffect(() => {
    if (selectedEmpresa && selectedFilial) {
      pontoEstoqueService.listar(selectedEmpresa, selectedFilial).then(setPontos);
      movimentacaoEstoqueService.listar(selectedEmpresa, selectedFilial).then(setMovimentacoes);
    } else {
      setPontos([]);
      setMovimentacoes([]);
    }
  }, [selectedEmpresa, selectedFilial]);

  // Limpar unidade ao trocar produto
  useEffect(() => {
    if (produtoSelecionado) {
      setValue("unidadeMovimentacaoId", produtoSelecionado.unidadeBaseId);
    } else {
      setValue("unidadeMovimentacaoId", "");
    }
  }, [produtoId]);

  const onSubmit = handleSubmit(async (formData) => {
    if (!selectedGrupo || !selectedEmpresa || !selectedFilial) {
      toast({ title: "Erro", description: "Selecione Grupo, Empresa e Filial.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const result = await movimentacaoEstoqueService.registrar(
        {
          produtoId: formData.produtoId,
          pontoEstoqueId: formData.pontoEstoqueId,
          tipoMovimento: formData.tipoMovimento,
          quantidadeInformada: formData.quantidadeInformada,
          unidadeMovimentacaoId: formData.unidadeMovimentacaoId,
          dataMovimentacao: formData.dataMovimentacao,
          observacao: formData.observacao ?? "",
        },
        { grupoId: selectedGrupo, empresaId: selectedEmpresa, filialId: selectedFilial }
      );
      if (result.sucesso) {
        toast({ title: "Sucesso", description: result.mensagem });
        reset({
          produtoId: "", pontoEstoqueId: "", tipoMovimento: "ENTRADA",
          unidadeMovimentacaoId: "", quantidadeInformada: 0,
          dataMovimentacao: new Date().toISOString().slice(0, 10), observacao: "",
        });
        movimentacaoEstoqueService.listar(selectedEmpresa, selectedFilial).then(setMovimentacoes);
      } else {
        toast({ title: "Erro", description: result.mensagem, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro", description: "Falha ao registrar movimentação.", variant: "destructive" });
    } finally { setSaving(false); }
  });

  const getNomeProduto = (id: string) => mockProdutos.find((p) => p.id === id)?.descricao ?? id;
  const getNomePonto = (id: string) => pontos.find((p) => p.id === id)?.descricao ?? id;
  const getCodigoUnidade = (id: string) => mockUnidades.find((u) => u.id === id)?.codigo ?? id;

  if (!selectedGrupo) {
    return (
      <>
        <PageHeader title="Movimentação de Estoque" description="Registrar entradas, saídas e ajustes de estoque" />
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Selecione um Grupo para registrar movimentações.
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Movimentação de Estoque" description="Registrar entradas, saídas e ajustes de estoque" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Nova Movimentação</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Empresa e Filial no topo */}
              <div className="space-y-1.5">
                <Label>Empresa <span className="text-destructive">*</span></Label>
                <Select value={selectedEmpresa} onValueChange={(v) => setSelectedEmpresa(v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {empresasList.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Filial <span className="text-destructive">*</span></Label>
                <Select value={selectedFilial} onValueChange={(v) => setSelectedFilial(v)} disabled={!selectedEmpresa}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {filiaisList.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.nomeRazao}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Produto <span className="text-destructive">*</span></Label>
                <Select value={produtoId} onValueChange={(v) => setValue("produtoId", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {produtosAtivos.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.descricao}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.produtoId && <p className="text-xs text-destructive">{errors.produtoId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Ponto de Estoque <span className="text-destructive">*</span></Label>
                <Select value={watch("pontoEstoqueId")} onValueChange={(v) => setValue("pontoEstoqueId", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {pontos.filter((p) => p.ativo).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.descricao}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.pontoEstoqueId && <p className="text-xs text-destructive">{errors.pontoEstoqueId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Tipo de Movimento <span className="text-destructive">*</span></Label>
                <Select value={watch("tipoMovimento")} onValueChange={(v) => setValue("tipoMovimento", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENTRADA">Entrada</SelectItem>
                    <SelectItem value="SAIDA">Saída</SelectItem>
                    <SelectItem value="AJUSTE">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Unidade <span className="text-destructive">*</span></Label>
                <Select
                  value={unidadeMovimentacaoId}
                  onValueChange={(v) => setValue("unidadeMovimentacaoId", v)}
                  disabled={!produtoSelecionado}
                >
                  <SelectTrigger><SelectValue placeholder={produtoSelecionado ? "Selecione..." : "Selecione um produto primeiro"} /></SelectTrigger>
                  <SelectContent>
                    {unidadesCompativeis.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.codigo} — {u.descricao}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unidadeMovimentacaoId && <p className="text-xs text-destructive">{errors.unidadeMovimentacaoId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Quantidade <span className="text-destructive">*</span></Label>
                <Input type="number" step="0.000001" min="0" {...register("quantidadeInformada")} />
                {errors.quantidadeInformada && <p className="text-xs text-destructive">{errors.quantidadeInformada.message}</p>}
              </div>

              {quantidadeConvertida !== null && unidadeBase && (
                <div className="rounded-md bg-muted p-3 text-sm">
                  Quantidade convertida para unidade base:{" "}
                  <strong>{Number(quantidadeConvertida).toFixed(6)} {unidadeBase.codigo}</strong>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Data <span className="text-destructive">*</span></Label>
                <Input type="date" {...register("dataMovimentacao")} />
                {errors.dataMovimentacao && <p className="text-xs text-destructive">{errors.dataMovimentacao.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Observação</Label>
                <Textarea rows={3} {...register("observacao")} />
              </div>

              <Button type="submit" className="w-full" disabled={saving || !selectedEmpresa || !selectedFilial}>
                {saving ? "Salvando..." : "Confirmar Movimentação"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Movimentações Recentes</CardTitle></CardHeader>
          <CardContent>
            {movimentacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma movimentação registrada.</p>
            ) : (
              <div className="overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Ponto</TableHead>
                      <TableHead className="text-right">Qtd. Informada</TableHead>
                      <TableHead className="text-right">Qtd. Base</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimentacoes.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>{format(new Date(m.dataMovimentacao), "dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          <Badge variant={m.tipoMovimento === "ENTRADA" ? "default" : m.tipoMovimento === "SAIDA" ? "destructive" : "secondary"}>
                            {m.tipoMovimento === "ENTRADA" ? "Entrada" : m.tipoMovimento === "SAIDA" ? "Saída" : "Ajuste"}
                          </Badge>
                        </TableCell>
                        <TableCell>{getNomeProduto(m.produtoId)}</TableCell>
                        <TableCell>{getNomePonto(m.pontoEstoqueId)}</TableCell>
                        <TableCell className="text-right">{Number(m.quantidadeInformada).toFixed(6)} {getCodigoUnidade(m.unidadeMovimentacaoId)}</TableCell>
                        <TableCell className="text-right">{Number(m.quantidadeConvertidaBase).toFixed(6)} {unidadeBase?.codigo ?? ""}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
