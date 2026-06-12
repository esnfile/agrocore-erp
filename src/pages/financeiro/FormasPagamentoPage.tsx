import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { financeiroFormaPagtoService } from "@/lib/services";
import type { FinanceiroFormaPagto } from "@/lib/mock-data";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Banknote, FileCheck2, CreditCard, Wallet, type LucideIcon } from "lucide-react";
import { z } from "zod";

type CategoriaContabil = "DINHEIRO" | "CHEQUE" | "CARTAO" | "ADIANTAMENTO";

const CATEGORIA_META: Record<CategoriaContabil, { label: string; icon: LucideIcon; className: string }> = {
  DINHEIRO: {
    label: "Dinheiro",
    icon: Banknote,
    className: "border-success/30 bg-success/10 text-success hover:bg-success/15",
  },
  CHEQUE: {
    label: "Cheque",
    icon: FileCheck2,
    className: "border-info/30 bg-info/10 text-info hover:bg-info/15",
  },
  CARTAO: {
    label: "Cartão",
    icon: CreditCard,
    className: "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15",
  },
  ADIANTAMENTO: {
    label: "Adiantamento",
    icon: Wallet,
    className: "border-warning/30 bg-warning/10 text-warning hover:bg-warning/15",
  },
};

const TIPO_META: Record<string, string> = {
  DINHEIRO: "border-success/30 text-success",
  BANCARIO: "border-info/30 text-info",
  ELETRONICO: "border-primary/30 text-primary",
};

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
          render: (row) => (
            <Badge variant="outline" className={TIPO_META[row.tipo] ?? ""}>
              {row.tipo}
            </Badge>
          ),
        },
        {
          key: "categoriaContabil" as any,
          header: "Categoria Contábil",
          render: (row) => {
            const meta = CATEGORIA_META[row.categoriaContabil as CategoriaContabil];
            if (!meta) return <Badge>{row.categoriaContabil}</Badge>;
            const Icon = meta.icon;
            return (
              <Badge variant="outline" className={`gap-1 ${meta.className}`}>
                <Icon className="h-3 w-3" />
                {meta.label}
              </Badge>
            );
          },
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
