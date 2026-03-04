import { useEffect, useState } from "react";
import { z } from "zod";
import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { grupoProdutoService, secaoProdutoService } from "@/lib/services";
import type { GrupoProduto, SecaoProduto } from "@/lib/mock-data";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Column } from "@/components/DataTable";

const extraSchema = z.object({
  secaoProdutoId: z.string().min(1, "Seção é obrigatória"),
});

export default function GrupoProdutoPage() {
  const { empresaAtual, filialAtual } = useOrganization();
  const selectedEmpresa = empresaAtual?.id ?? null;
  const selectedFilial = filialAtual?.id ?? null;
  const [secoes, setSecoes] = useState<SecaoProduto[]>([]);

  useEffect(() => {
    if (selectedEmpresa && selectedFilial) {
      secaoProdutoService.listar(selectedEmpresa, selectedFilial).then(setSecoes);
    }
  }, [selectedEmpresa, selectedFilial]);

  const extraColumns: Column<GrupoProduto>[] = [
    {
      key: "secaoProdutoId",
      header: "Seção",
      render: (row) => {
        const secao = secoes.find((s) => s.id === row.secaoProdutoId);
        return secao?.descricao ?? "-";
      },
    },
  ];

  return (
    <SimpleCrudPage<GrupoProduto>
      title="Grupo de Produto"
      description="Gerencie os grupos de classificação de produto"
      entityName="Grupo"
      service={grupoProdutoService}
      extraColumns={extraColumns}
      extraSchema={extraSchema}
      extraDefaultValues={{ secaoProdutoId: "" }}
      getExtraData={(row) => ({ secaoProdutoId: row.secaoProdutoId } as any)}
      renderExtraFields={({ errors, setValue, watch }) => {
        const secaoValue = watch("secaoProdutoId");
        return (
          <div className="space-y-1.5">
            <Label>
              Seção <span className="text-destructive">*</span>
            </Label>
            <Select value={secaoValue || ""} onValueChange={(v) => setValue("secaoProdutoId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a seção" />
              </SelectTrigger>
              <SelectContent>
                {secoes.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.descricao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.secaoProdutoId && (
              <p className="text-xs text-destructive">{(errors.secaoProdutoId as any).message}</p>
            )}
          </div>
        );
      }}
    />
  );
}
