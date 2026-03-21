import { useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { CrudModal } from "@/components/CrudModal";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  romaneioService, romaneioPesagemService,
  motoristaService, veiculoService, contratoService,
  pontoEstoqueService,
} from "@/lib/services";
import { produtos as mockProdutos } from "@/lib/mock-data";
import type { Romaneio, RomaneioPesagem, Motorista, Veiculo, Contrato, TipoPesagem, PontoEstoque } from "@/lib/mock-data";
import { Plus, Scale, XCircle, CheckCircle, Link2, Pencil, Check } from "lucide-react";

const romaneioSchema = z.object({
  produtoId: z.string().min(1, "Produto é obrigatório"),
  contratoId: z.string().optional(),
  motoristaNome: z.string().min(1, "Nome do motorista é obrigatório"),
  motoristaDocumento: z.string().optional().default(""),
  placaVeiculo: z.string().min(1, "Placa é obrigatória"),
  pontoEstoqueId: z.string().optional().default(""),
  observacao: z.string().optional().default(""),
});
type RomaneioFormData = z.infer<typeof romaneioSchema>;

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ABERTO: "default",
  FINALIZADO: "outline",
  AGUARDANDO_CONTRATO: "secondary",
  CANCELADO: "destructive",
};
const statusLabels: Record<string, string> = {
  ABERTO: "Aberto",
  FINALIZADO: "Finalizado",
  AGUARDANDO_CONTRATO: "Aguard. Contrato",
  CANCELADO: "Cancelado",
};

// Quality classification bases
const CLASSIFICACAO_BASES = {
  umidade: { label: "Umidade", base: 14 },
  impureza: { label: "Impureza", base: 1 },
  ardidos: { label: "Ardidos", base: 8 },
  avariados: { label: "Avariados", base: 0 },
} as const;

function calcularPesoSecoLimpo(pesoBruto: number, umidade: number, impureza: number, ardidos: number, avariados: number) {
  const descUmidade = Math.max(0, umidade - CLASSIFICACAO_BASES.umidade.base);
  const descImpureza = Math.max(0, impureza - CLASSIFICACAO_BASES.impureza.base);
  const descArdidos = Math.max(0, ardidos - CLASSIFICACAO_BASES.ardidos.base);
  const descAvariados = Math.max(0, avariados - CLASSIFICACAO_BASES.avariados.base);

  let peso = pesoBruto;
  const steps: { label: string; descPerc: number; descKg: number; pesoApos: number }[] = [];

  const applyDiscount = (label: string, perc: number) => {
    const descKg = peso * (perc / 100);
    peso -= descKg;
    steps.push({ label, descPerc: perc, descKg, pesoApos: peso });
  };

  applyDiscount("Umidade", descUmidade);
  applyDiscount("Impureza", descImpureza);
  applyDiscount("Ardidos", descArdidos);
  applyDiscount("Avariados", descAvariados);

  return { pesoFinal: peso, steps, totalDescontado: pesoBruto - peso };
}

export default function RomaneiosPage() {
  const { empresaAtual, filialAtual, grupoAtual } = useOrganization();
  const [romaneios, setRomaneios] = useState<Romaneio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [selected, setSelected] = useState<Romaneio | null>(null);
  const [pesagens, setPesagens] = useState<RomaneioPesagem[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);

  const [pesagemOpen, setPesagemOpen] = useState(false);
  const [pesagemTipo, setPesagemTipo] = useState<TipoPesagem>("ENTRADA");
  const [pesagemPeso, setPesagemPeso] = useState("");

  const [motoristaSuggestions, setMotoristaSuggestions] = useState<Motorista[]>([]);
  const [veiculoSuggestions, setVeiculoSuggestions] = useState<Veiculo[]>([]);
  const [showMotSugg, setShowMotSugg] = useState(false);
  const [showVeicSugg, setShowVeicSugg] = useState(false);

  const [quickMotOpen, setQuickMotOpen] = useState(false);
  const [quickMotNome, setQuickMotNome] = useState("");
  const [quickMotDoc, setQuickMotDoc] = useState("");
  const [quickVeicOpen, setQuickVeicOpen] = useState(false);
  const [quickVeicPlaca, setQuickVeicPlaca] = useState("");
  const [quickVeicTipo, setQuickVeicTipo] = useState("");

  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [pontosEstoque, setPontosEstoque] = useState<PontoEstoque[]>([]);

  const [vincularOpen, setVincularOpen] = useState(false);
  const [vincularContratoId, setVincularContratoId] = useState("");

  const [editPontoOpen, setEditPontoOpen] = useState(false);
  const [editPontoId, setEditPontoId] = useState("");

  // Pesagem inline editing
  const [editingPesagemId, setEditingPesagemId] = useState<string | null>(null);
  const [editPesagemPeso, setEditPesagemPeso] = useState(0);
  const [editPesagemTipo, setEditPesagemTipo] = useState<TipoPesagem>("ENTRADA");

  // Quality classification editing
  const [classUmidade, setClassUmidade] = useState(0);
  const [classImpureza, setClassImpureza] = useState(0);
  const [classArdidos, setClassArdidos] = useState(0);
  const [classAvariados, setClassAvariados] = useState(0);

  const form = useForm<RomaneioFormData>({
    resolver: zodResolver(romaneioSchema),
    defaultValues: { produtoId: "", contratoId: "", motoristaNome: "", motoristaDocumento: "", placaVeiculo: "", pontoEstoqueId: "", observacao: "" },
  });

  const ctx = grupoAtual && empresaAtual && filialAtual
    ? { grupoId: grupoAtual.id, empresaId: empresaAtual.id, filialId: filialAtual.id }
    : null;

  const load = useCallback(async () => {
    if (!empresaAtual || !filialAtual) return;
    setLoading(true);
    const data = await romaneioService.listar(empresaAtual.id, filialAtual.id);
    setRomaneios(data);
    setLoading(false);
  }, [empresaAtual, filialAtual]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!empresaAtual || !filialAtual) return;
    contratoService.listar(empresaAtual.id, filialAtual.id).then(setContratos);
    pontoEstoqueService.listar(empresaAtual.id, filialAtual.id).then(setPontosEstoque);
  }, [empresaAtual, filialAtual]);

  const produtos = mockProdutos.filter((p) => p.deletadoEm === null);

  const openNew = () => {
    form.reset({ produtoId: "", contratoId: "", motoristaNome: "", motoristaDocumento: "", placaVeiculo: "", pontoEstoqueId: "", observacao: "" });
    setModalOpen(true);
  };

  const searchMotorista = async (termo: string) => {
    form.setValue("motoristaNome", termo);
    if (!ctx || termo.length < 2) { setShowMotSugg(false); return; }
    const results = await motoristaService.buscarPorNome(ctx.empresaId, ctx.filialId, termo);
    setMotoristaSuggestions(results);
    setShowMotSugg(results.length > 0);
  };
  const selectMotorista = (m: Motorista) => { form.setValue("motoristaNome", m.nome); form.setValue("motoristaDocumento", m.documento); setShowMotSugg(false); };

  const searchVeiculo = async (termo: string) => {
    form.setValue("placaVeiculo", termo.toUpperCase());
    if (!ctx || termo.length < 2) { setShowVeicSugg(false); return; }
    const results = await veiculoService.buscarPorPlaca(ctx.empresaId, ctx.filialId, termo);
    setVeiculoSuggestions(results);
    setShowVeicSugg(results.length > 0);
  };
  const selectVeiculo = (v: Veiculo) => { form.setValue("placaVeiculo", v.placa); setShowVeicSugg(false); };

  const quickRegisterMotorista = async () => {
    if (!ctx || !quickMotNome) return;
    const m = await motoristaService.salvar({ nome: quickMotNome, documento: quickMotDoc }, ctx);
    form.setValue("motoristaNome", m.nome);
    form.setValue("motoristaDocumento", m.documento);
    setQuickMotOpen(false); setQuickMotNome(""); setQuickMotDoc("");
    toast({ title: "Motorista cadastrado rapidamente" });
  };

  const quickRegisterVeiculo = async () => {
    if (!ctx || !quickVeicPlaca) return;
    const v = await veiculoService.salvar({ placa: quickVeicPlaca.toUpperCase(), tipoVeiculo: quickVeicTipo }, ctx);
    form.setValue("placaVeiculo", v.placa);
    setQuickVeicOpen(false); setQuickVeicPlaca(""); setQuickVeicTipo("");
    toast({ title: "Veículo cadastrado rapidamente" });
  };

  const onSubmit = async () => {
    const valid = await form.trigger();
    if (!valid || !ctx) return;
    const data = form.getValues();
    setSaving(true);
    await romaneioService.salvar({
      produtoId: data.produtoId,
      contratoId: data.contratoId || null,
      motoristaNome: data.motoristaNome,
      motoristaDocumento: data.motoristaDocumento,
      placaVeiculo: data.placaVeiculo,
      pontoEstoqueId: data.pontoEstoqueId || null,
      observacao: data.observacao,
    }, ctx);
    toast({ title: "Romaneio criado com sucesso" });
    setSaving(false);
    setModalOpen(false);
    load();
  };

  const openDetail = async (rom: Romaneio) => {
    setSelected(rom);
    const p = await romaneioPesagemService.listarPorRomaneio(rom.id);
    setPesagens(p);
    setEditingPesagemId(null);
    setClassUmidade(rom.classificacaoUmidade || 0);
    setClassImpureza(rom.classificacaoImpureza || 0);
    setClassArdidos(rom.classificacaoArdidos || 0);
    setClassAvariados(rom.classificacaoAvariados || 0);
    setDetailOpen(true);
  };

  const refreshDetail = async () => {
    if (!selected) return;
    const updated = await romaneioService.obterPorId(selected.id);
    if (updated) {
      setSelected(updated);
      setClassUmidade(updated.classificacaoUmidade || 0);
      setClassImpureza(updated.classificacaoImpureza || 0);
      setClassArdidos(updated.classificacaoArdidos || 0);
      setClassAvariados(updated.classificacaoAvariados || 0);
    }
    const p = await romaneioPesagemService.listarPorRomaneio(selected.id);
    setPesagens(p);
    setEditingPesagemId(null);
    load();
  };

  const addPesagem = async () => {
    if (!selected || !ctx || !pesagemPeso) return;
    const peso = parseFloat(pesagemPeso);
    if (isNaN(peso) || peso <= 0) { toast({ title: "Peso inválido", variant: "destructive" }); return; }
    const result = await romaneioPesagemService.salvar({ romaneioId: selected.id, tipoPesagem: pesagemTipo, peso }, ctx);
    if ("erro" in result) {
      toast({ title: result.erro, variant: "destructive" }); return;
    }
    toast({ title: `Pesagem de ${pesagemTipo === "ENTRADA" ? "entrada" : "saída"} registrada` });
    setPesagemOpen(false); setPesagemPeso("");
    refreshDetail();
  };

  // Edit pesagem inline
  const salvarEdicaoPesagem = async () => {
    if (!editingPesagemId) return;
    const result = await romaneioPesagemService.editarPesagem(editingPesagemId, editPesagemPeso, editPesagemTipo);
    if (result.sucesso) {
      toast({ title: result.mensagem });
    } else {
      toast({ title: result.mensagem, variant: "destructive" });
      return;
    }
    refreshDetail();
  };

  // Save classification
  const salvarClassificacao = async () => {
    if (!selected || !ctx) return;
    const pesoBase = selected.pesoLiquido > 0 ? selected.pesoLiquido : 0;
    const result = calcularPesoSecoLimpo(pesoBase, classUmidade, classImpureza, classArdidos, classAvariados);

    if (result.pesoFinal <= 0) {
      toast({ title: "Descontos resultam em peso zerado ou negativo", variant: "destructive" });
      return;
    }

    await romaneioService.salvar({
      id: selected.id,
      classificacaoUmidade: classUmidade,
      classificacaoImpureza: classImpureza,
      classificacaoArdidos: classArdidos,
      classificacaoAvariados: classAvariados,
      pesoLiquidoSecoLimpo: result.pesoFinal,
    }, ctx);
    toast({ title: `Classificação salva. Peso Seco e Limpo: ${result.pesoFinal.toFixed(3)} ton` });
    refreshDetail();
  };

  const pesagensCompletas = pesagens.some((p) => p.tipoPesagem === "ENTRADA") && pesagens.some((p) => p.tipoPesagem === "SAIDA");
  const pesoLiquidoValido = selected ? selected.pesoLiquido > 0 : false;
  const contratoVinculado = selected ? !!selected.contratoId : false;
  const podeFinalizarRomaneio = pesagensCompletas && pesoLiquidoValido && contratoVinculado;

  const finalizarRomaneio = async () => {
    if (!selected) return;
    if (!pesagensCompletas) { toast({ title: "É necessário exatamente 1 pesagem de ENTRADA e 1 de SAÍDA", variant: "destructive" }); return; }
    if (!pesoLiquidoValido) { toast({ title: "❌ Peso Líquido deve ser > 0. Verifique as pesagens.", variant: "destructive" }); return; }
    if (!contratoVinculado) { toast({ title: "⚠️ Romaneio sem contrato vinculado. Vincule antes de finalizar.", variant: "destructive" }); return; }
    const result = await romaneioService.finalizar(selected.id);
    if (result.sucesso) {
      toast({ title: result.mensagem });
    } else {
      toast({ title: result.mensagem, variant: "destructive" });
    }
    refreshDetail();
  };

  const cancelarRomaneio = async () => {
    if (!selected) return;
    await romaneioService.cancelar(selected.id);
    toast({ title: "Romaneio cancelado" });
    refreshDetail();
  };

  const vincularContratoAoRomaneio = async () => {
    if (!selected || !vincularContratoId) return;
    const result = await romaneioService.vincularContrato(selected.id, vincularContratoId);
    if (result.sucesso) {
      toast({ title: result.mensagem });
      setVincularOpen(false); setVincularContratoId("");
      refreshDetail();
    } else {
      toast({ title: result.mensagem, variant: "destructive" });
    }
  };

  const salvarPontoEstoque = async () => {
    if (!selected || !editPontoId || !ctx) return;
    await romaneioService.salvar({ id: selected.id, pontoEstoqueId: editPontoId }, ctx);
    toast({ title: "Ponto de estoque atualizado" });
    setEditPontoOpen(false);
    refreshDetail();
  };

  const onDelete = async () => {
    if (!deleteId) return;
    await romaneioService.excluir(deleteId);
    toast({ title: "Romaneio excluído" });
    setDeleteId(null);
    load();
  };

  const getProdutoNome = (id: string) => produtos.find((p) => p.id === id)?.descricao || id;
  const getContratoNum = (id: string | null) => {
    if (!id) return "—";
    const c = contratos.find((ct) => ct.id === id);
    return c ? c.numeroContrato : id;
  };
  const getPontoNome = (id: string | null) => {
    if (!id) return "Não definido";
    const p = pontosEstoque.find((pe) => pe.id === id);
    return p ? p.descricao : id;
  };

  // Computed classification values
  const pesoBaseClassificacao = selected ? (selected.pesoLiquido > 0 ? selected.pesoLiquido : 0) : 0;
  const classificacaoResult = useMemo(
    () => calcularPesoSecoLimpo(pesoBaseClassificacao, classUmidade, classImpureza, classArdidos, classAvariados),
    [pesoBaseClassificacao, classUmidade, classImpureza, classArdidos, classAvariados]
  );

  const isEditable = selected && (selected.status === "ABERTO" || selected.status === "AGUARDANDO_CONTRATO");

  const columns: Column<Romaneio>[] = [
    { key: "id", header: "ID", render: (row) => row.id.substring(0, 8) },
    { key: "produtoId", header: "Produto", render: (row) => getProdutoNome(row.produtoId) },
    { key: "contratoId", header: "Contrato", render: (row) => getContratoNum(row.contratoId) },
    { key: "motoristaNome", header: "Motorista", render: (row) => row.motoristaNome },
    { key: "placaVeiculo", header: "Placa", render: (row) => row.placaVeiculo },
    { key: "pesoLiquido", header: "Peso Líq. (ton)", render: (row) => row.pesoLiquidoSecoLimpo > 0 ? row.pesoLiquidoSecoLimpo.toFixed(3) : (row.pesoLiquido > 0 ? row.pesoLiquido.toFixed(3) : "—") },
    { key: "status", header: "Status", render: (row) => <Badge variant={statusColors[row.status] || "default"}>{statusLabels[row.status] || row.status}</Badge> },
    { key: "criadoEm", header: "Data", render: (row) => format(new Date(row.criadoEm), "dd/MM/yyyy HH:mm") },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Romaneios" description="Gestão de romaneios e pesagens" />

      <DataTable
        columns={columns}
        data={romaneios}
        loading={loading}
        onNew={openNew}
        onEdit={(item) => openDetail(item)}
        onDelete={(item) => item.status !== "FINALIZADO" ? setDeleteId(item.id) : undefined}
      />

      {/* New Romaneio Modal */}
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Romaneio" saving={saving} onSave={onSubmit}>
        <div className="space-y-4">
          <div>
            <Label>Produto *</Label>
            <Select value={form.watch("produtoId")} onValueChange={(v) => form.setValue("produtoId", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
              <SelectContent>
                {produtos.map((p) => <SelectItem key={p.id} value={p.id}>{p.descricao}</SelectItem>)}
              </SelectContent>
            </Select>
            {form.formState.errors.produtoId && <p className="text-sm text-destructive mt-1">{form.formState.errors.produtoId.message}</p>}
          </div>

          <div>
            <Label>Contrato (opcional)</Label>
            <Select value={form.watch("contratoId") || "none"} onValueChange={(v) => form.setValue("contratoId", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Sem contrato (avulso)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem contrato (avulso)</SelectItem>
                {contratos.filter((c) => c.status === "ABERTO" || c.status === "PARCIAL").map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.numeroContrato} — {c.tipoContrato}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Ponto de Estoque</Label>
            <Select value={form.watch("pontoEstoqueId") || "none"} onValueChange={(v) => form.setValue("pontoEstoqueId", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Selecione (obrigatório p/ finalizar)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {pontosEstoque.filter((p) => p.ativo).map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.descricao} ({p.tipo})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Motorista with search */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label>Motorista *</Label>
                <div className="relative">
                  <Input
                    value={form.watch("motoristaNome")}
                    onChange={(e) => searchMotorista(e.target.value)}
                    placeholder="Digite o nome do motorista"
                    onBlur={() => setTimeout(() => setShowMotSugg(false), 200)}
                  />
                  {showMotSugg && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
                      {motoristaSuggestions.map((m) => (
                        <button key={m.id} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-accent" onClick={() => selectMotorista(m)}>
                          {m.nome} {m.documento && `— ${m.documento}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button type="button" variant="outline" size="icon" className="mt-5" onClick={() => { setQuickMotNome(form.watch("motoristaNome")); setQuickMotOpen(true); }} title="Cadastro rápido">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.formState.errors.motoristaNome && <p className="text-sm text-destructive mt-1">{form.formState.errors.motoristaNome.message}</p>}
          </div>

          <div><Label>Documento do Motorista</Label><Input {...form.register("motoristaDocumento")} /></div>

          {/* Veículo with search */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label>Placa do Veículo *</Label>
                <div className="relative">
                  <Input
                    value={form.watch("placaVeiculo")}
                    onChange={(e) => searchVeiculo(e.target.value)}
                    placeholder="Digite a placa"
                    onBlur={() => setTimeout(() => setShowVeicSugg(false), 200)}
                  />
                  {showVeicSugg && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
                      {veiculoSuggestions.map((v) => (
                        <button key={v.id} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-accent" onClick={() => selectVeiculo(v)}>
                          {v.placa} {v.tipoVeiculo && `— ${v.tipoVeiculo}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button type="button" variant="outline" size="icon" className="mt-5" onClick={() => { setQuickVeicPlaca(form.watch("placaVeiculo")); setQuickVeicOpen(true); }} title="Cadastro rápido">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.formState.errors.placaVeiculo && <p className="text-sm text-destructive mt-1">{form.formState.errors.placaVeiculo.message}</p>}
          </div>

          <div><Label>Observação</Label><Textarea {...form.register("observacao")} rows={2} /></div>
        </div>
      </CrudModal>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Romaneio {selected?.id.substring(0, 8)}</DialogTitle>
          </DialogHeader>
          {selected && (
            <Tabs defaultValue="geral">
              <TabsList>
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="pesagens">Pesagens</TabsTrigger>
              </TabsList>

              <TabsContent value="geral" className="space-y-4">
                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Produto</CardTitle></CardHeader><CardContent><p className="font-medium">{getProdutoNome(selected.produtoId)}</p></CardContent></Card>
                  <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Contrato</CardTitle></CardHeader><CardContent><p className="font-medium">{getContratoNum(selected.contratoId)}</p></CardContent></Card>
                  <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Motorista</CardTitle></CardHeader><CardContent><p className="font-medium">{selected.motoristaNome}</p><p className="text-sm text-muted-foreground">{selected.motoristaDocumento || "—"}</p></CardContent></Card>
                  <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Veículo</CardTitle></CardHeader><CardContent><p className="font-medium">{selected.placaVeiculo}</p></CardContent></Card>
                </div>

                {/* Ponto de Estoque */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Ponto de Estoque</CardTitle>
                      {isEditable && (
                        <Button variant="ghost" size="sm" onClick={() => { setEditPontoId(selected.pontoEstoqueId || ""); setEditPontoOpen(true); }}>Alterar</Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className={`font-medium ${!selected.pontoEstoqueId ? "text-destructive" : ""}`}>
                      {getPontoNome(selected.pontoEstoqueId)}
                    </p>
                  </CardContent>
                </Card>

                {/* ===== WEIGHT SECTION (READ-ONLY, calculated from pesagens) ===== */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pesos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">Peso Bruto</Label>
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-bold">{selected.pesoBruto > 0 ? `${selected.pesoBruto.toFixed(3)} ton` : "—"}</p>
                          {selected.pesoBruto > 0 && <Badge variant="secondary" className="text-xs">Automático</Badge>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">Peso Tara</Label>
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-bold">{selected.pesoTara > 0 ? `${selected.pesoTara.toFixed(3)} ton` : "—"}</p>
                          {selected.pesoTara > 0 && <Badge variant="secondary" className="text-xs">Automático</Badge>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">Peso Líquido (Bruto - Tara)</Label>
                        <p className={`text-xl font-bold ${selected.pesoLiquido > 0 ? "text-green-700" : ""}`}>
                          {selected.pesoLiquido > 0 ? `${selected.pesoLiquido.toFixed(3)} ton` : "—"}
                        </p>
                      </div>
                    </div>
                    {pesagens.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        💡 Para corrigir pesos, edite as pesagens na aba "Pesagens"
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* ===== QUALITY CLASSIFICATION SECTION ===== */}
                {selected.pesoLiquido > 0 && (
                  <Card className="border-2 border-dashed border-muted">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Classificação de Qualidade</CardTitle>
                        {isEditable && (
                          <Button size="sm" onClick={salvarClassificacao} className="gap-1">
                            <Check className="h-3 w-3" /> Salvar Classificação
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Classification Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Umidade */}
                        <div className="space-y-1 rounded-md border p-3">
                          <Label className="text-xs font-semibold">Umidade (Base {CLASSIFICACAO_BASES.umidade.base}%)</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Valor apurado:</span>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={classUmidade}
                              onChange={(e) => setClassUmidade(parseFloat(e.target.value) || 0)}
                              className="h-8 w-24"
                              disabled={!isEditable}
                            />
                            <span className="text-xs">%</span>
                            {classUmidade > CLASSIFICACAO_BASES.umidade.base && (
                              <span className="text-xs text-orange-600 font-medium">
                                → Desc: -{(classUmidade - CLASSIFICACAO_BASES.umidade.base).toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Impureza */}
                        <div className="space-y-1 rounded-md border p-3">
                          <Label className="text-xs font-semibold">Impureza (Base {CLASSIFICACAO_BASES.impureza.base}%)</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Valor apurado:</span>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={classImpureza}
                              onChange={(e) => setClassImpureza(parseFloat(e.target.value) || 0)}
                              className="h-8 w-24"
                              disabled={!isEditable}
                            />
                            <span className="text-xs">%</span>
                            {classImpureza > CLASSIFICACAO_BASES.impureza.base && (
                              <span className="text-xs text-orange-600 font-medium">
                                → Desc: -{(classImpureza - CLASSIFICACAO_BASES.impureza.base).toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ardidos */}
                        <div className="space-y-1 rounded-md border p-3">
                          <Label className="text-xs font-semibold">Ardidos (Base {CLASSIFICACAO_BASES.ardidos.base}%)</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Valor apurado:</span>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={classArdidos}
                              onChange={(e) => setClassArdidos(parseFloat(e.target.value) || 0)}
                              className="h-8 w-24"
                              disabled={!isEditable}
                            />
                            <span className="text-xs">%</span>
                            {classArdidos > CLASSIFICACAO_BASES.ardidos.base && (
                              <span className="text-xs text-orange-600 font-medium">
                                → Desc: -{(classArdidos - CLASSIFICACAO_BASES.ardidos.base).toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Avariados */}
                        <div className="space-y-1 rounded-md border p-3">
                          <Label className="text-xs font-semibold">Avariados (Base {CLASSIFICACAO_BASES.avariados.base}%)</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Valor apurado:</span>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={classAvariados}
                              onChange={(e) => setClassAvariados(parseFloat(e.target.value) || 0)}
                              className="h-8 w-24"
                              disabled={!isEditable}
                            />
                            <span className="text-xs">%</span>
                            {classAvariados > CLASSIFICACAO_BASES.avariados.base && (
                              <span className="text-xs text-orange-600 font-medium">
                                → Desc: -{(classAvariados - CLASSIFICACAO_BASES.avariados.base).toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Progressive Calculation */}
                      <div className="rounded-md bg-muted/50 p-4 space-y-2">
                        <p className="text-sm font-medium">Cálculo Progressivo de Descontos</p>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Etapa</TableHead>
                              <TableHead className="text-xs text-right">Desconto %</TableHead>
                              <TableHead className="text-xs text-right">Peso Descontado</TableHead>
                              <TableHead className="text-xs text-right">Peso Após</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="text-xs font-medium">Peso Líquido (Bruto - Tara)</TableCell>
                              <TableCell className="text-xs text-right">—</TableCell>
                              <TableCell className="text-xs text-right">—</TableCell>
                              <TableCell className="text-xs text-right font-mono">{pesoBaseClassificacao.toFixed(3)} ton</TableCell>
                            </TableRow>
                            {classificacaoResult.steps.map((step, i) => (
                              <TableRow key={i}>
                                <TableCell className="text-xs">{step.label}</TableCell>
                                <TableCell className="text-xs text-right text-orange-600">
                                  {step.descPerc > 0 ? `-${step.descPerc.toFixed(1)}%` : "0%"}
                                </TableCell>
                                <TableCell className="text-xs text-right text-orange-600 font-mono">
                                  {step.descKg > 0 ? `-${step.descKg.toFixed(3)} ton` : "—"}
                                </TableCell>
                                <TableCell className="text-xs text-right font-mono">{step.pesoApos.toFixed(3)} ton</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">Total de Descontos</p>
                            <p className="text-sm font-bold text-orange-600">
                              {classificacaoResult.totalDescontado.toFixed(3)} ton
                              ({pesoBaseClassificacao > 0 ? ((classificacaoResult.totalDescontado / pesoBaseClassificacao) * 100).toFixed(2) : "0.00"}%)
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Peso Líquido Seco e Limpo</p>
                            <p className={`text-lg font-bold ${classificacaoResult.pesoFinal > 0 ? "text-green-700" : "text-destructive"}`}>
                              ✅ {classificacaoResult.pesoFinal.toFixed(3)} ton
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Status & Timestamp */}
                <div className="flex items-center gap-2">
                  <Badge variant={statusColors[selected.status]}>{statusLabels[selected.status]}</Badge>
                  <span className="text-sm text-muted-foreground">Criado em {format(new Date(selected.criadoEm), "dd/MM/yyyy HH:mm")}</span>
                  {selected.pesoLiquidoSecoLimpo > 0 && (
                    <Badge variant="outline" className="text-green-700 border-green-700">
                      Peso Comercial: {selected.pesoLiquidoSecoLimpo.toFixed(3)} ton
                    </Badge>
                  )}
                </div>

                {selected.observacao && (
                  <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Observação</CardTitle></CardHeader><CardContent><p>{selected.observacao}</p></CardContent></Card>
                )}

                {/* Action Buttons */}
                {isEditable && (
                  <div className="flex gap-2 pt-4 flex-wrap">
                    {selected.status === "AGUARDANDO_CONTRATO" && (
                      <Button variant="outline" onClick={() => { setVincularContratoId(""); setVincularOpen(true); }} className="gap-2">
                        <Link2 className="h-4 w-4" /> Vincular Contrato
                      </Button>
                    )}
                    {selected.status === "ABERTO" && <Button onClick={finalizarRomaneio} className="gap-2"><CheckCircle className="h-4 w-4" /> Finalizar</Button>}
                    <Button variant="destructive" onClick={cancelarRomaneio} className="gap-2"><XCircle className="h-4 w-4" /> Cancelar</Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pesagens" className="space-y-4">
                {isEditable && !pesagensCompletas && (
                  <Button onClick={() => setPesagemOpen(true)} className="gap-2"><Scale className="h-4 w-4" /> Registrar Pesagem</Button>
                )}
                {isEditable && pesagensCompletas && (
                  <p className="text-sm text-muted-foreground">✅ Pesagens completas (1 Entrada + 1 Saída). Use edição para corrigir.</p>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Peso (ton)</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Editado</TableHead>
                      {isEditable && <TableHead className="text-right">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pesagens.length === 0 ? (
                      <TableRow><TableCell colSpan={isEditable ? 5 : 4} className="text-center text-muted-foreground">Nenhuma pesagem registrada</TableCell></TableRow>
                    ) : pesagens.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          {editingPesagemId === p.id ? (
                            <Select value={editPesagemTipo} onValueChange={(v) => setEditPesagemTipo(v as TipoPesagem)}>
                              <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ENTRADA">⬇️ Entrada</SelectItem>
                                <SelectItem value="SAIDA">⬆️ Saída</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant={p.tipoPesagem === "ENTRADA" ? "default" : "secondary"}>
                              {p.tipoPesagem === "ENTRADA" ? "⬇️" : "⬆️"} {p.tipoPesagem}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingPesagemId === p.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                step="0.001"
                                min="0"
                                value={editPesagemPeso}
                                onChange={(e) => setEditPesagemPeso(parseFloat(e.target.value) || 0)}
                                className="h-8 w-28 font-mono"
                                autoFocus
                              />
                              <Button size="sm" variant="ghost" onClick={() => setEditingPesagemId(null)}>Cancelar</Button>
                              <Button size="sm" className="gap-1" onClick={salvarEdicaoPesagem}>
                                <Check className="h-3 w-3" /> Salvar
                              </Button>
                            </div>
                          ) : (
                            <span className="font-mono">{p.peso.toFixed(3)}</span>
                          )}
                        </TableCell>
                        <TableCell>{format(new Date(p.dataHora), "dd/MM/yyyy HH:mm:ss")}</TableCell>
                        <TableCell>
                          {p.editadoEm ? (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(p.editadoEm), "dd/MM/yyyy HH:mm")}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        {isEditable && (
                          <TableCell className="text-right">
                            {editingPesagemId !== p.id && (
                              <Button variant="ghost" size="sm" className="gap-1" onClick={() => {
                                setEditingPesagemId(p.id);
                                setEditPesagemPeso(p.peso);
                                setEditPesagemTipo(p.tipoPesagem);
                              }}>
                                <Pencil className="h-3 w-3" /> Editar
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Calculated summary below pesagens table */}
                {pesagensCompletas && selected && (
                  <div className="rounded-md bg-muted/50 p-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">✅ CALCULADO AUTOMATICAMENTE A PARTIR DAS PESAGENS:</p>
                    <div className="flex gap-6 text-sm">
                      <span>Bruto (ENTRADA): <strong className="font-mono">{selected.pesoBruto.toFixed(3)} ton</strong></span>
                      <span>Tara (SAÍDA): <strong className="font-mono">{selected.pesoTara.toFixed(3)} ton</strong></span>
                      <span>Líquido: <strong className={`font-mono ${selected.pesoLiquido > 0 ? "text-green-700" : "text-destructive"}`}>{selected.pesoLiquido.toFixed(3)} ton</strong></span>
                    </div>
                    {selected.pesoBruto > 0 && selected.pesoTara > 0 && selected.pesoBruto < selected.pesoTara && (
                      <p className="text-xs text-destructive font-medium">⚠️ Peso de ENTRADA é menor que SAÍDA. Verifique as pesagens.</p>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Pesagem Dialog */}
      <Dialog open={pesagemOpen} onOpenChange={setPesagemOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Pesagem</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo de Pesagem</Label>
              <Select value={pesagemTipo} onValueChange={(v) => setPesagemTipo(v as TipoPesagem)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRADA">Entrada</SelectItem>
                  <SelectItem value="SAIDA">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Peso (toneladas)</Label>
              <Input type="number" step="0.001" min="0" value={pesagemPeso} onChange={(e) => setPesagemPeso(e.target.value)} placeholder="0.000" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPesagemOpen(false)}>Cancelar</Button>
            <Button onClick={addPesagem}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vincular Contrato Dialog */}
      <Dialog open={vincularOpen} onOpenChange={setVincularOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Vincular Contrato</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Contrato</Label>
              <Select value={vincularContratoId} onValueChange={setVincularContratoId}>
                <SelectTrigger><SelectValue placeholder="Selecione o contrato" /></SelectTrigger>
                <SelectContent>
                  {contratos.filter((c) => c.status === "ABERTO" || c.status === "PARCIAL").map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.numeroContrato} — {c.tipoContrato}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVincularOpen(false)}>Cancelar</Button>
            <Button onClick={vincularContratoAoRomaneio} disabled={!vincularContratoId}>Vincular</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editar Ponto de Estoque Dialog */}
      <Dialog open={editPontoOpen} onOpenChange={setEditPontoOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Selecionar Ponto de Estoque</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ponto de Estoque</Label>
              <Select value={editPontoId} onValueChange={setEditPontoId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {pontosEstoque.filter((p) => p.ativo).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.descricao} ({p.tipo})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPontoOpen(false)}>Cancelar</Button>
            <Button onClick={salvarPontoEstoque} disabled={!editPontoId}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Motorista */}
      <Dialog open={quickMotOpen} onOpenChange={setQuickMotOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cadastro Rápido — Motorista</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome *</Label><Input value={quickMotNome} onChange={(e) => setQuickMotNome(e.target.value)} /></div>
            <div><Label>Documento</Label><Input value={quickMotDoc} onChange={(e) => setQuickMotDoc(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickMotOpen(false)}>Cancelar</Button>
            <Button onClick={quickRegisterMotorista} disabled={!quickMotNome}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Veículo */}
      <Dialog open={quickVeicOpen} onOpenChange={setQuickVeicOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cadastro Rápido — Veículo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Placa *</Label><Input value={quickVeicPlaca} onChange={(e) => setQuickVeicPlaca(e.target.value.toUpperCase())} /></div>
            <div><Label>Tipo de Veículo</Label><Input value={quickVeicTipo} onChange={(e) => setQuickVeicTipo(e.target.value)} placeholder="Ex: Carreta, Truck" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickVeicOpen(false)}>Cancelar</Button>
            <Button onClick={quickRegisterVeiculo} disabled={!quickVeicPlaca}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
