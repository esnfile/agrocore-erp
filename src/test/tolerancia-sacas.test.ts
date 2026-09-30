import { describe, it, expect, beforeAll } from "vitest";
import { definirSessaoAtual, contratoService, catalogo, avaliarToleranciaContrato, unidadeMedidaService } from "@/lib/services";
import { instalarProdutosTeste } from "./fixture-produtos";
import { contratos as mockContratos } from "@/lib/mock-data";

const ctx = () => { const c = mockContratos[0]; return { grupoId: c.grupoId, empresaId: c.empresaId, filialId: c.filialId }; };

describe("Tolerância em sacas — mesma regra da tela e da finalização", () => {
  beforeAll(() => {
    const c = mockContratos[0];
    definirSessaoAtual({ id: "00000000-0000-0000-0000-000000000001", nome: "T", email: "t@t", perfil: "ADMINISTRADOR",
      grupoId: c.grupoId, empresaId: c.empresaId, filialId: c.filialId, empresasPermitidas: [c.empresaId], filiaisPermitidas: [c.filialId] });
  });

  it("1.000 SC + 2%: 1.100 SC bloqueia, 1.015 SC libera com aviso, 0% bloqueia 1.001 SC", async () => {
    const produto = instalarProdutosTeste().soja;
    expect(produto).toBeTruthy();
    const kg = catalogo.unidadesMedida().find((u) => u.codigo === "KG")!;
    const mk = (tol: number) => contratoService.salvar({ ...mockContratos[0], id: undefined, numeroContrato: undefined, produtoId: produto.id,
      unidadeNegociacaoId: produto.unidadeEntradaId, quantidadeTotal: 1000, quantidadeBaseTotal: 60000, toleranciaPercentualMais: tol, status: "ATIVO" } as never, ctx());
    const c2 = await mk(2);
    const fora = avaliarToleranciaContrato(c2, 1100 * 60, kg.id);
    console.info("[1100]", fora.mensagem);
    expect(fora.status).toBe("EXCEDE");
    expect(fora.limiteNeg).toBe(20); expect(fora.limiteBase).toBe(1200);
    const dentro = avaliarToleranciaContrato(c2, 1015 * 60, kg.id);
    console.info("[1015]", dentro.mensagem);
    expect(dentro.status).toBe("DENTRO_TOLERANCIA");
    expect(dentro.excessoNeg).toBe(15); expect(dentro.excessoBase).toBe(900);
    const c0 = await mk(0);
    const zero = avaliarToleranciaContrato(c0, 1001 * 60, kg.id);
    console.info("[0%]", zero.mensagem);
    expect(zero.status).toBe("EXCEDE");
    void unidadeMedidaService;
  });
});
