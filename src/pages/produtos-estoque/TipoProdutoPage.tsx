import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { tipoProdutoService } from "@/lib/services";
import type { TipoProduto } from "@/lib/mock-data";

export default function TipoProdutoPage() {
  return (
    <SimpleCrudPage<TipoProduto>
      title="Tipo de Produto"
      description="Gerencie os tipos de produto"
      entityName="Tipo de Produto"
      service={tipoProdutoService}
    />
  );
}
