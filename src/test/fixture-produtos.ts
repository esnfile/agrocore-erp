// Fixture de produtos para testes (o catálogo real vem do banco).
// Fatores SEMPRE contra a base, como em produto_unidades.
import { produtos as mockProdutos, unidadesMedida as mockUnidades, type Produto, type UnidadeMedida } from "@/lib/mock-data";

const un = (codigo: string, tipo: UnidadeMedida["tipo"]): UnidadeMedida => {
  let u = mockUnidades.find((x) => x.codigo === codigo && x.deletadoEm === null);
  if (!u) {
    u = { id: `um-${codigo}`, grupoId: "g1", empresaId: null, filialId: null, codigo, descricao: codigo, tipo, ativo: true,
      criadoEm: "", criadoPor: "", atualizadoEm: "", atualizadoPor: "", deletadoEm: null, deletadoPor: null };
    mockUnidades.push(u);
  }
  return u;
};

const base = { grupoId: "g1", empresaId: "", filialId: null, tipoProdutoId: "", codigoBarras: "", aplicacao: "", tipoBaixaEstoque: "INDIVIDUAL" as const,
  categoriaId: null, marcaProdutoId: null, precoReferencia: null, ativo: true,
  criadoEm: "", criadoPor: "", atualizadoEm: "", atualizadoPor: "", deletadoEm: null, deletadoPor: null };

export function instalarProdutosTeste() {
  const KG = un("KG", "PESO"), SC = un("SC", "PESO"), TON = un("TON", "PESO"), LT = un("LT", "VOLUME"), TB = un("TB", "VOLUME");
  const soja: Produto = { ...base, id: "p-soja", descricao: "Soja", ehGrao: true, tipoUnidade: "PESO", unidadeEntradaId: KG.id, unidadeSaidaId: SC.id,
    unidades: [{ unidadeId: SC.id, codigo: "SC", fator: 60 }, { unidadeId: TON.id, codigo: "TON", fator: 1000 }] };
  const defensivo: Produto = { ...base, id: "p-glif", descricao: "Glifosato", ehGrao: false, tipoUnidade: "VOLUME", unidadeEntradaId: TB.id, unidadeSaidaId: LT.id,
    unidades: [{ unidadeId: TB.id, codigo: "TB", fator: 200 }] };
  mockProdutos.splice(0, mockProdutos.length, soja, defensivo);
  // soja.unidadeEntradaId = SC para os testes de contrato em sacas
  soja.unidadeEntradaId = SC.id;
  return { soja, defensivo, KG, SC, TON, LT, TB };
}
