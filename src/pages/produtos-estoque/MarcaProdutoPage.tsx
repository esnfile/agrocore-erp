import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { marcaProdutoService } from "@/lib/services";
import type { MarcaProduto } from "@/lib/mock-data";

export default function MarcaProdutoPage() {
  return (
    <SimpleCrudPage<MarcaProduto>
      title="Marca de Produto"
      description="Gerencie as marcas de produto"
      entityName="Marca de Produto"
      service={marcaProdutoService}
    />
  );
}
