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
import { Plus, Pencil, Trash2, Eye, DollarSign, Search } from "lucide-react";
import { financeiroContaService, financeiroParcelaService, financeiroBaixaService, pessoaService } from "@/lib/services";
import type { FinanceiroConta, FinanceiroParcela, FinanceiroBaixa, TipoConta, StatusConta, FormaPagamento, Pessoa } from "@/lib/mock-data";

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

  // Parcelas & Baixas
  const [parcelas, setParcelas] = useState<FinanceiroParcela[]>([]);
  const [baixas, setBaixas] = useState<FinanceiroBaixa[]>([]);

  // Gerar parcelas modal
  const [gerarParcelasOpen, setGerarParcelasOpen] = useState(false);
  const [numParcelas, setNumParcelas] = useState("1");
  const [intervaloDias, setIntervaloDias] = useState("30");

  // Registrar pagamento modal
  const [pagamentoOpen, setPagamentoOpen] = useState(false);
  const [pagParcelaId, setPagParcelaId] = useState("");
  const [pagValor, setPagValor] = useState("");
  const [pagData, setPagData] = useState(new Date().toISOString().slice(0, 10));
  const [pagForma, setPagForma] = useState<FormaPagamento>("PIX");
  const [pagObs, setPagObs] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    const [c, p] = await Promise.all([
      financeiroContaService.listar(empresaId, filialId),
      pessoaService.listar(empresaId, filialId),
    ]);
    setContas(c);
    setPessoas(p);
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
    setOrigem("MANUAL"); setParcelas([]); setBaixas([]);
    setEditId(null);
  };

  const openNew = () => { resetForm(); setModalMode("new"); setModalOpen(true); };

  const openEdit = async (conta: FinanceiroConta) => {
    setEditId(conta.id);
    setTipo(conta.tipo); setPessoaId(conta.pessoaId); setDescricao(conta.descricao);
    setDataEmissao(conta.dataEmissao); setValorTotal(String(conta.valorTotal));
    setDocumentoReferencia(conta.documentoReferencia); setObservacoes(conta.observacoes);
    setOrigem(conta.origem);
    const [p, b] = await Promise.all([
      financeiroParcelaService.listarPorConta(conta.id),
      financeiroBaixaService.listarPorConta(conta.id),
    ]);
    setParcelas(p); setBaixas(b);
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

  const handleGerarParcelas = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      const novas = await financeiroParcelaService.gerarParcelas(
        editId, parseInt(numParcelas), parseInt(intervaloDias), parseFloat(valorTotal),
        { grupoId, empresaId, filialId }
      );
      setParcelas(novas);
      toast({ title: `${novas.length} parcela(s) gerada(s)` });
      setGerarParcelasOpen(false);
    } finally { setSaving(false); }
  };

  const handleRegistrarPagamento = async () => {
    if (!pagParcelaId || !pagValor) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      await financeiroBaixaService.registrar({
        parcelaId: pagParcelaId, valorPago: parseFloat(pagValor),
        formaPagamento: pagForma, dataPagamento: pagData, observacoes: pagObs,
      }, { grupoId, empresaId, filialId });
      // Reload parcelas e baixas
      const [p, b] = await Promise.all([
        financeiroParcelaService.listarPorConta(editId!),
        financeiroBaixaService.listarPorConta(editId!),
      ]);
      setParcelas(p); setBaixas(b);
      toast({ title: "Pagamento registrado" });
      setPagamentoOpen(false); setPagParcelaId(""); setPagValor(""); setPagObs("");
      carregar();
    } finally { setSaving(false); }
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
                <Button size="sm" variant="outline" onClick={() => { setNumParcelas("1"); setIntervaloDias("30"); setGerarParcelasOpen(true); }}>
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

          <TabsContent value="pagamentos" className="mt-4">
            {!isReadonly && editId && parcelas.some((p) => p.status !== "PAGO") && (
              <div className="flex justify-end mb-3">
                <Button size="sm" variant="outline" onClick={() => {
                  const pendente = parcelas.find((p) => p.status !== "PAGO");
                  setPagParcelaId(pendente?.id ?? "");
                  setPagValor(pendente ? String(pendente.saldoParcela) : "");
                  setPagData(new Date().toISOString().slice(0, 10));
                  setPagForma("PIX"); setPagObs("");
                  setPagamentoOpen(true);
                }}>
                  <DollarSign className="h-4 w-4 mr-1" />Registrar Pagamento
                </Button>
              </div>
            )}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Parcela</TableHead>
                    <TableHead className="text-right">Valor Pago</TableHead>
                    <TableHead>Forma</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {baixas.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Nenhum pagamento registrado</TableCell></TableRow>
                  ) : baixas.map((b) => {
                    const par = parcelas.find((p) => p.id === b.parcelaId);
                    return (
                      <TableRow key={b.id}>
                        <TableCell>{new Date(b.dataPagamento).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>{par ? `${par.numeroParcela}ª` : "—"}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(b.valorPago)}</TableCell>
                        <TableCell>{b.formaPagamento}</TableCell>
                        <TableCell className="text-muted-foreground">{b.observacoes || "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CrudModal>

      {/* Modal Gerar Parcelas */}
      <CrudModal open={gerarParcelasOpen} onClose={() => setGerarParcelasOpen(false)} title="Gerar Parcelas" saving={saving} onSave={handleGerarParcelas} maxWidth="sm:max-w-md">
        <div className="space-y-4">
          <div>
            <Label>Número de Parcelas</Label>
            <Input type="number" min="1" value={numParcelas} onChange={(e) => setNumParcelas(e.target.value)} />
          </div>
          <div>
            <Label>Intervalo (dias)</Label>
            <Input type="number" min="1" value={intervaloDias} onChange={(e) => setIntervaloDias(e.target.value)} />
          </div>
          <div>
            <Label>Valor Total</Label>
            <Input value={fmt(parseFloat(valorTotal) || 0)} disabled />
          </div>
          {parseInt(numParcelas) > 0 && parseFloat(valorTotal) > 0 && (
            <p className="text-sm text-muted-foreground">
              {numParcelas} parcela(s) de {fmt(parseFloat(valorTotal) / parseInt(numParcelas))}
            </p>
          )}
        </div>
      </CrudModal>

      {/* Modal Registrar Pagamento */}
      <CrudModal open={pagamentoOpen} onClose={() => setPagamentoOpen(false)} title="Registrar Pagamento" saving={saving} onSave={handleRegistrarPagamento} maxWidth="sm:max-w-md">
        <div className="space-y-4">
          <div>
            <Label>Parcela</Label>
            <Select value={pagParcelaId} onValueChange={(v) => {
              setPagParcelaId(v);
              const p = parcelas.find((p) => p.id === v);
              if (p) setPagValor(String(p.saldoParcela));
            }}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {parcelas.filter((p) => p.status !== "PAGO").map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.numeroParcela}ª — Saldo: {fmt(p.saldoParcela)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data Pagamento</Label>
            <Input type="date" value={pagData} onChange={(e) => setPagData(e.target.value)} />
          </div>
          <div>
            <Label>Valor Pago *</Label>
            <Input type="number" step="0.01" value={pagValor} onChange={(e) => setPagValor(e.target.value)} />
          </div>
          <div>
            <Label>Forma de Pagamento</Label>
            <Select value={pagForma} onValueChange={(v) => setPagForma(v as FormaPagamento)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                <SelectItem value="PIX">Pix</SelectItem>
                <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                <SelectItem value="BOLETO">Boleto</SelectItem>
                <SelectItem value="OUTROS">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={pagObs} onChange={(e) => setPagObs(e.target.value)} rows={2} />
          </div>
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
