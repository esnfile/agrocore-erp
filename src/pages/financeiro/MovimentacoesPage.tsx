import { Fragment, useState, useEffect, useCallback } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ChevronRight, ChevronDown } from "lucide-react";
import {
  financeiroMovimentacaoService, financeiroTipoLancamentoService,
  financeiroContaFinanceiraService, financeiroCentroCustoService,
  pessoaService, financeiroFormaPagtoService,
} from "@/lib/services";
import type {
  FinanceiroMovimentacao, FinanceiroTipoLancamento, FinanceiroContaFinanceira,
  FinanceiroCentroCusto, Pessoa, FinanceiroFormaPagto,
} from "@/lib/mock-data";
import { LancamentoCaixaModal } from "./lancamento/LancamentoCaixaModal";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtOrDash = (v: number) =>
  v && v > 0 ? v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

export default function MovimentacoesPage() {
  const { empresaAtual, filialAtual } = useOrganization();
  const empresaId = empresaAtual?.id ?? "";
  const filialId = filialAtual?.id ?? "";

  const [movimentacoes, setMovimentacoes] = useState<FinanceiroMovimentacao[]>([]);
  const [tiposLancamento, setTiposLancamento] = useState<FinanceiroTipoLancamento[]>([]);
  const [contasFinanceiras, setContasFinanceiras] = useState<FinanceiroContaFinanceira[]>([]);
  const [centrosCusto, setCentrosCusto] = useState<FinanceiroCentroCusto[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [formasPagto, setFormasPagto] = useState<FinanceiroFormaPagto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const carregar = useCallback(async () => {
    setLoading(true);
    const [m, tl, cf, cc, pess, fp] = await Promise.all([
      financeiroMovimentacaoService.listar(empresaId, filialId),
      financeiroTipoLancamentoService.listar(empresaId, filialId),
      financeiroContaFinanceiraService.listar(empresaId, filialId),
      financeiroCentroCustoService.listar(empresaId, filialId),
      pessoaService.listar(empresaId, filialId),
      financeiroFormaPagtoService.listar(empresaId, filialId),
    ]);
    setMovimentacoes(m); setTiposLancamento(tl); setContasFinanceiras(cf);
    setCentrosCusto(cc); setPessoas(pess); setFormasPagto(fp);
    setLoading(false);
  }, [empresaId, filialId]);

  useEffect(() => { carregar(); }, [carregar]);

  const getContaFinNome = (id: string) => contasFinanceiras.find((c) => c.id === id)?.descricao ?? "—";
  const getTipoLanc = (id: string) => tiposLancamento.find((t) => t.id === id);
  const getPessoaNome = (id: string | null) => id ? pessoas.find((p) => p.id === id)?.nomeRazao ?? "—" : "—";
  const getCcNome = (id: string | null) => id ? centrosCusto.find((c) => c.id === id)?.descricao ?? "—" : "—";

  const movColors: Record<string, string> = {
    ENTRADA: "border-success/50 text-success",
    SAIDA: "border-destructive/50 text-destructive",
    TRANSFERENCIA: "border-blue-400 text-blue-600",
  };

  return (
    <div>
      <PageHeader title="Caixa e Bancos" description="Movimentações financeiras — recebimentos, pagamentos e transferências" />
      <div className="flex justify-end mb-4">
        <Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4 mr-1" />Novo Lançamento</Button>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead className="w-32">Documento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="w-28">Data</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead>Movimento</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-right">Dinheiro</TableHead>
              <TableHead className="text-right">Cheque</TableHead>
              <TableHead className="text-right">Cartão</TableHead>
              <TableHead className="text-right">Adiantamento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : movimentacoes.length === 0 ? (
              <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">Nenhuma movimentação</TableCell></TableRow>
            ) : movimentacoes.map((m) => {
              const tipo = getTipoLanc(m.tipoLancamentoId);
              const fp = m.formasPagamentoDetalhe;
              const isOpen = !!expanded[m.id];
              return (
                <Fragment key={m.id}>
                  <TableRow key={m.id} className="cursor-pointer" onClick={() => setExpanded((s) => ({ ...s, [m.id]: !s[m.id] }))}>
                    <TableCell>
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{m.numeroDocumento || "—"}</TableCell>
                    <TableCell>{tipo?.descricao ?? "—"}</TableCell>
                    <TableCell>{new Date(m.dataMovimento).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{getContaFinNome(m.contaFinanceiraId)}</TableCell>
                    <TableCell><Badge variant="outline" className={movColors[m.tipoMovimento]}>{m.tipoMovimento}</Badge></TableCell>
                    <TableCell className="text-right font-mono font-semibold">{fmt(m.valor)}</TableCell>
                    <TableCell className="text-right font-mono">{fp ? fmtOrDash(fp.dinheiro) : "—"}</TableCell>
                    <TableCell className="text-right font-mono">{fp ? fmtOrDash(fp.cheque) : "—"}</TableCell>
                    <TableCell className="text-right font-mono">{fp ? fmtOrDash(fp.cartao) : "—"}</TableCell>
                    <TableCell className="text-right font-mono">{fp ? fmtOrDash(fp.adiantamento) : "—"}</TableCell>
                  </TableRow>
                  {isOpen && (
                    <TableRow key={m.id + "-det"} className="bg-muted/30 hover:bg-muted/30">
                      <TableCell></TableCell>
                      <TableCell colSpan={10} className="text-sm py-3 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1">
                          <div><span className="text-muted-foreground">Pessoa/Sócio: </span><span className="font-medium">{getPessoaNome(m.pessoaId)}</span></div>
                          <div><span className="text-muted-foreground">Centro de Custo: </span><span className="font-medium">{getCcNome(m.centroCustoId)}</span></div>
                          <div><span className="text-muted-foreground">Categoria: </span><span className="font-medium">{tipo?.categoria ?? "—"}</span></div>
                          <div className="md:col-span-3"><span className="text-muted-foreground">Histórico: </span><span>{m.historico || "—"}</span></div>
                        </div>
                        {m.parcelasLiquidadas && m.parcelasLiquidadas.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Duplicatas liquidadas</p>
                            <div className="rounded-md border bg-background overflow-hidden">
                              <table className="w-full text-xs">
                                <thead className="bg-muted/40">
                                  <tr>
                                    <th className="text-left px-2 py-1">Parcela</th>
                                    <th className="text-right px-2 py-1">Valor</th>
                                    <th className="text-left px-2 py-1">Status anterior</th>
                                    <th className="text-left px-2 py-1">Status atual</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {m.parcelasLiquidadas.map((p) => (
                                    <tr key={p.parcelaId} className="border-t">
                                      <td className="px-2 py-1 font-mono">{p.parcelaId}</td>
                                      <td className="px-2 py-1 text-right font-mono">{fmt(p.valorLiquidado)}</td>
                                      <td className="px-2 py-1">{p.statusAntes}</td>
                                      <td className="px-2 py-1 font-medium">{p.statusDepois}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        {m.adiantamentosUsados && m.adiantamentosUsados.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Adiantamentos utilizados</p>
                            <ul className="text-xs space-y-0.5">
                              {m.adiantamentosUsados.map((a) => (
                                <li key={a.adiantamentoId} className="font-mono">{a.adiantamentoId} — {fmt(a.valor)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <LancamentoCaixaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={carregar}
        tiposLancamento={tiposLancamento}
        contasFinanceiras={contasFinanceiras}
        pessoas={pessoas}
        centrosCusto={centrosCusto}
      />
    </div>
  );
}
