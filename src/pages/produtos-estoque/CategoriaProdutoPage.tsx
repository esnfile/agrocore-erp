import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { categoriaProdutoService } from "@/lib/services";
import type { CategoriaProduto } from "@/lib/mock-data";

export default function CategoriaProdutoPage() {
  return (
    <SimpleCrudPage<CategoriaProduto>
      title="Categoria de Produto"
      description="Gerencie as categorias de produto"
      entityName="Categoria de Produto"
      service={categoriaProdutoService}
    />
  );
}
