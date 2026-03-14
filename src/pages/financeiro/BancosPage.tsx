import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { financeiroBancoService } from "@/lib/services";
import type { FinanceiroBanco } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

const extraSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório"),
  logoBanco: z.string().optional(),
});

export default function BancosPage() {
  return (
    <SimpleCrudPage<FinanceiroBanco>
      title="Bancos"
      description="Cadastro de bancos"
      entityName="Banco"
      service={financeiroBancoService as any}
      extraSchema={extraSchema}
      extraDefaultValues={{ codigo: "", logoBanco: "" }}
      extraColumns={[
        { key: "codigo", header: "Código" },
      ]}
      getExtraData={(row) => ({ codigo: row.codigo, logoBanco: row.logoBanco })}
      renderExtraFields={({ register, errors }) => (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="codigo">Código <span className="text-destructive">*</span></Label>
            <Input id="codigo" maxLength={10} {...register("codigo")} />
            {errors.codigo && <p className="text-xs text-destructive">{(errors.codigo as any).message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="logoBanco">Logo (URL)</Label>
            <Input id="logoBanco" {...register("logoBanco")} placeholder="https://..." />
          </div>
        </>
      )}
    />
  );
}