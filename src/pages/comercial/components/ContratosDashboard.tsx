import { useState, useCallback } from "react";
import { CollapsibleDashboard } from "@/components/CollapsibleDashboard";
import { DashboardCard } from "@/components/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Package, DollarSign, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { contratoService } from "@/lib/services";
import { useOrganization } from "@/contexts/OrganizationContext";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtTon = (v: number) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} t`;

interface State {
  ativos: number;
  volumeSaldo: number;
  valorAberto: number;
  vencidos: number;
  porStatus: { status: string; count: number; color: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  ABERTO: "hsl(var(--success))",
  PARCIAL: "hsl(var(--info))",
  FATURADO: "hsl(var(--chart-3))",
  FINALIZADO: "hsl(var(--primary))",
  LIQUIDADO: "hsl(var(--chart-5))",
  CANCELADO: "hsl(var(--muted-foreground))",
};

export function ContratosDashboard() {
  const { grupoAtual } = useOrganization();
  const [data, setData] = useState<State | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!grupoAtual?.id) return;
    setLoading(true);
    try {
      const lista = await contratoService.listarTodos(grupoAtual.id);
      const hoje = new Date().toISOString().slice(0, 10);
      const ativos = lista.filter((c) => c.status === "ABERTO" || c.status === "PARCIAL");
      const volumeSaldo = ativos.reduce((s, c) => s + (c.quantidadeSaldo || 0), 0);
      const valorAberto = ativos.reduce((s, c) => s + (c.quantidadeSaldo || 0) * (c.precoUnitario || 0), 0);
      const vencidos = lista.filter(
        (c) =>
          c.dataEntregaFim < hoje &&
          c.status !== "FINALIZADO" &&
          c.status !== "LIQUIDADO" &&
          c.status !== "CANCELADO"
      ).length;

      const grupos: Record<string, number> = {};
      lista.forEach((c) => { grupos[c.status] = (grupos[c.status] ?? 0) + 1; });
      const porStatus = Object.entries(grupos).map(([status, count]) => ({
        status,
        count,
        color: STATUS_COLORS[status] ?? "hsl(var(--muted-foreground))",
      }));

      setData({ ativos: ativos.length, volumeSaldo, valorAberto, vencidos, porStatus });
    } finally {
      setLoading(false);
    }
  }, [grupoAtual?.id]);

  return (
    <CollapsibleDashboard title="Dashboard — Contratos" onFirstExpand={load} loading={loading}>
      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <DashboardCard title="Contratos Ativos" value={data.ativos} icon={FileText} accent="success" />
            <DashboardCard title="Volume em Saldo" value={fmtTon(data.volumeSaldo)} icon={Package} accent="info" />
            <DashboardCard title="Valor em Aberto" value={fmt(data.valorAberto)} icon={DollarSign} accent="warning" />
            <DashboardCard title="Contratos Vencidos" value={data.vencidos} icon={AlertTriangle} accent="destructive" />
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Contratos por Status</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.porStatus} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" allowDecimals={false} />
                  <YAxis type="category" dataKey="status" className="text-xs" width={90} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="count" name="Contratos" radius={[0, 4, 4, 0]}>
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
