import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { financeiroCentroCustoService } from "@/lib/services";
import type { FinanceiroCentroCusto } from "@/lib/mock-data";

export default function CentrosCustoPage() {
  return (
    <SimpleCrudPage<FinanceiroCentroCusto>
      title="Centros de Custo"
      description="Cadastro de centros de custo"
      entityName="Centro de Custo"
      service={financeiroCentroCustoService as any}
    />
  );
}