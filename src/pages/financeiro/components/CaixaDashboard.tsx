import { useState, useCallback } from "react";
import { CollapsibleDashboard } from "@/components/CollapsibleDashboard";
import { DashboardCard } from "@/components/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Landmark, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { financeiroContaFinanceiraService, financeiroTipoContaService, financeiroMovimentacaoService } from "@/lib/services";
import { useOrganization } from "@/contexts/OrganizationContext";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface State {
  saldoTotal: number;
  saldoCaixa: number;
  saldoBancos: number;
  movimentoMes: number;
  chartData: { label: string; entradas: number; saidas: number }[];
}

export function CaixaDashboard() {
  const { empresaAtual, filialAtual } = useOrganization();
  const [data, setData] = useState<State | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const empresaId = empresaAtual?.id ?? "";
    const filialId = filialAtual?.id ?? "";
    if (!empresaId || !filialId) return;
    setLoading(true);
    try {
      const [contas, tipos, movs] = await Promise.all([
        financeiroContaFinanceiraService.listar(empresaId, filialId),
        financeiroTipoContaService.listar(empresaId, filialId),
        financeiroMovimentacaoService.listar(empresaId, filialId),
      ]);
      const tipoMap: Record<string, string> = {};
      tipos.forEach((t: any) => { tipoMap[t.id] = (t.categoria || t.descricao || "").toUpperCase(); });

      const ativas = contas.filter((c) => c.ativo);
      const saldoTotal = ativas.reduce((s, c) => s + c.saldoAtual, 0);
      const saldoBancos = ativas
        .filter((c) => tipoMap[c.tipoContaId]?.includes("BANCO"))
        .reduce((s, c) => s + c.saldoAtual, 0);
      const saldoCaixa = saldoTotal - saldoBancos;

      // Últimos 6 meses
      const meses: { ym: string; entradas: number; saidas: number }[] = [];
      const base = new Date();
      base.setDate(1);
      for (let i = 5; i >= 0; i--) {
        const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        meses.push({ ym, entradas: 0, saidas: 0 });
      }
      for (const m of movs) {
        const ym = m.dataMovimento.slice(0, 7);
        const slot = meses.find((x) => x.ym === ym);
        if (!slot) continue;
        if (m.tipoMovimento === "ENTRADA") slot.entradas += m.valor;
        else if (m.tipoMovimento === "SAIDA") slot.saidas += m.valor;
      }
      const mesesLabel = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const chartData = meses.map((m) => {
        const [y, mm] = m.ym.split("-");
        return { label: `${mesesLabel[parseInt(mm) - 1]}/${y.slice(2)}`, entradas: m.entradas, saidas: m.saidas };
      });
      const ult = chartData[chartData.length - 1];
      const movimentoMes = (ult?.entradas ?? 0) - (ult?.saidas ?? 0);

      setData({ saldoTotal, saldoCaixa, saldoBancos, movimentoMes, chartData });
    } finally {
      setLoading(false);
    }
  }, [empresaAtual?.id, filialAtual?.id]);

  return (
    <CollapsibleDashboard title="Dashboard — Caixa e Bancos" onFirstExpand={load} loading={loading}>
      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <DashboardCard title="Saldo Total" value={fmt(data.saldoTotal)} icon={Wallet} accent="success" />
            <DashboardCard title="Saldo Caixa" value={fmt(data.saldoCaixa)} icon={Wallet} accent="info" />
            <DashboardCard title="Saldo Bancos" value={fmt(data.saldoBancos)} icon={Landmark} accent="primary" />
            <DashboardCard
              title="Movimento do Mês"
              value={fmt(data.movimentoMes)}
              icon={data.movimentoMes >= 0 ? ArrowDownCircle : ArrowUpCircle}
              accent={data.movimentoMes >= 0 ? "success" : "warning"}
            />
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Entradas vs Saídas — Últimos 6 Meses</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(v: number) => fmt(v)}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Legend />
                  <Bar dataKey="entradas" name="Entradas" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="saidas" name="Saídas" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </CollapsibleDashboard>
  );
}
