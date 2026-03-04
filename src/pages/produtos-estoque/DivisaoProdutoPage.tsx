import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { divisaoProdutoService } from "@/lib/services";
import type { DivisaoProduto } from "@/lib/mock-data";

export default function DivisaoProdutoPage() {
  return (
    <SimpleCrudPage<DivisaoProduto>
      title="Divisão de Produto"
      description="Gerencie as divisões de produto"
      entityName="Divisão de Produto"
      service={divisaoProdutoService}
    />
  );
}
