import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Building2, GitBranch, Package, DollarSign, AlertTriangle, Clock } from "lucide-react";
import { financeiroParcelaService } from "@/lib/services";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { empresaAtual, filialAtual, grupoAtual } = useOrganization();

  const [fluxoData, setFluxoData] = useState<{ mes: string; previsoes: number; aPagar: number; pago: number }[]>([]);
  const [totalPrevisoes, setTotalPrevisoes] = useState(0);
  const [totalAPagar, setTotalAPagar] = useState(0);

  useEffect(() => {
    if (!grupoAtual?.id) return;
    financeiroParcelaService.listarPrevisoesFluxo(grupoAtual.id).then((data) => {
      setFluxoData(data);
      setTotalPrevisoes(data.reduce((s, d) => s + d.previsoes, 0));
      setTotalAPagar(data.reduce((s, d) => s + d.aPagar, 0));
    });
  }, [grupoAtual?.id]);

  const cards = [
    { title: "Empresa", value: empresaAtual?.nome ?? "—", icon: Building2 },
    { title: "Filial", value: filialAtual?.nomeRazao ?? "—", icon: GitBranch },
    { title: "Contratos", value: "0", icon: Package },
    { title: "Financeiro", value: "R$ 0,00", icon: DollarSign },
  ];

  const formatMes = (mes: string) => {
    const [y, m] = mes.split("-");
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${meses[parseInt(m) - 1]}/${y.slice(2)}`;
  };

  return (
    <>
      <PageHeader title="Dashboard" description="Visão geral do sistema" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Previsão de Fluxo de Caixa */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Previsão de Fluxo de Caixa</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-l-4" style={{ borderLeftColor: "hsl(var(--chart-4))" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Previsões (Pendentes)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {totalPrevisoes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Parcelas pendentes com vencimento futuro</p>
            </CardContent>
          </Card>
          <Card className="border-l-4" style={{ borderLeftColor: "hsl(var(--destructive))" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">A Pagar / Vencidas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">
                {totalAPagar.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Parcelas vencidas ou com pagamento parcial</p>
            </CardContent>
          </Card>
        </div>

        {fluxoData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Fluxo por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fluxoData.map((d) => ({ ...d, mesLabel: formatMes(d.mes) }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="mesLabel" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Legend />
                  <Bar dataKey="previsoes" name="Previsões" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="aPagar" name="A Pagar" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pago" name="Pago" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
