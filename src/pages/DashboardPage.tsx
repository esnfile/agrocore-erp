import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Building2, GitBranch, Package, DollarSign } from "lucide-react";

export default function DashboardPage() {
  const { empresaAtual, filialAtual } = useOrganization();

  const cards = [
    { title: "Empresa", value: empresaAtual?.nomeFantasia ?? "—", icon: Building2 },
    { title: "Filial", value: filialAtual?.nome ?? "—", icon: GitBranch },
    { title: "Contratos", value: "0", icon: Package },
    { title: "Financeiro", value: "R$ 0,00", icon: DollarSign },
  ];

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
    </>
  );
}
