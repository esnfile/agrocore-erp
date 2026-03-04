import { useEffect, useState } from "react";
import { z } from "zod";
import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { subgrupoProdutoService, grupoProdutoService } from "@/lib/services";
import type { SubgrupoProduto, GrupoProduto } from "@/lib/mock-data";
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
  grupoProdutoId: z.string().min(1, "Grupo é obrigatório"),
});

export default function SubgrupoProdutoPage() {
  const { empresaAtual, filialAtual } = useOrganization();
  const selectedEmpresa = empresaAtual?.id ?? null;
  const selectedFilial = filialAtual?.id ?? null;
  const [grupos, setGrupos] = useState<GrupoProduto[]>([]);

  useEffect(() => {
    if (selectedEmpresa && selectedFilial) {
      grupoProdutoService.listar(selectedEmpresa, selectedFilial).then(setGrupos);
    }
  }, [selectedEmpresa, selectedFilial]);

  const extraColumns: Column<SubgrupoProduto>[] = [
    {
      key: "grupoProdutoId",
      header: "Grupo",
      render: (row) => {
        const grupo = grupos.find((g) => g.id === row.grupoProdutoId);
        return grupo?.descricao ?? "-";
      },
    },
  ];

  return (
    <SimpleCrudPage<SubgrupoProduto>
      title="Subgrupo de Produto"
      description="Gerencie os subgrupos de classificação de produto"
      entityName="Subgrupo"
      service={subgrupoProdutoService}
      extraColumns={extraColumns}
      extraSchema={extraSchema}
      extraDefaultValues={{ grupoProdutoId: "" }}
      getExtraData={(row) => ({ grupoProdutoId: row.grupoProdutoId } as any)}
      renderExtraFields={({ errors, setValue, watch }) => {
        const grupoValue = watch("grupoProdutoId");
        return (
          <div className="space-y-1.5">
            <Label>
              Grupo <span className="text-destructive">*</span>
            </Label>
            <Select value={grupoValue || ""} onValueChange={(v) => setValue("grupoProdutoId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o grupo" />
              </SelectTrigger>
              <SelectContent>
                {grupos.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.descricao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.grupoProdutoId && (
              <p className="text-xs text-destructive">{(errors.grupoProdutoId as any).message}</p>
            )}
          </div>
        );
      }}
    />
  );
}
