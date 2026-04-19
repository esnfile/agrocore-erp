import { useState, useEffect, useMemo, useCallback } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownCircle, ArrowUpCircle, DollarSign, TrendingUp } from "lucide-react";
import {
  financeiroMovimentacaoService,
  financeiroContaFinanceiraService,
  financeiroTipoLancamentoService,
  financeiroFormaPagtoService,
  financeiroContaService,
  financeiroParcelaService,
  pessoaService,
} from "@/lib/services";
import type { FinanceiroMovimentacao, FinanceiroParcela, FinanceiroConta } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type FluxoStatus = "REALIZADO" | "PENDENTE" | "PREVISTO";

interface FluxoItem {
  data: string;
  descricao: string;
  tipo: "ENTRADA" | "SAIDA";
  valor: number;
  saldoAcumulado: number;
  status: FluxoStatus;
  contaFinanceira: string;
  formaPagamento: string;
  documento: string;
}

export default function FluxoCaixaPage() {
  const { empresaAtual, filialAtual } = useOrganization();
  const empresaId = empresaAtual?.id ?? "";
  const filialId = filialAtual?.id ?? "";

  const [loading, setLoading] = useState(true);
  const [movimentacoes, setMovimentacoes] = useState<FinanceiroMovimentacao[]>([]);
  const [parcelasPendentes, setParcelasPendentes] = useState<FinanceiroParcela[]>([]);
  const [contas, setContas] = useState<FinanceiroConta[]>([]);
  const [contasFinMap, setContasFinMap] = useState<Record<string, string>>({});
  const [formasMap, setFormasMap] = useState<Record<string, string>>({});
  const [tiposLancMap, setTiposLancMap] = useState<Record<string, string>>({});

  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [dataFim, setDataFim] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 10);
  });

  const carregar = useCallback(async () => {
    setLoading(true);
    const [movs, cfs, fps, tls, cts, pss] = await Promise.all([
      financeiroMovimentacaoService.listar(empresaId, filialId),
      financeiroContaFinanceiraService.listar(empresaId, filialId),
      financeiroFormaPagtoService.listar(empresaId, filialId),
      financeiroTipoLancamentoService.listar(empresaId, filialId),
      financeiroContaService.listar(empresaId, filialId),
      pessoaService.listar(empresaId, filialId),
    ]);
    setMovimentacoes(movs);
    setContas(cts);

    const cfMap: Record<string, string> = {};
    cfs.forEach((c) => { cfMap[c.id] = c.descricao; });
    setContasFinMap(cfMap);
    const fpMap: Record<string, string> = {};
    fps.forEach((f) => { fpMap[f.id] = f.descricao; });
    setFormasMap(fpMap);
    const tlMap: Record<string, string> = {};
    tls.forEach((t) => { tlMap[t.id] = t.descricao; });
    setTiposLancMap(tlMap);

    // Load all parcelas pendentes (not yet fully paid)
    const allParcelas: FinanceiroParcela[] = [];
    for (const conta of cts) {
      const parcsConta = await financeiroParcelaService.listarPorConta(conta.id);
      allParcelas.push(...parcsConta.filter((p) => p.status !== "PAGO"));
    }
    setParcelasPendentes(allParcelas);
    setLoading(false);
  }, [empresaId, filialId]);

  useEffect(() => { carregar(); }, [carregar]);

  const { itens, entradasPrevistas, saidasPrevistas, saldoProjetado } = useMemo(() => {
    const items: FluxoItem[] = [];

    // 1. Movimentações realizadas
    for (const mov of movimentacoes) {
      if (mov.dataMovimento < dataInicio || mov.dataMovimento > dataFim) continue;
      if (mov.tipoMovimento === "TRANSFERENCIA") continue; // transfers are internal
      items.push({
        data: mov.dataMovimento,
        descricao: `${tiposLancMap[mov.tipoLancamentoId] ?? "Movimentação"} — ${mov.historico || mov.numeroDocumento || ""}`,
        tipo: mov.tipoMovimento === "ENTRADA" ? "ENTRADA" : "SAIDA",
        valor: mov.valor,
        saldoAcumulado: 0,
        status: "REALIZADO",
        contaFinanceira: contasFinMap[mov.contaFinanceiraId] ?? "",
        formaPagamento: formasMap[mov.formaPagamentoId] ?? "",
        documento: mov.numeroDocumento,
      });
    }

    // 2. Parcelas pendentes como previsão (exclude parcelas already linked to movimentações)
    const parcelasComMov = new Set(movimentacoes.filter((m) => m.parcelaId).map((m) => m.parcelaId));
    for (const parcela of parcelasPendentes) {
      if (parcela.dataVencimento < dataInicio || parcela.dataVencimento > dataFim) continue;
      const conta = contas.find((c) => c.id === parcela.contaId);
      if (!conta) continue;
      // Only show remaining balance for partially paid
      const valorRestante = parcela.saldoParcela;
      if (valorRestante <= 0) continue;
      const isPrevisto = parcela.status === "PREVISTO";
      const sufixo = isPrevisto ? "Previsto" : "Pendente";
      items.push({
        data: parcela.dataVencimento,
        descricao: `${conta.descricao} (${parcela.numeroParcela}ª parcela) — ${sufixo}`,
        tipo: conta.tipo === "RECEBER" ? "ENTRADA" : "SAIDA",
        valor: valorRestante,
        saldoAcumulado: 0,
        status: isPrevisto ? "PREVISTO" : "PENDENTE",
        contaFinanceira: "",
        formaPagamento: "",
        documento: "",
      });
    }

    items.sort((a, b) => a.data.localeCompare(b.data));

    let saldo = 0;
    for (const item of items) {
      if (item.tipo === "ENTRADA") saldo += item.valor;
      else saldo -= item.valor;
      item.saldoAcumulado = saldo;
    }

    const entradas = items.filter((i) => i.tipo === "ENTRADA").reduce((s, i) => s + i.valor, 0);
    const saidas = items.filter((i) => i.tipo === "SAIDA").reduce((s, i) => s + i.valor, 0);

    return { itens: items, entradasPrevistas: entradas, saidasPrevistas: saidas, saldoProjetado: entradas - saidas };
  }, [movimentacoes, parcelasPendentes, contas, dataInicio, dataFim, contasFinMap, formasMap, tiposLancMap]);

  return (
    <div>
      <PageHeader title="Fluxo de Caixa" description="Visão consolidada de entradas e saídas — realizadas e previstas" />

      {/* Filtros */}
      <div className="flex gap-4 mb-6 items-end">
        <div>
          <Label className="text-xs">Data Início</Label>
          <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-40" />
        </div>
        <div>
          <Label className="text-xs">Data Fim</Label>
          <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-40" />
        </div>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Inicial</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Entradas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{fmt(entradasPrevistas)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saídas</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{fmt(saidasPrevistas)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Projetado</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoProjetado >= 0 ? "text-success" : "text-destructive"}`}>{fmt(saldoProjetado)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Grid */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Conta Financeira</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-32 text-right">Entrada</TableHead>
              <TableHead className="w-32 text-right">Saída</TableHead>
              <TableHead className="w-36 text-right">Saldo Acumulado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : itens.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma movimentação no período</TableCell></TableRow>
            ) : itens.map((item, idx) => (
              <TableRow key={idx} className={item.status !== "REALIZADO" ? "opacity-80" : ""}>
                <TableCell>{new Date(item.data).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>{item.descricao}</TableCell>
                <TableCell>{item.contaFinanceira || "—"}</TableCell>
                <TableCell>
                  {item.status === "REALIZADO" ? (
                    <StatusBadge status="PAGO" label="Realizado" />
                  ) : item.status === "PENDENTE" ? (
                    <StatusBadge status="PENDENTE" />
                  ) : (
                    <StatusBadge status="PREVISTO" />
                  )}
                </TableCell>
                <TableCell className="text-right font-mono text-success">
                  {item.tipo === "ENTRADA" ? fmt(item.valor) : ""}
                </TableCell>
                <TableCell className="text-right font-mono text-destructive">
                  {item.tipo === "SAIDA" ? fmt(item.valor) : ""}
                </TableCell>
                <TableCell className={`text-right font-mono font-semibold ${item.saldoAcumulado >= 0 ? "text-success" : "text-destructive"}`}>
                  {fmt(item.saldoAcumulado)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
