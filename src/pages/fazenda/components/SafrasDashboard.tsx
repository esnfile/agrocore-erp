import { useState, useCallback } from "react";
import { CollapsibleDashboard } from "@/components/CollapsibleDashboard";
import { DashboardCard } from "@/components/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { Safra } from "../SafrasPage";

interface Props {
  safras: Safra[];
}

const STATUS_COLORS: Record<string, string> = {
  "Em Andamento": "hsl(var(--success))",
  "Planejada": "hsl(var(--info))",
  "Finalizada": "hsl(var(--primary))",
  "Cancelada": "hsl(var(--muted-foreground))",
};

export function SafrasDashboard({ safras }: Props) {
  const [open, setOpen] = useState(false);

  const data = (() => {
    if (!open) return null;
    const ativas = safras.filter((s) => s.status === "Em Andamento");
    const planejadas = safras.filter((s) => s.status === "Planejada");
    const finalizadas = safras.filter((s) => s.status === "Finalizada");
    const areaTotalAtivas = ativas.reduce((s, x) => s + (x.areaTotalHa || 0), 0);

    const grupos: Record<string, number> = {};
    safras.forEach((s) => { grupos[s.status] = (grupos[s.status] ?? 0) + (s.areaTotalHa || 0); });
    const porStatus = Object.entries(grupos).map(([status, area]) => ({
      status,
      area,
      color: STATUS_COLORS[status] ?? "hsl(var(--muted-foreground))",
    }));

    return {
      ativas: ativas.length,
      areaTotalAtivas,
      planejadas: planejadas.length,
      finalizadas: finalizadas.length,
      porStatus,
    };
  })();

  const load = useCallback(() => { setOpen(true); }, []);

  return (
    <CollapsibleDashboard title="Dashboard — Safras" onFirstExpand={load}>
      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <DashboardCard title="Safras Ativas" value={data.ativas} icon={Sprout} accent="success" />
            <DashboardCard
              title="Área Ativa (ha)"
              value={data.areaTotalAtivas.toLocaleString("pt-BR")}
              icon={Sprout}
              accent="primary"
            />
            <DashboardCard title="Planejadas" value={data.planejadas} icon={Calendar} accent="info" />
            <DashboardCard title="Finalizadas" value={data.finalizadas} icon={CheckCircle2} accent="primary" />
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Área (ha) por Status</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.porStatus} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="status" className="text-xs" width={110} />
                  <Tooltip
                    formatter={(v: number) => `${v.toLocaleString("pt-BR")} ha`}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Bar dataKey="area" name="Área (ha)" radius={[0, 4, 4, 0]}>
                    {data.porStatus.map((d) => <Cell key={d.status} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </CollapsibleDashboard>
  );
}
