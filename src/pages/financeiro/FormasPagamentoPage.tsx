import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { financeiroFormaPagtoService } from "@/lib/services";
import type { FinanceiroFormaPagto } from "@/lib/mock-data";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";

const extraSchema = z.object({
  tipo: z.enum(["DINHEIRO", "BANCARIO", "ELETRONICO"]),
});

export default function FormasPagamentoPage() {
  return (
    <SimpleCrudPage<FinanceiroFormaPagto>
      title="Formas de Pagamento"
      description="Cadastro de formas de pagamento"
      entityName="Forma de Pagamento"
      service={financeiroFormaPagtoService as any}
      extraSchema={extraSchema}
      extraDefaultValues={{ tipo: "DINHEIRO" }}
      extraColumns={[
        {
          key: "tipo" as any,
          header: "Tipo",
          render: (row) => <Badge variant="outline">{row.tipo}</Badge>,
        },
      ]}
      getExtraData={(row) => ({ tipo: row.tipo })}
      renderExtraFields={({ watch, setValue }) => (
        <div className="space-y-1.5">
          <Label>Tipo <span className="text-destructive">*</span></Label>
          <Select value={watch("tipo")} onValueChange={(v) => setValue("tipo", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
              <SelectItem value="BANCARIO">Bancário</SelectItem>
              <SelectItem value="ELETRONICO">Eletrônico</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    />
  );
}