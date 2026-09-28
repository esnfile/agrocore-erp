import { describe, it, expect, beforeAll } from "vitest";
import {
  definirSessaoAtual, contratoService, romaneioService, romaneioPesagemService,
  calcularSaldoContrato, arredondarKg, catalogo,
} from "@/lib/services";
import { mockContratos, mockRomaneios, mockPontosEstoque } from "@/lib/mock-data";

const ctxBase = () => {
  const c = mockContratos[0];
  return { grupoId: c.grupoId, empresaId: c.empresaId, filialId: c.filialId };
};

async function criarContrato1000kg() {
  const base = mockContratos[0];
  const um = catalogo.unidadesMedida().find((u) => u.codigo === "KG")!;
  return contratoService.salvar(
    {
      ...base, id: undefined, numeroContrato: undefined,
      unidadeNegociacaoId: um.id, quantidadeTotal: 1000, quantidadeBaseTotal: 1000,
      toleranciaPercentualMais: 2, status: "ATIVO",
    } as never,
    ctxBase(),
  );
}

async function romaneioVinculado(contratoId: string, liquido: number) {
  const c = mockContratos.find((x) => x.id === contratoId)!;
  const ponto = mockPontosEstoque.find((p) => p.deletadoEm === null && p.empresaId === c.empresaId) ?? mockPontosEstoque[0];
  const r = await romaneioService.salvar(
    {
      produtoId: c.produtoId, contratoId, tipoRomaneio: "ENTRADA", origem: "CONTRATO",
      pontoEstoqueId: ponto.id, status: "AGUARDANDO_PESAGEM",
    } as never,
    ctxBase(),
  );
  await romaneioPesagemService.salvar({ romaneioId: r.id, tipoPesagem: "ENTRADA", peso: 15000 + liquido }, ctxBase());
  await romaneioPesagemService.salvar({ romaneioId: r.id, tipoPesagem: "SAIDA", peso: 15000 }, ctxBase());
  const rom = mockRomaneios.find((x) => x.id === r.id)!;
  rom.contratoId = contratoId;
  rom.pontoEstoqueId = ponto.id;
  return rom;
}

describe("Fase 1 — tolerância e arredondamento", () => {
  beforeAll(() => {
    const c = mockContratos[0];
    definirSessaoAtual({
      id: "00000000-0000-0000-0000-000000000001", nome: "Teste", email: "t@t", perfil: "ADMINISTRADOR",
      grupoId: c.grupoId, empresaId: c.empresaId, filialId: c.filialId,
      empresasPermitidas: [c.empresaId], filiaisPermitidas: [c.filialId],
    });
  });

  it("recusa 1.100 kg num contrato de 1.000 kg com 2% e aceita 1.015 kg", async () => {
    const contrato = await criarContrato1000kg();
    const fora = await romaneioVinculado(contrato.id, 1100);
    const r1 = await romaneioService.finalizar(fora.id);
    expect(r1.sucesso).toBe(false);
    expect(r1.mensagem).toContain("tolerância de 2%");
    console.info("[fora]", r1.mensagem);

    const dentro = await romaneioVinculado(contrato.id, 1015);
    const r2 = await romaneioService.finalizar(dentro.id);
    console.info("[dentro]", r2.mensagem);
    expect(r2.sucesso).toBe(true);
    expect(calcularSaldoContrato(mockContratos.find((c) => c.id === contrato.id)!).saldoBase).toBe(-15);
  }, 30000);

  it("PLSL é gravado em kg inteiro e a conta fecha", async () => {
    expect(arredondarKg(24377.5)).toBe(24378); // half-even: 24377 é ímpar → sobe
    expect(arredondarKg(24376.5)).toBe(24376); // half-even: 24376 é par → mantém
    const contrato = await criarContrato1000kg();
    const rom = await romaneioVinculado(contrato.id, 1000);
    await romaneioService.salvar({ id: rom.id, pesoLiquidoSecoLimpo: 977.5, pesoClassificado: 977.5 }, ctxBase());
    expect(rom.pesoLiquidoSecoLimpo).toBe(978);
    const r = await romaneioService.finalizar(rom.id);
    expect(r.sucesso).toBe(true);
    const s = calcularSaldoContrato(mockContratos.find((c) => c.id === contrato.id)!);
    expect(s.totalBase - s.entregueBase).toBe(s.saldoBase);
    expect(s.entregueBase).toBe(978);
    expect(s.saldoBase).toBe(22);
  }, 30000);
});
