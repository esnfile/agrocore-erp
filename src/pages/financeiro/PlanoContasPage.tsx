import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { financeiroPlanoContaService } from "@/lib/services";
import type { FinanceiroPlanoConta } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";

const extraSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório"),
  tipo: z.enum(["RECEITA", "DESPESA"]),
});

export default function PlanoContasPage() {
  return (
    <SimpleCrudPage<FinanceiroPlanoConta>
      title="Plano de Contas"
      description="Cadastro do plano de contas"
      entityName="Plano de Conta"
      service={financeiroPlanoContaService as any}
      extraSchema={extraSchema}
      extraDefaultValues={{ codigo: "", tipo: "RECEITA" }}
      extraColumns={[
        { key: "codigo" as any, header: "Código" },
        {
          key: "tipo" as any,
          header: "Tipo",
          render: (row) => (
            <Badge variant="outline" className={row.tipo === "RECEITA" ? "border-success/50 text-success" : "border-destructive/50 text-destructive"}>
              {row.tipo}
            </Badge>
          ),
        },
      ]}
      getExtraData={(row) => ({ codigo: row.codigo, tipo: row.tipo })}
      renderExtraFields={({ register, errors, watch, setValue }) => (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="codigo">Código <span className="text-destructive">*</span></Label>
            <Input id="codigo" maxLength={20} {...register("codigo")} />
            {errors.codigo && <p className="text-xs text-destructive">{(errors.codigo as any).message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Tipo <span className="text-destructive">*</span></Label>
            <Select value={watch("tipo")} onValueChange={(v) => setValue("tipo", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="RECEITA">Receita</SelectItem>
                <SelectItem value="DESPESA">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    />
  );
}