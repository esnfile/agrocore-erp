import { useState, useEffect, useMemo, useCallback } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { PageHeader } from "@/components/PageHeader";
import { CrudModal } from "@/components/CrudModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, Search, AlertTriangle, ArrowDownCircle, ArrowUpCircle, ChevronDown, ChevronRight, Info } from "lucide-react";
import { financeiroContaService, financeiroParcelaService, financeiroMovimentacaoService, financeiroContaFinanceiraService, financeiroFormaPagtoService, financeiroTipoLancamentoService, pessoaService, financeiroBaixaService } from "@/lib/services";
import type { FinanceiroConta, FinanceiroParcela, FinanceiroMovimentacao, FinanceiroBaixa, TipoConta, StatusConta, StatusParcela, Pessoa } from "@/lib/mock-data";
import { financeiroFormasPagto as mockFormasPagto } from "@/lib/mock-data";

const statusContaColors: Record<StatusConta, string> = {
  ABERTO: "bg-warning/20 text-warning border-warning/30",
  PARCIAL: "bg-orange-100 text-orange-700 border-orange-300",
  LIQUIDADO: "bg-blue-100 text-blue-700 border-blue-300",
  CANCELADO: "bg-destructive/20 text-destructive border-destructive/30",
};

const statusParcelaColors: Record<StatusParcela, string> = {
  PENDENTE: "bg-warning/20 text-warning border-warning/30",
  PARCIAL: "bg-orange-100 text-orange-700 border-orange-300",
  PAGO: "bg-success/20 text-success border-success/30",
  VENCIDA: "bg-destructive/20 text-destructive border-destructive/30",
  CANCELADA: "bg-muted text-muted-foreground border-muted",
  PREVISTO: "bg-yellow-100 text-yellow-700 border-yellow-300",
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Frequencia = "MENSAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL" | "PERSONALIZADO";
const frequenciaDias: Record<Exclude<Frequencia, "PERSONALIZADO">, number> = {
  MENSAL: 30, TRIMESTRAL: 90, SEMESTRAL: 180, ANUAL: 365,
};

interface ParcelaEditavel {
  numeroParcela: number;
  dataVencimento: string;
  valorParcela: number;
}

type ParcelaComConta = FinanceiroParcela & { conta?: FinanceiroConta };

export default function ContasPage() {
  const { grupoAtual, empresaAtual, filialAtual } = useOrganization();
  const grupoId = grupoAtual?.id ?? "";
  const empresaId = empresaAtual?.id ?? "";
  const filialId = filialAtual?.id ?? "";
  const { toast } = useToast();

  const [todasParcelas, setTodasParcelas] = useState<ParcelaComConta[]>([]);
  const [contas, setContas] = useState<FinanceiroConta[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroPessoa, setFiltroPessoa] = useState<string>("TODOS");
  const [filtroBusca, setFiltroBusca] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"new" | "edit" | "view">("new");
  const [saving, setSaving] = useState(false);
  const [editingConta, setEditingConta] = useState<FinanceiroConta | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form fields
  const [tipo, setTipo] = useState<TipoConta>("PAGAR");
  const [pessoaId, setPessoaId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [valorTotalReal, setValorTotalReal] = useState("");
  const [documentoReferencia, setDocumentoReferencia] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [origem, setOrigem] = useState<string>("MANUAL");

  // Parcelas & Movimentações (histórico)
  const [parcelas, setParcelas] = useState<FinanceiroParcela[]>([]);
  const [baixas, setBaixas] = useState<FinanceiroBaixa[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<FinanceiroMovimentacao[]>([]);
  const [expandedParcela, setExpandedParcela] = useState<string | null>(null);

  // Gerar parcelas
  const [gerarParcelasOpen, setGerarParcelasOpen] = useState(false);
  const [numParcelas, setNumParcelas] = useState("1");
  const [frequencia, setFrequencia] = useState<Frequencia>("MENSAL");
  const [diasPersonalizado, setDiasPersonalizado] = useState("30");
  const [dataPrimeiraParcela, setDataPrimeiraParcela] = useState(new Date().toISOString().slice(0, 10));
  const [parcelasEditaveis, setParcelasEditaveis] = useState<ParcelaEditavel[]>([]);
  const [parcelasGeradas, setParcelasGeradas] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    const [allParcelas, c, p] = await Promise.all([
      financeiroParcelaService.listarTodas(empresaId, filialId),
      financeiroContaService.listar(empresaId, filialId),
      pessoaService.listar(empresaId, filialId),
    ]);
    setTodasParcelas(allParcelas);
    setContas(c);
    setPessoas(p);
    setLoading(false);
  }, [empresaId, filialId]);

  useEffect(() => { carregar(); }, [carregar]);

  const parcelasFiltradas = useMemo(() => {
    let list = todasParcelas;
    if (filtroTipo !== "TODOS") list = list.filter((p) => p.conta?.tipo === filtroTipo);
    if (filtroStatus !== "TODOS") list = list.filter((p) => p.status === filtroStatus);
    if (filtroPessoa !== "TODOS") list = list.filter((p) => p.conta?.pessoaId === filtroPessoa);
    if (filtroBusca) {
      const term = filtroBusca.toLowerCase();
      list = list.filter((p) =>
        p.conta?.descricao?.toLowerCase().includes(term) ||
        p.conta?.documentoReferencia?.toLowerCase().includes(term) ||
        p.conta?.pessoaId && getNomePessoa(p.conta.pessoaId).toLowerCase().includes(term)
      );
    }
    return list;
  }, [todasParcelas, filtroTipo, filtroStatus, filtroPessoa, filtroBusca]);

  // Summary cards
  const resumo = useMemo(() => {
    const vencidas = parcelasFiltradas.filter((p) => p.status === "VENCIDA" && p.conta?.tipo === "PAGAR");
    const pendPagar = parcelasFiltradas.filter((p) => (p.status === "PENDENTE" || p.status === "PARCIAL") && p.conta?.tipo === "PAGAR");
    const pendReceber = parcelasFiltradas.filter((p) => (p.status === "PENDENTE" || p.status === "PARCIAL" || p.status === "VENCIDA") && p.conta?.tipo === "RECEBER");
    return {
      totalVencidas: vencidas.reduce((s, p) => s + p.saldoParcela, 0),
      totalPagarPend: pendPagar.reduce((s, p) => s + p.saldoParcela, 0),
      totalReceberPend: pendReceber.reduce((s, p) => s + p.saldoParcela, 0),
      saldoTotal: parcelasFiltradas.reduce((s, p) => s + p.saldoParcela, 0),
    };
  }, [parcelasFiltradas]);

  const getNomePessoa = (id: string) => pessoas.find((p) => p.id === id)?.nomeRazao ?? "—";

  const resetForm = () => {
    setTipo("PAGAR"); setPessoaId(""); setDescricao("");
    setDataEmissao(new Date().toISOString().slice(0, 10));
    setValorTotal(""); setValorTotalReal(""); setDocumentoReferencia(""); setObservacoes("");
    setOrigem("MANUAL"); setParcelas([]); setBaixas([]); setMovimentacoes([]);
    setEditingConta(null); setParcelasEditaveis([]); setParcelasGeradas(false);
    setExpandedParcela(null);
  };

  const openNew = () => { resetForm(); setModalMode("new"); setModalOpen(true); };

  const openEdit = async (conta: FinanceiroConta) => {
    setEditingConta(conta);
    setTipo(conta.tipo); setPessoaId(conta.pessoaId); setDescricao(conta.descricao);
    setDataEmissao(conta.dataEmissao); setValorTotal(String(conta.valorTotal));
    setValorTotalReal(String(conta.valorTotalReal));
    setDocumentoReferencia(conta.documentoReferencia); setObservacoes(conta.observacoes);
    setOrigem(conta.origem);
    const [p, b, m] = await Promise.all([
      financeiroParcelaService.listarPorConta(conta.id),
      financeiroBaixaService.listarPorConta(conta.id),
      financeiroMovimentacaoService.listarPorConta(conta.id),
    ]);
    setParcelas(p); setBaixas(b); setMovimentacoes(m);
    setParcelasEditaveis([]); setParcelasGeradas(false);
    setModalMode("edit"); setModalOpen(true);
  };

  const openView = async (conta: FinanceiroConta) => {
    await openEdit(conta);
    setModalMode("view");
  };

  // Field locking matrix
  const isReadonly = modalMode === "view";
  const contaStatus = editingConta?.status;
  const isOrigemContrato = editingConta?.origem === "CONTRATO" || editingConta?.origem === "FIXACAO";
  const isLocked = contaStatus === "LIQUIDADO" || contaStatus === "CANCELADO";

  const canEditField = (field: string): boolean => {
    if (isReadonly) return false;
    if (modalMode === "new") return true;
    if (field === "observacoes") return contaStatus !== "LIQUIDADO";
    if (isLocked) return false;
    if (field === "tipo") return !isOrigemContrato && contaStatus === "ABERTO";
    if (field === "pessoa") return !isOrigemContrato && contaStatus === "ABERTO";
    if (field === "descricao") return contaStatus === "ABERTO" || contaStatus === "PARCIAL";
    if (field === "valorTotal") return contaStatus === "ABERTO" || contaStatus === "PARCIAL";
    if (field === "valorTotalReal") return contaStatus === "ABERTO" || contaStatus === "PARCIAL";
    if (field === "documentoReferencia") return !isOrigemContrato;
    if (field === "dataEmissao") return contaStatus === "ABERTO";
    if (field === "origem") return false;
    return false;
  };

  const handleSave = async () => {
    if (!pessoaId || !descricao || !valorTotal) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      await financeiroContaService.salvar({
        id: editingConta?.id ?? undefined, tipo, pessoaId, descricao, dataEmissao,
        valorTotal: parseFloat(valorTotal),
        valorTotalReal: parseFloat(valorTotalReal || valorTotal),
        documentoReferencia, observacoes,
        origem: origem as any,
      }, { grupoId, empresaId, filialId });
      toast({ title: "Conta salva com sucesso" });
      setModalOpen(false); carregar();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await financeiroContaService.excluir(deleteId);
    await financeiroParcelaService.excluirPorConta(deleteId);
    toast({ title: "Conta excluída" });
    setDeleteId(null); carregar();
  };

  // --- Geração de parcelas avançada ---
  const intervaloDiasCalculado = frequencia === "PERSONALIZADO"
    ? parseInt(diasPersonalizado) || 30
    : frequenciaDias[frequencia];

  const handlePreviewParcelas = () => {
    const n = parseInt(numParcelas);
    const vt = parseFloat(valorTotal);
    if (!n || n < 1 || !vt || vt <= 0) {
      toast({ title: "Informe quantidade e valor total válidos", variant: "destructive" }); return;
    }
    const valorBase = Math.round((vt / n) * 100) / 100;
    const novas: ParcelaEditavel[] = [];
    for (let i = 0; i < n; i++) {
      const d = new Date(dataPrimeiraParcela);
      d.setDate(d.getDate() + intervaloDiasCalculado * i);
      const val = i === n - 1 ? vt - valorBase * (n - 1) : valorBase;
      novas.push({ numeroParcela: i + 1, dataVencimento: d.toISOString().slice(0, 10), valorParcela: Math.round(val * 100) / 100 });
    }
    setParcelasEditaveis(novas);
    setParcelasGeradas(true);
  };

  const somaParcelas = parcelasEditaveis.reduce((s, p) => s + p.valorParcela, 0);
  const somaValida = Math.abs(somaParcelas - (parseFloat(valorTotal) || 0)) < 0.01;

  const handleSalvarParcelas = async () => {
    if (!editingConta) return;
    if (!somaValida) {
      toast({ title: "Soma das parcelas difere do valor total da conta", description: `Soma: ${fmt(somaParcelas)} — Valor total: ${fmt(parseFloat(valorTotal) || 0)}`, variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const novas = await financeiroParcelaService.gerarParcelasCustomizadas(
        editingConta.id, parcelasEditaveis, { grupoId, empresaId, filialId }
      );
      setParcelas(novas);
      toast({ title: `${novas.length} parcela(s) salva(s)` });
      setGerarParcelasOpen(false);
      setParcelasEditaveis([]); setParcelasGeradas(false);
    } finally { setSaving(false); }
  };

  const updateParcelaEditavel = (idx: number, field: "dataVencimento" | "valorParcela", value: string | number) => {
    if (field === "dataVencimento") {
      setParcelasEditaveis((prev) => prev.map((p, i) => i === idx ? { ...p, dataVencimento: String(value) } : p));
    } else {
      const novoValor = typeof value === "number" ? value : parseFloat(value) || 0;
      const vt = parseFloat(valorTotal) || 0;
      setParcelasEditaveis((prev) => {
        const updated = prev.map((p, i) => i === idx ? { ...p, valorParcela: novoValor } : p);
        if (updated.length > 1 && idx !== updated.length - 1) {
          const somaOutras = updated.reduce((s, p, i) => i !== updated.length - 1 ? s + p.valorParcela : s, 0);
          updated[updated.length - 1] = { ...updated[updated.length - 1], valorParcela: Math.round((vt - somaOutras) * 100) / 100 };
        }
        return updated;
      });
    }
  };

  const openContaFromParcela = async (parcela: ParcelaComConta) => {
    if (parcela.conta) {
      await openView(parcela.conta);
    }
  };

  return (
    <div>
      <PageHeader title="Contas a Pagar / Receber" description="Visão por parcelas — verdade absoluta do financeiro" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">A Pagar (Vencidas)</p>
            <p className="text-lg font-bold text-destructive">{fmt(resumo.totalVencidas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">A Pagar (Pendentes)</p>
            <p className="text-lg font-bold text-warning">{fmt(resumo.totalPagarPend)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">A Receber (Pendentes)</p>
            <p className="text-lg font-bold text-success">{fmt(resumo.totalReceberPend)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Saldo Total</p>
            <p className="text-lg font-bold text-foreground">{fmt(resumo.saldoTotal)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div className="w-40">
          <Label className="text-xs">Tipo</Label>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              <SelectItem value="PAGAR">A Pagar</SelectItem>
              <SelectItem value="RECEBER">A Receber</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Label className="text-xs">Status</Label>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              <SelectItem value="PENDENTE">Pendente</SelectItem>
              <SelectItem value="PARCIAL">Parcial</SelectItem>
              <SelectItem value="PAGO">Pago</SelectItem>
              <SelectItem value="VENCIDA">Vencida</SelectItem>
              <SelectItem value="CANCELADA">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-52">
          <Label className="text-xs">Pessoa</Label>
          <Select value={filtroPessoa} onValueChange={setFiltroPessoa}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todas</SelectItem>
              {pessoas.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.nomeRazao}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <Label className="text-xs">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Descrição, documento ou pessoa..." value={filtroBusca} onChange={(e) => setFiltroBusca(e.target.value)} className="pl-9" />
          </div>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Nova Conta Manual</Button>
      </div>

      {/* Grid de Parcelas */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Tipo</TableHead>
              <TableHead>Pessoa</TableHead>
              <TableHead>Contrato / Parcela</TableHead>
              <TableHead className="w-28">Vencimento</TableHead>
              <TableHead className="w-28 text-right">Valor</TableHead>
              <TableHead className="w-28 text-right">Pago</TableHead>
              <TableHead className="w-28 text-right">Saldo</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-28 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : parcelasFiltradas.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhuma parcela encontrada</TableCell></TableRow>
            ) : parcelasFiltradas.map((p) => (
              <TableRow key={p.id} className={p.status === "VENCIDA" ? "bg-destructive/5" : ""}>
                <TableCell>
                  {p.conta?.tipo === "PAGAR" ? (
                    <Badge variant="outline" className="border-destructive/50 text-destructive gap-1">
                      <ArrowDownCircle className="h-3 w-3" />Pagar
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-success/50 text-success gap-1">
                      <ArrowUpCircle className="h-3 w-3" />Receber
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-medium">{p.conta ? getNomePessoa(p.conta.pessoaId) : "—"}</TableCell>
                <TableCell className="text-sm">
                  <span className="text-muted-foreground">{p.conta?.documentoReferencia ?? "—"}</span>
                  <span className="text-xs text-muted-foreground ml-1">/ P{p.numeroParcela}</span>
                </TableCell>
                <TableCell className={p.status === "VENCIDA" ? "text-destructive font-medium" : ""}>
                  {new Date(p.dataVencimento).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell className="text-right font-mono">{fmt(p.valorReal)}</TableCell>
                <TableCell className="text-right font-mono">{fmt(p.valorPago)}</TableCell>
                <TableCell className="text-right font-mono">{fmt(p.saldoParcela)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusParcelaColors[p.status]}>{p.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-center">
                    <Button variant="ghost" size="icon" onClick={() => p.conta && openView(p.conta)} title="Visualizar"><Eye className="h-4 w-4" /></Button>
                    {p.conta && p.conta.status !== "LIQUIDADO" && p.conta.status !== "CANCELADO" && (
                      <Button variant="ghost" size="icon" onClick={() => p.conta && openEdit(p.conta)} title="Editar"><Pencil className="h-4 w-4" /></Button>
                    )}
                    {p.conta && p.conta.status === "ABERTO" && p.conta.origem === "MANUAL" && (
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.conta!.id)} title="Excluir" className="hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal Conta */}
      <CrudModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === "new" ? "Nova Conta Manual" : modalMode === "edit" ? "Editar Conta" : "Visualizar Conta"}
        saving={saving}
        onSave={isReadonly || isLocked ? undefined : handleSave}
        maxWidth="sm:max-w-4xl"
      >
        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dados">Dados da Conta</TabsTrigger>
            <TabsTrigger value="parcelas">Parcelas</TabsTrigger>
            <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4 mt-4">
            {/* Summary row */}
            {editingConta && (
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted">
                <Badge variant="outline" className={editingConta.tipo === "PAGAR" ? "border-destructive/50 text-destructive" : "border-success/50 text-success"}>
                  {editingConta.tipo === "PAGAR" ? "A Pagar" : "A Receber"}
                </Badge>
                <Badge variant="outline" className="bg-muted">{editingConta.origem}</Badge>
                <Badge variant="outline" className={statusContaColors[editingConta.status]}>{editingConta.status}</Badge>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Tipo *</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as TipoConta)} disabled={!canEditField("tipo")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAGAR">A Pagar</SelectItem>
                    <SelectItem value="RECEBER">A Receber</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Pessoa *</Label>
                <Select value={pessoaId} onValueChange={setPessoaId} disabled={!canEditField("pessoa")}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {pessoas.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nomeRazao}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data Emissão</Label>
                <Input type="date" value={dataEmissao} onChange={(e) => setDataEmissao(e.target.value)} disabled={!canEditField("dataEmissao")} />
              </div>
            </div>
            <div>
              <Label>Descrição *</Label>
              <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} disabled={!canEditField("descricao")} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Valor Provisão *</Label>
                <Input type="number" step="0.01" value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} disabled={!canEditField("valorTotal")} />
              </div>
              <div>
                <Label>Valor Real</Label>
                <Input type="number" step="0.01" value={valorTotalReal} onChange={(e) => setValorTotalReal(e.target.value)} disabled={!canEditField("valorTotalReal")} />
              </div>
              <div>
                <Label>Origem</Label>
                <Select value={origem} onValueChange={setOrigem} disabled={!canEditField("origem")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUAL">Manual</SelectItem>
                    <SelectItem value="CONTRATO">Contrato</SelectItem>
                    <SelectItem value="ROMANEIO">Romaneio</SelectItem>
                    <SelectItem value="FIXACAO">Fixação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Documento Referência</Label>
              <Input value={documentoReferencia} onChange={(e) => setDocumentoReferencia(e.target.value)} disabled={!canEditField("documentoReferencia")} />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} disabled={!canEditField("observacoes")} rows={3} />
            </div>
          </TabsContent>

          <TabsContent value="parcelas" className="mt-4">
            {!isReadonly && !isLocked && editingConta && (
              <div className="flex justify-end mb-3">
                <Button size="sm" variant="outline" onClick={() => {
                  setNumParcelas("1");
                  setFrequencia("MENSAL");
                  setDiasPersonalizado("30");
                  setDataPrimeiraParcela(new Date().toISOString().slice(0, 10));
                  setParcelasEditaveis([]);
                  setParcelasGeradas(false);
                  setGerarParcelasOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-1" />Gerar Parcelas
                </Button>
              </div>
            )}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="w-20">#</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Valor Original</TableHead>
                    <TableHead className="text-right">Valor Real</TableHead>
                    <TableHead className="text-right">Pago</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parcelas.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-6 text-muted-foreground">Nenhuma parcela gerada</TableCell></TableRow>
                  ) : parcelas.map((p) => {
                    const parcelaMovs = movimentacoes.filter((m) => m.parcelaId === p.id);
                    const isExpanded = expandedParcela === p.id;
                    return (
                      <Collapsible key={p.id} open={isExpanded} onOpenChange={() => setExpandedParcela(isExpanded ? null : p.id)} asChild>
                        <>
                          <CollapsibleTrigger asChild>
                            <TableRow className="cursor-pointer hover:bg-muted/50">
                              <TableCell>
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </TableCell>
                              <TableCell className="font-mono">{p.numeroParcela}/{p.totalParcelas}</TableCell>
                              <TableCell>{new Date(p.dataVencimento).toLocaleDateString("pt-BR")}</TableCell>
                              <TableCell className="text-right font-mono">{fmt(p.valorParcela)}</TableCell>
                              <TableCell className="text-right font-mono">{fmt(p.valorReal)}</TableCell>
                              <TableCell className="text-right font-mono">{fmt(p.valorPago)}</TableCell>
                              <TableCell className="text-right font-mono">{fmt(p.saldoParcela)}</TableCell>
                              <TableCell><Badge variant="outline" className={statusParcelaColors[p.status]}>{p.status}</Badge></TableCell>
                            </TableRow>
                          </CollapsibleTrigger>
                          <CollapsibleContent asChild>
                            <TableRow>
                              <TableCell colSpan={8} className="bg-muted/30 p-4">
                                <p className="text-xs font-semibold text-muted-foreground mb-2">Movimentações desta parcela</p>
                                {parcelaMovs.length === 0 ? (
                                  <p className="text-xs text-muted-foreground">Nenhuma movimentação registrada.</p>
                                ) : (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="text-xs">Data</TableHead>
                                        <TableHead className="text-xs">Tipo</TableHead>
                                        <TableHead className="text-xs text-right">Valor</TableHead>
                                        <TableHead className="text-xs">Forma</TableHead>
                                        <TableHead className="text-xs">Histórico</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {parcelaMovs.map((m) => {
                                        const formaLabel = mockFormasPagto.find((f) => f.id === m.formaPagamentoId)?.descricao ?? "—";
                                        return (
                                          <TableRow key={m.id}>
                                            <TableCell className="text-xs">{new Date(m.dataMovimento).toLocaleDateString("pt-BR")}</TableCell>
                                            <TableCell className="text-xs">
                                              <Badge variant="outline" className="text-xs">{m.tipoMovimento === "ENTRADA" ? "ADT" : m.tipoMovimento}</Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-right font-mono">{fmt(m.valor)}</TableCell>
                                            <TableCell className="text-xs">{formaLabel}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{m.historico || "—"}</TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                )}
                              </TableCell>
                            </TableRow>
                          </CollapsibleContent>
                        </>
                      </Collapsible>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Aba Pagamentos — 100% read-only */}
          <TabsContent value="pagamentos" className="mt-4">
            <div className="flex items-start gap-2 p-3 rounded-md bg-blue-50 border border-blue-200 text-blue-700 mb-4">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-sm">
                Histórico de movimentações financeiras vinculadas a esta conta. Para registrar adiantamentos ou pagamentos, acesse <strong>Caixa/Bancos</strong>.
              </p>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Parcela</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Forma</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {baixas.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Nenhum pagamento registrado. Ao fazer movimentos no Caixa/Bancos, aparecerão aqui automaticamente.</TableCell></TableRow>
                  ) : baixas.map((b) => {
                    const parc = parcelas.find((p) => p.id === b.parcelaId);
                    return (
                      <TableRow key={b.id}>
                        <TableCell>{new Date(b.dataPagamento).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="text-sm">
                          Parc. {parc?.numeroParcela ?? "?"}
                        </TableCell>
                        <TableCell className="text-right font-mono">{fmt(b.valorPago)}</TableCell>
                        <TableCell>{b.formaPagamento}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{b.observacoes || "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CrudModal>

      {/* Modal Gerar Parcelas — Avançado */}
      <CrudModal
        open={gerarParcelasOpen}
        onClose={() => setGerarParcelasOpen(false)}
        title="Gerar Parcelas"
        saving={saving}
        onSave={parcelasGeradas ? handleSalvarParcelas : undefined}
        maxWidth="sm:max-w-2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantidade de Parcelas</Label>
              <Input type="number" min="1" value={numParcelas} onChange={(e) => { setNumParcelas(e.target.value); setParcelasGeradas(false); }} />
            </div>
            <div>
              <Label>{parseInt(numParcelas) === 1 ? "Data de Vencimento" : "Data da Primeira Parcela"}</Label>
              <Input type="date" value={dataPrimeiraParcela} onChange={(e) => { setDataPrimeiraParcela(e.target.value); setParcelasGeradas(false); }} />
            </div>
          </div>
          {parseInt(numParcelas) >= 2 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Frequência</Label>
                <Select value={frequencia} onValueChange={(v) => { setFrequencia(v as Frequencia); setParcelasGeradas(false); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MENSAL">Mensal (30 dias)</SelectItem>
                    <SelectItem value="TRIMESTRAL">Trimestral (90 dias)</SelectItem>
                    <SelectItem value="SEMESTRAL">Semestral (180 dias)</SelectItem>
                    <SelectItem value="ANUAL">Anual (365 dias)</SelectItem>
                    <SelectItem value="PERSONALIZADO">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {frequencia === "PERSONALIZADO" && (
                <div>
                  <Label>Intervalo (dias)</Label>
                  <Input type="number" min="1" value={diasPersonalizado} onChange={(e) => { setDiasPersonalizado(e.target.value); setParcelasGeradas(false); }} />
                </div>
              )}
            </div>
          )}
          {parseInt(numParcelas) === 1 && (
            <p className="text-xs text-muted-foreground">Parcela única com vencimento em {new Date(dataPrimeiraParcela).toLocaleDateString("pt-BR")}.</p>
          )}
          <div>
            <Label>Valor Total</Label>
            <Input value={fmt(parseFloat(valorTotal) || 0)} disabled />
          </div>

          <Button variant="outline" className="w-full" onClick={handlePreviewParcelas}>
            Gerar Pré-visualização
          </Button>

          {parcelasGeradas && parcelasEditaveis.length > 0 && (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Parcela</TableHead>
                      <TableHead>Data Vencimento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parcelasEditaveis.map((p, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono">{p.numeroParcela}</TableCell>
                        <TableCell>
                          <Input type="date" value={p.dataVencimento} onChange={(e) => updateParcelaEditavel(idx, "dataVencimento", e.target.value)} className="w-40" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={(Number(p.valorParcela) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\./g, "").replace(",", ".").replace(/[^0-9.]/g, "");
                              const num = parseFloat(raw) || 0;
                              updateParcelaEditavel(idx, "valorParcela", num);
                            }}
                            className="w-32 text-right ml-auto"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-md border ${somaValida ? "border-success/50 bg-success/10" : "border-destructive/50 bg-destructive/10"}`}>
                <div className="flex items-center gap-2">
                  {!somaValida && <AlertTriangle className="h-4 w-4 text-destructive" />}
                  <span className="text-sm font-medium">
                    Soma das parcelas: {fmt(somaParcelas)}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Valor total: {fmt(parseFloat(valorTotal) || 0)}
                </span>
              </div>
              {!somaValida && (
                <p className="text-sm text-destructive">A soma das parcelas deve ser igual ao valor total da conta para salvar.</p>
              )}
            </>
          )}
        </div>
      </CrudModal>

      {/* Confirmar exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. A conta e suas parcelas serão excluídas.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
