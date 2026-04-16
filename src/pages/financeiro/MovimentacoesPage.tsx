import { useState, useEffect, useCallback, useMemo } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { PageHeader } from "@/components/PageHeader";
import { CrudModal } from "@/components/CrudModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import {
  financeiroMovimentacaoService, financeiroTipoLancamentoService,
  financeiroContaFinanceiraService, financeiroFormaPagtoService,
  financeiroPlanoContaService, financeiroCentroCustoService,
  financeiroParcelaService, financeiroContaService, pessoaService,
} from "@/lib/services";
import type {
  FinanceiroMovimentacao, FinanceiroTipoLancamento, FinanceiroContaFinanceira,
  FinanceiroFormaPagto, FinanceiroPlanoConta, FinanceiroCentroCusto,
  FinanceiroParcela, FinanceiroConta, Pessoa,
} from "@/lib/mock-data";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function MovimentacoesPage() {
  const { grupoAtual, empresaAtual, filialAtual } = useOrganization();
  const grupoId = grupoAtual?.id ?? "";
  const empresaId = empresaAtual?.id ?? "";
  const filialId = filialAtual?.id ?? "";
  const { toast } = useToast();

  const [movimentacoes, setMovimentacoes] = useState<FinanceiroMovimentacao[]>([]);
  const [tiposLancamento, setTiposLancamento] = useState<FinanceiroTipoLancamento[]>([]);
  const [contasFinanceiras, setContasFinanceiras] = useState<FinanceiroContaFinanceira[]>([]);
  const [formasPagto, setFormasPagto] = useState<FinanceiroFormaPagto[]>([]);
  const [planoContas, setPlanoContas] = useState<FinanceiroPlanoConta[]>([]);
  const [centrosCusto, setCentrosCusto] = useState<FinanceiroCentroCusto[]>([]);
  const [contas, setContas] = useState<FinanceiroConta[]>([]);
  const [parcelas, setParcelas] = useState<FinanceiroParcela[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form
  const [tipoLancamentoId, setTipoLancamentoId] = useState("");
  const [contaFinanceiraId, setContaFinanceiraId] = useState("");
  const [formaPagamentoId, setFormaPagamentoId] = useState("");
  const [planoContaId, setPlanoContaId] = useState("");
  const [centroCustoId, setCentroCustoId] = useState("");
  const [dataMovimento, setDataMovimento] = useState(new Date().toISOString().slice(0, 10));
  const [valor, setValor] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [historico, setHistorico] = useState("");
  const [contaOrigemId, setContaOrigemId] = useState("");
  const [contaDestinoId, setContaDestinoId] = useState("");
  const [parcelaId, setParcelaId] = useState("");
  const [pessoaId, setPessoaId] = useState("");
  const [contaIdSelecionada, setContaIdSelecionada] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    const [m, tl, cf, fp, pc, cc, cts, pess] = await Promise.all([
      financeiroMovimentacaoService.listar(empresaId, filialId),
      financeiroTipoLancamentoService.listar(empresaId, filialId),
      financeiroContaFinanceiraService.listar(empresaId, filialId),
      financeiroFormaPagtoService.listar(empresaId, filialId),
      financeiroPlanoContaService.listar(empresaId, filialId),
      financeiroCentroCustoService.listar(empresaId, filialId),
      financeiroContaService.listar(empresaId, filialId),
      pessoaService.listar(empresaId, filialId),
    ]);
    setMovimentacoes(m); setTiposLancamento(tl); setContasFinanceiras(cf);
    setFormasPagto(fp); setPlanoContas(pc); setCentrosCusto(cc);
    setContas(cts); setPessoas(pess);
    setLoading(false);
  }, [empresaId, filialId]);

  useEffect(() => { carregar(); }, [carregar]);

  // Load parcelas when conta is selected (for baixa)
  useEffect(() => {
    if (contaIdSelecionada) {
      financeiroParcelaService.listarPorConta(contaIdSelecionada).then((p) => {
        setParcelas(
          p.filter(
            (par) =>
              par.status !== "PAGO" &&
              par.status !== "PREVISTO" &&
              par.status !== "CANCELADA",
          ),
        );
      });
    } else {
      setParcelas([]);
    }
  }, [contaIdSelecionada]);

  const tipoLancSelecionado = tiposLancamento.find((t) => t.id === tipoLancamentoId);
  const tipoMovimento = tipoLancSelecionado?.tipoMovimento;
  const isBaixa = tipoLancSelecionado?.descricao?.includes("BAIXA");
  const isTransferencia = tipoMovimento === "TRANSFERENCIA";
  const isAdiantamento = tipoLancSelecionado?.descricao?.includes("ADIANTAMENTO");

  const getContaFinNome = (id: string) => contasFinanceiras.find((c) => c.id === id)?.descricao ?? "—";
  const getTipoLancNome = (id: string) => tiposLancamento.find((t) => t.id === id)?.descricao ?? "—";
  const getFormaPagtoNome = (id: string) => formasPagto.find((f) => f.id === id)?.descricao ?? "—";

  const movColors: Record<string, string> = {
    ENTRADA: "border-success/50 text-success",
    SAIDA: "border-destructive/50 text-destructive",
    TRANSFERENCIA: "border-blue-400 text-blue-600",
  };

  const reset = () => {
    setTipoLancamentoId(""); setContaFinanceiraId(""); setFormaPagamentoId("");
    setPlanoContaId(""); setCentroCustoId(""); setDataMovimento(new Date().toISOString().slice(0, 10));
    setValor(""); setNumeroDocumento(""); setHistorico("");
    setContaOrigemId(""); setContaDestinoId(""); setParcelaId(""); setPessoaId(""); setContaIdSelecionada("");
  };

  const openNew = () => { reset(); setModalOpen(true); };

  const handleSave = async () => {
    if (!tipoLancamentoId || !valor) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const result = await financeiroMovimentacaoService.registrar({
        contaFinanceiraId: isTransferencia ? (contaOrigemId || contaFinanceiraId) : contaFinanceiraId,
        tipoLancamentoId,
        formaPagamentoId,
        planoContaId: planoContaId || null,
        centroCustoId: centroCustoId || null,
        dataMovimento,
        valor: parseFloat(valor),
        numeroDocumento,
        historico,
        contaOrigemId: isTransferencia ? contaOrigemId : null,
        contaDestinoId: isTransferencia ? contaDestinoId : null,
        parcelaId: isBaixa ? (parcelaId || null) : null,
        pessoaId: isAdiantamento ? (pessoaId || null) : null,
      }, { grupoId, empresaId, filialId });

      if (result.sucesso) {
        toast({ title: result.mensagem });
        setModalOpen(false); carregar();
      } else {
        toast({ title: "Erro", description: result.mensagem, variant: "destructive" });
      }
    } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Caixa e Bancos" description="Movimentações financeiras — recebimentos, pagamentos e transferências" />
      <div className="flex justify-end mb-4">
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Nova Movimentação</Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Data</TableHead>
              <TableHead>Tipo Lançamento</TableHead>
              <TableHead>Conta Financeira</TableHead>
              <TableHead>Movimento</TableHead>
              <TableHead className="text-right w-36">Valor</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Histórico</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : movimentacoes.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma movimentação</TableCell></TableRow>
            ) : movimentacoes.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{new Date(m.dataMovimento).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>{getTipoLancNome(m.tipoLancamentoId)}</TableCell>
                <TableCell>{getContaFinNome(m.contaFinanceiraId)}</TableCell>
                <TableCell><Badge variant="outline" className={movColors[m.tipoMovimento]}>{m.tipoMovimento}</Badge></TableCell>
                <TableCell className="text-right font-mono">{fmt(m.valor)}</TableCell>
                <TableCell>{m.numeroDocumento || "—"}</TableCell>
                <TableCell className="text-muted-foreground truncate max-w-[200px]">{m.historico || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova Movimentação" saving={saving} onSave={handleSave} maxWidth="sm:max-w-3xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo de Lançamento <span className="text-destructive">*</span></Label>
              <Select value={tipoLancamentoId} onValueChange={setTipoLancamentoId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {tiposLancamento.filter((t) => t.ativo).map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.descricao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo Movimento</Label>
              <Input value={tipoMovimento ?? ""} disabled className="bg-muted" />
            </div>
          </div>

          {isTransferencia ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Conta Origem <span className="text-destructive">*</span></Label>
                <Select value={contaOrigemId} onValueChange={setContaOrigemId}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {contasFinanceiras.filter((c) => c.ativo).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.descricao} — {fmt(c.saldoAtual)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Conta Destino <span className="text-destructive">*</span></Label>
                <Select value={contaDestinoId} onValueChange={setContaDestinoId}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {contasFinanceiras.filter((c) => c.ativo && c.id !== contaOrigemId).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.descricao} — {fmt(c.saldoAtual)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Conta Financeira <span className="text-destructive">*</span></Label>
              <Select value={contaFinanceiraId} onValueChange={setContaFinanceiraId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {contasFinanceiras.filter((c) => c.ativo).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.descricao} — {fmt(c.saldoAtual)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isBaixa && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Conta (título)</Label>
                <Select value={contaIdSelecionada} onValueChange={setContaIdSelecionada}>
                  <SelectTrigger><SelectValue placeholder="Selecione a conta..." /></SelectTrigger>
                  <SelectContent>
                    {contas.filter((c) => c.status !== "LIQUIDADO" && c.status !== "CANCELADO").map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.descricao} — {fmt(c.valorTotal)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Parcela</Label>
                <Select value={parcelaId} onValueChange={(v) => {
                  setParcelaId(v);
                  const p = parcelas.find((p) => p.id === v);
                  if (p) setValor(String(p.saldoParcela));
                }}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {parcelas.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.numeroParcela}ª — Saldo: {fmt(p.saldoParcela)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {isAdiantamento && (
            <div className="space-y-1.5">
              <Label>Pessoa <span className="text-destructive">*</span></Label>
              <Select value={pessoaId} onValueChange={setPessoaId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {pessoas.map((p) => <SelectItem key={p.id} value={p.id}>{p.nomeRazao}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Valor <span className="text-destructive">*</span></Label>
              <Input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input type="date" value={dataMovimento} onChange={(e) => setDataMovimento(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Nº Documento</Label>
              <Input value={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Forma de Pagamento</Label>
              <Select value={formaPagamentoId} onValueChange={setFormaPagamentoId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {formasPagto.filter((f) => f.ativo).map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.descricao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Plano de Contas</Label>
              <Select value={planoContaId} onValueChange={setPlanoContaId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {planoContas.filter((p) => p.ativo).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.codigo} — {p.descricao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {tipoLancSelecionado?.exigeCentroCusto && (
              <div className="space-y-1.5">
                <Label>Centro de Custo <span className="text-destructive">*</span></Label>
                <Select value={centroCustoId} onValueChange={setCentroCustoId}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {centrosCusto.filter((c) => c.ativo).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.descricao}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Histórico</Label>
            <Textarea value={historico} onChange={(e) => setHistorico(e.target.value)} rows={2} />
          </div>
        </div>
      </CrudModal>
    </div>
  );
}