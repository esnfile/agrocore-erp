import { describe, it, expect } from "vitest";
import { fatorBasePorUnidade, unidadeMedidaService } from "@/lib/services";
import { instalarProdutosTeste } from "./fixture-produtos";

describe("Fonte única de conversão (produto_unidades, sempre via base)", () => {
  it("editar o fator da SC muda a conversão; TON não é contaminada", () => {
    const { soja, SC, TON } = instalarProdutosTeste();
    expect(unidadeMedidaService.converterQuantidade(1000, SC.id, TON.id, soja.id)).toBe(60);
    soja.unidades.find((u) => u.codigo === "SC")!.fator = 61; // simula edição em "Qtd. Emb."
    expect(fatorBasePorUnidade(SC.id, soja)).toBe(61);
    expect(fatorBasePorUnidade(TON.id, soja)).toBe(1000);
    expect(unidadeMedidaService.converterQuantidade(1000, SC.id, TON.id, soja.id)).toBe(61);
  });
  it("defensivo: Tambor 200 LT → Litro via base", () => {
    const { defensivo, TB, LT } = instalarProdutosTeste();
    expect(unidadeMedidaService.converterQuantidade(3, TB.id, LT.id, defensivo.id)).toBe(600);
    expect(unidadeMedidaService.converterQuantidade(500, LT.id, TB.id, defensivo.id)).toBe(2.5);
  });
  it("unidade de outro tipo é recusada", () => {
    const { soja, defensivo, LT, KG } = instalarProdutosTeste();
    expect(() => fatorBasePorUnidade(LT.id, soja)).toThrow(/tipos diferentes/);
    expect(() => fatorBasePorUnidade(KG.id, defensivo)).toThrow(/tipos diferentes/);
  });
});
