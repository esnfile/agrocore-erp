import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { financeiroChequeService } from "@/lib/services";
import type { FinanceiroCheque } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";

const extraSchema = z.object({
  numero: z.string().min(1, "Número é obrigatório"),
  banco: z.string().min(1, "Banco é obrigatório"),
  agencia: z.string().optional().default(""),
  conta: z.string().optional().default(""),
  titular: z.string().optional().default(""),
  valor: z.coerce.number().positive("Valor deve ser maior que zero"),
  dataEmissao: z.string().min(1, "Data de emissão obrigatória"),
  dataVencimento: z.string().min(1, "Data de vencimento obrigatória"),
  status: z.enum(["DISPONIVEL", "UTILIZADO", "COMPENSADO", "DEVOLVIDO"]),
});

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ChequesPage() {
  return (
    <SimpleCrudPage<FinanceiroCheque>
      title="Cheques"
      description="Cadastro de cheques (cofre) — disponíveis para pagamentos"
      entityName="Cheque"
      service={financeiroChequeService as any}
      extraSchema={extraSchema}
      extraDefaultValues={{
        numero: "", banco: "", agencia: "", conta: "", titular: "",
        valor: 0, dataEmissao: "", dataVencimento: "", status: "DISPONIVEL",
      }}
      extraColumns={[
        { key: "numero" as any, header: "Número" },
        { key: "banco" as any, header: "Banco" },
        { key: "valor" as any, header: "Valor", render: (r: any) => <span className="font-mono">{fmt(r.valor)}</span> },
        { key: "status" as any, header: "Status", render: (r: any) => <Badge>{r.status}</Badge> },
      ]}
      getExtraData={(r) => ({
        numero: r.numero, banco: r.banco, agencia: r.agencia, conta: r.conta, titular: r.titular,
        valor: r.valor, dataEmissao: r.dataEmissao, dataVencimento: r.dataVencimento, status: r.status,
      })}
      renderExtraFields={({ register, errors, watch, setValue }) => (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Número *</Label>
            <Input {...register("numero")} />
            {errors.numero && <p className="text-xs text-destructive">{(errors.numero as any).message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Banco *</Label>
            <Input {...register("banco")} />
          </div>
          <div className="space-y-1.5">
            <Label>Agência</Label>
            <Input {...register("agencia")} />
          </div>
          <div className="space-y-1.5">
            <Label>Conta</Label>
            <Input {...register("conta")} />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>Titular</Label>
            <Input {...register("titular")} />
          </div>
          <div className="space-y-1.5">
            <Label>Valor *</Label>
            <Input type="number" step="0.01" {...register("valor", { valueAsNumber: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={watch("status")} onValueChange={(v) => setValue("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                <SelectItem value="UTILIZADO">Utilizado</SelectItem>
                <SelectItem value="COMPENSADO">Compensado</SelectItem>
                <SelectItem value="DEVOLVIDO">Devolvido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Data Emissão *</Label>
            <Input type="date" {...register("dataEmissao")} />
          </div>
          <div className="space-y-1.5">
            <Label>Data Vencimento *</Label>
            <Input type="date" {...register("dataVencimento")} />
          </div>
        </div>
      )}
    />
  );
}
