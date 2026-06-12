import { useState, useCallback } from "react";
import { CollapsibleDashboard } from "@/components/CollapsibleDashboard";
import { DashboardCard } from "@/components/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, AlertTriangle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { FinanceiroConta, FinanceiroParcela } from "@/lib/mock-data";

type ParcelaComConta = FinanceiroParcela & { conta?: FinanceiroConta };

interface Props {
  parcelas: ParcelaComConta[];
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function ContasDashboard({ parcelas }: Props) {
  const [open, setOpen] = useState(false);
  const load = useCallback(() => { setOpen(true); }, []);

  const data = (() => {
    if (!open) return null;
    const hoje = new Date().toISOString().slice(0, 10);
    const aberta = (p: ParcelaComConta) => p.status !== "PAGO" && p.status !== "CANCELADA";

    const totalPagar = parcelas
      .filter((p) => p.conta?.tipo === "PAGAR" && aberta(p))
      .reduce((s, p) => s + p.saldoParcela, 0);
    const totalReceber = parcelas
      .filter((p) => p.conta?.tipo === "RECEBER" && aberta(p))
      .reduce((s, p) => s + p.saldoParcela, 0);
    const vencido = parcelas
      .filter((p) => aberta(p) && p.dataVencimento < hoje)
      .reduce((s, p) => s + p.saldoParcela, 0);
    const aVencer = parcelas
      .filter((p) => aberta(p) && p.dataVencimento >= hoje)
      .reduce((s, p) => s + p.saldoParcela, 0);

    // Próximos 6 meses
    const meses: { mes: string; aPagar: number; aReceber: number }[] = [];
    const base = new Date();
    base.setDate(1);
    for (let i = 0; i < 6; i++) {
      const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      meses.push({ mes: key, aPagar: 0, aReceber: 0 });
    }
    for (const p of parcelas) {
      if (!aberta(p)) continue;
      const key = p.dataVencimento.slice(0, 7);
      const slot = meses.find((m) => m.mes === key);
      if (!slot) continue;
      if (p.conta?.tipo === "PAGAR") slot.aPagar += p.saldoParcela;
      else if (p.conta?.tipo === "RECEBER") slot.aReceber += p.saldoParcela;
    }
    const mesesLabel = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const chartData = meses.map((m) => {
      const [y, mm] = m.mes.split("-");
      return { ...m, label: `${mesesLabel[parseInt(mm) - 1]}/${y.slice(2)}` };
    });

    return { totalPagar, totalReceber, vencido, aVencer, chartData };
  })();

  return (
    <CollapsibleDashboard title="Dashboard — Contas" onFirstExpand={load}>
      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <DashboardCard title="Total a Pagar" value={fmt(data.totalPagar)} icon={ArrowUpCircle} accent="warning" />
            <DashboardCard title="Total a Receber" value={fmt(data.totalReceber)} icon={ArrowDownCircle} accent="success" />
            <DashboardCard title="Saldo Vencido" value={fmt(data.vencido)} icon={AlertTriangle} accent="destructive" />
            <DashboardCard title="Saldo a Vencer" value={fmt(data.aVencer)} icon={Clock} accent="info" />
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Próximos 6 Meses — A Pagar vs A Receber</CardTitle></CardHeader>
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
                  <Bar dataKey="aPagar" name="A Pagar" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="aReceber" name="A Receber" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </CollapsibleDashboard>
  );
}
