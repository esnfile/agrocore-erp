import { useState, useEffect, useMemo, useCallback } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownCircle, ArrowUpCircle, DollarSign, TrendingUp } from "lucide-react";
import { financeiroContaService, financeiroParcelaService, pessoaService } from "@/lib/services";
import type { FinanceiroConta, FinanceiroParcela, Pessoa } from "@/lib/mock-data";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface FluxoItem {
  data: string;
  pessoaId: string;
  descricao: string;
  tipo: "ENTRADA" | "SAIDA";
  valor: number;
  saldoAcumulado: number;
}

export default function FluxoCaixaPage() {
  const { empresaId, filialId } = useOrganization();

  const [contas, setContas] = useState<FinanceiroConta[]>([]);
  const [parcelas, setParcelas] = useState<FinanceiroParcela[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
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
    const [c, p] = await Promise.all([
      financeiroContaService.listar(empresaId, filialId),
      pessoaService.listar(empresaId, filialId),
    ]);
    setContas(c);
    setPessoas(p);
    // Load all parcelas
    const allParcelas: FinanceiroParcela[] = [];
    for (const conta of c) {
      const parcsConta = await financeiroParcelaService.listarPorConta(conta.id);
      allParcelas.push(...parcsConta);
    }
    setParcelas(allParcelas);
    setLoading(false);
  }, [empresaId, filialId]);

  useEffect(() => { carregar(); }, [carregar]);

  const getNomePessoa = (id: string) => pessoas.find((p) => p.id === id)?.nomeRazao ?? "—";

  const { itens, entradasPrevistas, saidasPrevistas, saldoProjetado } = useMemo(() => {
    const items: FluxoItem[] = [];

    for (const parcela of parcelas) {
      const conta = contas.find((c) => c.id === parcela.contaId);
      if (!conta) continue;
      if (parcela.dataVencimento < dataInicio || parcela.dataVencimento > dataFim) continue;

      const tipo = conta.tipo === "RECEBER" ? "ENTRADA" as const : "SAIDA" as const;
      items.push({
        data: parcela.dataVencimento,
        pessoaId: conta.pessoaId,
        descricao: `${conta.descricao} (${parcela.numeroParcela}ª parcela)`,
        tipo,
        valor: parcela.status === "PAGO" ? parcela.valorParcela : parcela.saldoParcela,
        saldoAcumulado: 0,
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
  }, [parcelas, contas, dataInicio, dataFim]);

  return (
    <div>
      <PageHeader title="Fluxo de Caixa" description="Visão consolidada de entradas e saídas previstas" />

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
            <CardTitle className="text-sm font-medium text-muted-foreground">Entradas Previstas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{fmt(entradasPrevistas)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saídas Previstas</CardTitle>
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
              <TableHead>Pessoa</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-32 text-right">Entrada</TableHead>
              <TableHead className="w-32 text-right">Saída</TableHead>
              <TableHead className="w-36 text-right">Saldo Acumulado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : itens.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma movimentação no período</TableCell></TableRow>
            ) : itens.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{new Date(item.data).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>{getNomePessoa(item.pessoaId)}</TableCell>
                <TableCell>{item.descricao}</TableCell>
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
