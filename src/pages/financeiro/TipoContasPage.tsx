import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { financeiroTipoContaService } from "@/lib/services";
import type { FinanceiroTipoConta } from "@/lib/mock-data";

export default function TipoContasPage() {
  return (
    <SimpleCrudPage<FinanceiroTipoConta>
      title="Tipo de Contas"
      description="Cadastro de tipos de conta financeira"
      entityName="Tipo de Conta"
      service={financeiroTipoContaService as any}
    />
  );
}