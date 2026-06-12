import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { financeiroFormaPagtoService } from "@/lib/services";
import type { FinanceiroFormaPagto } from "@/lib/mock-data";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";

const extraSchema = z.object({
  tipo: z.enum(["DINHEIRO", "BANCARIO", "ELETRONICO"]),
  categoriaContabil: z.enum(["DINHEIRO", "CHEQUE", "CARTAO", "ADIANTAMENTO"]),
});

export default function FormasPagamentoPage() {
  return (
    <SimpleCrudPage<FinanceiroFormaPagto>
      title="Formas de Pagamento"
      description="Cadastro de formas de pagamento"
      entityName="Forma de Pagamento"
      service={financeiroFormaPagtoService as any}
      extraSchema={extraSchema}
      extraDefaultValues={{ tipo: "DINHEIRO", categoriaContabil: "DINHEIRO" }}
      extraColumns={[
        {
          key: "tipo" as any,
          header: "Tipo",
          render: (row) => <Badge variant="outline">{row.tipo}</Badge>,
        },
        {
          key: "categoriaContabil" as any,
          header: "Categoria Contábil",
          render: (row) => <Badge>{row.categoriaContabil}</Badge>,
        },
      ]}
      getExtraData={(row) => ({ tipo: row.tipo, categoriaContabil: row.categoriaContabil })}
      renderExtraFields={({ watch, setValue }) => (
        <>
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
          <div className="space-y-1.5">
            <Label>Categoria Contábil <span className="text-destructive">*</span></Label>
            <Select value={watch("categoriaContabil")} onValueChange={(v) => setValue("categoriaContabil", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DINHEIRO">Dinheiro (saldo imediato)</SelectItem>
                <SelectItem value="CHEQUE">Cheque (vai para o cofre)</SelectItem>
                <SelectItem value="CARTAO">Cartão (pendente)</SelectItem>
                <SelectItem value="ADIANTAMENTO">Adiantamento</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Define em qual "balde" do Caixa a forma se enquadra. Apenas formas DINHEIRO entram na composição do campo Dinheiro.
            </p>
          </div>
        </>
      )}
    />
  );
}
