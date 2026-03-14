import { useState, useEffect, useMemo, useCallback } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { PageHeader } from "@/components/PageHeader";
import { CrudModal } from "@/components/CrudModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, Search, AlertTriangle } from "lucide-react";
import { financeiroContaService, financeiroParcelaService, financeiroMovimentacaoService, financeiroContaFinanceiraService, financeiroFormaPagtoService, financeiroTipoLancamentoService, pessoaService } from "@/lib/services";
import type { FinanceiroConta, FinanceiroParcela, FinanceiroMovimentacao, TipoConta, StatusConta, Pessoa } from "@/lib/mock-data";

const statusColors: Record<StatusConta, string> = {
  ABERTO: "bg-warning/20 text-warning border-warning/30",
  PARCIAL: "bg-blue-100 text-blue-700 border-blue-300",
  PAGO: "bg-success/20 text-success border-success/30",
  CANCELADO: "bg-destructive/20 text-destructive border-destructive/30",
};

const statusParcelaColors: Record<string, string> = {
  PENDENTE: "bg-warning/20 text-warning border-warning/30",
  PARCIAL: "bg-blue-100 text-blue-700 border-blue-300",
  PAGO: "bg-success/20 text-success border-success/30",
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

export default function ContasPage() {
  const { grupoAtual, empresaAtual, filialAtual } = useOrganization();
  const grupoId = grupoAtual?.id ?? "";
  const empresaId = empresaAtual?.id ?? "";
  const filialId = filialAtual?.id ?? "";
  const { toast } = useToast();

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
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form fields
  const [tipo, setTipo] = useState<TipoConta>("PAGAR");
  const [pessoaId, setPessoaId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [documentoReferencia, setDocumentoReferencia] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [origem, setOrigem] = useState<string>("MANUAL");

  // Parcelas & Movimentações (histórico)
  const [parcelas, setParcelas] = useState<FinanceiroParcela[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<FinanceiroMovimentacao[]>([]);

  // Gerar parcelas
  const [gerarParcelasOpen, setGerarParcelasOpen] = useState(false);
  const [numParcelas, setNumParcelas] = useState("1");
  const [frequencia, setFrequencia] = useState<Frequencia>("MENSAL");
  const [diasPersonalizado, setDiasPersonalizado] = useState("30");
  const [dataPrimeiraParcela, setDataPrimeiraParcela] = useState(new Date().toISOString().slice(0, 10));
  const [parcelasEditaveis, setParcelasEditaveis] = useState<ParcelaEditavel[]>([]);
  const [parcelasGeradas, setParcelasGeradas] = useState(false);

  // Lookups for movimentações tab
  const [contasFinanceirasMap, setContasFinanceirasMap] = useState<Record<string, string>>({});
  const [formasPagtoMap, setFormasPagtoMap] = useState<Record<string, string>>({});
  const [tiposLancMap, setTiposLancMap] = useState<Record<string, string>>({});

  const carregar = useCallback(async () => {
    setLoading(true);
    const [c, p, cfs, fps, tls] = await Promise.all([
      financeiroContaService.listar(empresaId, filialId),
      pessoaService.listar(empresaId, filialId),
      financeiroContaFinanceiraService.listar(empresaId, filialId),
      financeiroFormaPagtoService.listar(empresaId, filialId),
      financeiroTipoLancamentoService.listar(empresaId, filialId),
    ]);
    setContas(c);
    setPessoas(p);
    const cfMap: Record<string, string> = {};
    cfs.forEach((cf) => { cfMap[cf.id] = cf.descricao; });
    setContasFinanceirasMap(cfMap);
    const fpMap: Record<string, string> = {};
    fps.forEach((fp) => { fpMap[fp.id] = fp.descricao; });
    setFormasPagtoMap(fpMap);
    const tlMap: Record<string, string> = {};
    tls.forEach((tl) => { tlMap[tl.id] = tl.descricao; });
    setTiposLancMap(tlMap);
    setLoading(false);
  }, [empresaId, filialId]);

  useEffect(() => { carregar(); }, [carregar]);

  const contasFiltradas = useMemo(() => {
    let list = contas;
    if (filtroTipo !== "TODOS") list = list.filter((c) => c.tipo === filtroTipo);
    if (filtroStatus !== "TODOS") list = list.filter((c) => c.status === filtroStatus);
    if (filtroPessoa !== "TODOS") list = list.filter((c) => c.pessoaId === filtroPessoa);
    if (filtroBusca) {
      const term = filtroBusca.toLowerCase();
      list = list.filter((c) => c.descricao.toLowerCase().includes(term) || c.documentoReferencia.toLowerCase().includes(term));
    }
    return list;
  }, [contas, filtroTipo, filtroStatus, filtroPessoa, filtroBusca]);

  const getNomePessoa = (id: string) => pessoas.find((p) => p.id === id)?.nomeRazao ?? "—";

  const resetForm = () => {
    setTipo("PAGAR"); setPessoaId(""); setDescricao("");
    setDataEmissao(new Date().toISOString().slice(0, 10));
    setValorTotal(""); setDocumentoReferencia(""); setObservacoes("");
    setOrigem("MANUAL"); setParcelas([]); setMovimentacoes([]);
    setEditId(null); setParcelasEditaveis([]); setParcelasGeradas(false);
  };

  const openNew = () => { resetForm(); setModalMode("new"); setModalOpen(true); };

  const openEdit = async (conta: FinanceiroConta) => {
    setEditId(conta.id);
    setTipo(conta.tipo); setPessoaId(conta.pessoaId); setDescricao(conta.descricao);
    setDataEmissao(conta.dataEmissao); setValorTotal(String(conta.valorTotal));
    setDocumentoReferencia(conta.documentoReferencia); setObservacoes(conta.observacoes);
    setOrigem(conta.origem);
    const [p, m] = await Promise.all([
      financeiroParcelaService.listarPorConta(conta.id),
      financeiroMovimentacaoService.listarPorConta(conta.id),
    ]);
    setParcelas(p); setMovimentacoes(m);
    setParcelasEditaveis([]); setParcelasGeradas(false);
    setModalMode("edit"); setModalOpen(true);
  };

  const openView = async (conta: FinanceiroConta) => {
    await openEdit(conta);
    setModalMode("view");
  };

  const handleSave = async () => {
    if (!pessoaId || !descricao || !valorTotal) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      await financeiroContaService.salvar({
        id: editId ?? undefined, tipo, pessoaId, descricao, dataEmissao,
        valorTotal: parseFloat(valorTotal), documentoReferencia, observacoes,
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
    if (!editId) return;
    if (!somaValida) {
      toast({ title: "Soma das parcelas difere do valor total da conta", description: `Soma: ${fmt(somaParcelas)} — Valor total: ${fmt(parseFloat(valorTotal) || 0)}`, variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const novas = await financeiroParcelaService.gerarParcelasCustomizadas(
        editId, parcelasEditaveis, { grupoId, empresaId, filialId }
      );
      setParcelas(novas);
      toast({ title: `${novas.length} parcela(s) salva(s)` });
      setGerarParcelasOpen(false);
      setParcelasEditaveis([]); setParcelasGeradas(false);
    } finally { setSaving(false); }
  };

  const updateParcelaEditavel = (idx: number, field: "dataVencimento" | "valorParcela", value: string) => {
    setParcelasEditaveis((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: field === "valorParcela" ? parseFloat(value) || 0 : value } : p));
  };

  const isReadonly = modalMode === "view";

  return (
    <div>
      <PageHeader title="Contas" description="Gerenciamento de contas a pagar e receber" />

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
              <SelectItem value="ABERTO">Aberto</SelectItem>
              <SelectItem value="PARCIAL">Parcial</SelectItem>
              <SelectItem value="PAGO">Pago</SelectItem>
              <SelectItem value="CANCELADO">Cancelado</SelectItem>
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
            <Input placeholder="Descrição ou documento..." value={filtroBusca} onChange={(e) => setFiltroBusca(e.target.value)} className="pl-9" />
          </div>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Nova Conta</Button>
      </div>

      {/* Grid */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Tipo</TableHead>
              <TableHead>Pessoa</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-28">Emissão</TableHead>
              <TableHead className="w-32 text-right">Valor Total</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-28">Origem</TableHead>
              <TableHead className="w-36 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : contasFiltradas.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma conta encontrada</TableCell></TableRow>
            ) : contasFiltradas.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Badge variant="outline" className={c.tipo === "PAGAR" ? "border-destructive/50 text-destructive" : "border-success/50 text-success"}>
                    {c.tipo === "PAGAR" ? "Pagar" : "Receber"}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{getNomePessoa(c.pessoaId)}</TableCell>
                <TableCell>{c.descricao}</TableCell>
                <TableCell>{new Date(c.dataEmissao).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="text-right font-mono">{fmt(c.valorTotal)}</TableCell>
                <TableCell><Badge variant="outline" className={statusColors[c.status]}>{c.status}</Badge></TableCell>
                <TableCell>{c.origem}</TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-center">
                    <Button variant="ghost" size="icon" onClick={() => openView(c)} title="Visualizar"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)} title="Editar"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(c.id)} title="Excluir" className="hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
        title={modalMode === "new" ? "Nova Conta" : modalMode === "edit" ? "Editar Conta" : "Visualizar Conta"}
        saving={saving}
        onSave={isReadonly ? undefined : handleSave}
        maxWidth="sm:max-w-4xl"
      >
        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dados">Dados da Conta</TabsTrigger>
            <TabsTrigger value="parcelas">Parcelas</TabsTrigger>
            <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo *</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as TipoConta)} disabled={isReadonly}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAGAR">A Pagar</SelectItem>
                    <SelectItem value="RECEBER">A Receber</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Pessoa *</Label>
                <Select value={pessoaId} onValueChange={setPessoaId} disabled={isReadonly}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {pessoas.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nomeRazao}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Descrição *</Label>
              <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} disabled={isReadonly} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Data Emissão</Label>
                <Input type="date" value={dataEmissao} onChange={(e) => setDataEmissao(e.target.value)} disabled={isReadonly} />
              </div>
              <div>
                <Label>Valor Total *</Label>
                <Input type="number" step="0.01" value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} disabled={isReadonly} />
              </div>
              <div>
                <Label>Origem</Label>
                <Select value={origem} onValueChange={setOrigem} disabled={isReadonly}>
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
              <Input value={documentoReferencia} onChange={(e) => setDocumentoReferencia(e.target.value)} disabled={isReadonly} />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} disabled={isReadonly} rows={3} />
            </div>
          </TabsContent>

          <TabsContent value="parcelas" className="mt-4">
            {!isReadonly && editId && (
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
                    <TableHead className="w-20">Parcela</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Pago</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parcelas.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Nenhuma parcela gerada</TableCell></TableRow>
                  ) : parcelas.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono">{p.numeroParcela}</TableCell>
                      <TableCell>{new Date(p.dataVencimento).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(p.valorParcela)}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(p.valorPago)}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(p.saldoParcela)}</TableCell>
                      <TableCell><Badge variant="outline" className={statusParcelaColors[p.status]}>{p.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Aba Pagamentos — somente leitura, histórico de movimentações */}
          <TabsContent value="pagamentos" className="mt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Histórico de movimentações financeiras vinculadas a esta conta. Para registrar pagamentos, utilize <strong>Caixa e Bancos</strong>.
            </p>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Conta Financeira</TableHead>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Nº Documento</TableHead>
                    <TableHead>Tipo Movimento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentacoes.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Nenhum pagamento registrado</TableCell></TableRow>
                  ) : movimentacoes.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{new Date(m.dataMovimento).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{contasFinanceirasMap[m.contaFinanceiraId] ?? "—"}</TableCell>
                      <TableCell>{formasPagtoMap[m.formaPagamentoId] ?? "—"}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(m.valor)}</TableCell>
                      <TableCell>{m.numeroDocumento || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          m.tipoMovimento === "ENTRADA" ? "border-success/50 text-success" :
                          m.tipoMovimento === "SAIDA" ? "border-destructive/50 text-destructive" :
                          "border-blue-400/50 text-blue-600"
                        }>
                          {m.tipoMovimento}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
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
              <Label>Data da Primeira Parcela</Label>
              <Input type="date" value={dataPrimeiraParcela} onChange={(e) => { setDataPrimeiraParcela(e.target.value); setParcelasGeradas(false); }} />
            </div>
          </div>
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
                          <Input type="number" step="0.01" value={p.valorParcela} onChange={(e) => updateParcelaEditavel(idx, "valorParcela", e.target.value)} className="w-32 text-right ml-auto" />
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
