import { describe, it, expect, beforeAll } from "vitest";
import { definirSessaoAtual, contratoService, catalogo, avaliarToleranciaContrato, calcularToleranciaKg } from "@/lib/services";
import { instalarProdutosTeste } from "./fixture-produtos";
import { contratos as mockContratos, produtos as mockProdutos } from "@/lib/mock-data";

const ctx = () => { const c = mockContratos[0]; return { grupoId: c.grupoId, empresaId: c.empresaId, filialId: c.filialId }; };

// Casos do adendo — os MESMOS números são verificados contra public.calc_tolerancia no banco.
export const CASOS = [
  { nome: "a) 1.000 SC +2%, 61.000 kg", totalKg: 60000, pesoKg: 61000, tol: 2, fator: 60, status: "DENTRO_TOLERANCIA", excessoKg: 1000, limiteKg: 1200, saldoFinalKg: -1000 },
  { nome: "b1) 500 TON +2%, 510.000 kg", totalKg: 500000, pesoKg: 510000, tol: 2, fator: 1000, status: "DENTRO_TOLERANCIA", excessoKg: 10000, limiteKg: 10000, saldoFinalKg: -10000 },
  { nome: "b2) 500 TON +2%, 520.000 kg", totalKg: 500000, pesoKg: 520000, tol: 2, fator: 1000, status: "EXCEDE", excessoKg: 20000, limiteKg: 10000, saldoFinalKg: -20000 },
  { nome: "c) 10.000 KG +2%, 10.100 kg", totalKg: 10000, pesoKg: 10100, tol: 2, fator: 1, status: "DENTRO_TOLERANCIA", excessoKg: 100, limiteKg: 200, saldoFinalKg: -100 },
];

describe("Modelo de unidades — kg exato, conversão única", () => {
  beforeAll(() => {
    const c = mockContratos[0];
    definirSessaoAtual({ id: "00000000-0000-0000-0000-000000000001", nome: "T", email: "t@t", perfil: "ADMINISTRADOR",
      grupoId: c.grupoId, empresaId: c.empresaId, filialId: c.filialId, empresasPermitidas: [c.empresaId], filiaisPermitidas: [c.filialId] });
  });

  it.each(CASOS)("calc puro: $nome", (k) => {
    const r = calcularToleranciaKg({ totalKg: k.totalKg, entregueKg: 0, pesoKg: k.pesoKg, toleranciaPct: k.tol, fator: k.fator });
    console.info("[JS]", k.nome, JSON.stringify(r));
    expect(r.status).toBe(k.status);
    expect(r.excessoKg).toBe(k.excessoKg);
    expect(r.limiteKg).toBe(k.limiteKg);
    expect(r.saldoFinalKg).toBe(k.saldoFinalKg);
  });

  it("contratos reais: SC 16,67 / TON na borda e acima / mensagens coerentes", async () => {
    const produto = instalarProdutosTeste().soja;
    const un = (c: string) => catalogo.unidadesMedida().find((u) => u.codigo === c)!;
    const mk = (unId: string, qtd: number, tol: number) => contratoService.salvar({ ...mockContratos[0], id: undefined, numeroContrato: undefined,
      produtoId: produto.id, unidadeNegociacaoId: unId, quantidadeTotal: qtd, toleranciaPercentualMais: tol, status: "ATIVO" } as never, ctx());
    const sc = avaliarToleranciaContrato(await mk(produto.unidadeEntradaId!, 1000, 2), 61000, un("KG").id);
    console.info("[a]", sc.mensagem);
    expect(sc.status).toBe("DENTRO_TOLERANCIA");
    expect(sc.excessoBase).toBe(1000); expect(sc.excessoNeg).toBeCloseTo(16.6667, 3); expect(sc.saldoFinalBase).toBe(-1000);
    expect(sc.mensagem).toContain("16,67 SC / 1.000 KG");
    const ton = await mk(un("TON").id, 500, 2);
    expect(ton.quantidadeBaseTotal).toBe(500000);
    const borda = avaliarToleranciaContrato(ton, 510000, un("KG").id);
    const acima = avaliarToleranciaContrato(ton, 520000, un("KG").id);
    console.info("[b]", borda.mensagem, "|", acima.mensagem);
    expect(borda.status).toBe("DENTRO_TOLERANCIA");
    expect(acima.status).toBe("EXCEDE");
    expect(acima.mensagem).toContain("20,000 TON / 20.000 KG");
    expect(acima.mensagem).toContain("limite 10,000 TON / 10.000 KG");
    const kg = avaliarToleranciaContrato(await mk(un("KG").id, 10000, 2), 10100, un("KG").id);
    expect(kg.status).toBe("DENTRO_TOLERANCIA"); expect(kg.mensagem).toContain("100 KG");
    void mockProdutos;
  });
});
