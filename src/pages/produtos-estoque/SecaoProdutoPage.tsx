import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { secaoProdutoService } from "@/lib/services";
import type { SecaoProduto } from "@/lib/mock-data";

export default function SecaoProdutoPage() {
  return (
    <SimpleCrudPage<SecaoProduto>
      title="Seção de Produto"
      description="Gerencie as seções de classificação de produto"
      entityName="Seção"
      service={secaoProdutoService}
    />
  );
}
