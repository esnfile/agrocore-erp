import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { financeiroCartaoService } from "@/lib/services";
import type { FinanceiroCartao } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";

const extraSchema = z.object({
  bandeira: z.string().min(1, "Bandeira é obrigatória"),
  ultimos4: z.string().min(1, "Últimos 4 dígitos obrigatórios"),
  titular: z.string().optional().default(""),
  valorLimite: z.coerce.number().min(0),
  valorDisponivel: z.coerce.number().min(0),
  status: z.enum(["DISPONIVEL", "UTILIZADO"]),
});

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CartoesPage() {
  return (
    <SimpleCrudPage<FinanceiroCartao>
      title="Cartões"
      description="Cadastro de cartões disponíveis para pagamentos"
      entityName="Cartão"
      service={financeiroCartaoService as any}
      extraSchema={extraSchema}
      extraDefaultValues={{
        bandeira: "", ultimos4: "", titular: "",
        valorLimite: 0, valorDisponivel: 0, status: "DISPONIVEL",
      }}
      extraColumns={[
        { key: "bandeira" as any, header: "Bandeira" },
        { key: "ultimos4" as any, header: "Últ. 4" },
        { key: "valorDisponivel" as any, header: "Disponível", render: (r: any) => <span className="font-mono">{fmt(r.valorDisponivel)}</span> },
        { key: "status" as any, header: "Status", render: (r: any) => <Badge>{r.status}</Badge> },
      ]}
      getExtraData={(r) => ({
        bandeira: r.bandeira, ultimos4: r.ultimos4, titular: r.titular,
        valorLimite: r.valorLimite, valorDisponivel: r.valorDisponivel, status: r.status,
      })}
      renderExtraFields={({ register, watch, setValue }) => (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Bandeira *</Label>
            <Input {...register("bandeira")} placeholder="Ex: Visa" />
          </div>
          <div className="space-y-1.5">
            <Label>Últimos 4 *</Label>
            <Input {...register("ultimos4")} maxLength={4} />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>Titular</Label>
            <Input {...register("titular")} />
          </div>
          <div className="space-y-1.5">
            <Label>Limite</Label>
            <Input type="number" step="0.01" {...register("valorLimite", { valueAsNumber: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>Disponível</Label>
            <Input type="number" step="0.01" {...register("valorDisponivel", { valueAsNumber: true })} />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>Status</Label>
            <Select value={watch("status")} onValueChange={(v) => setValue("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                <SelectItem value="UTILIZADO">Utilizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    />
  );
}
