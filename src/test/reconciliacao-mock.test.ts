import { describe, it, expect } from "vitest";
import { calcularSaldoContrato, reconciliarSaldosContratos, romaneiosEntreguesDoContrato, pesoComercialRomaneio } from "@/lib/services";
import { contratos as mockContratos } from "@/lib/mock-data";

describe("Reconciliação dos contratos do protótipo após o modelo de unidades", () => {
  it("saldo = contratado − Σ romaneios em kg exato, sem deriva de arredondamento", () => {
    for (const c of mockContratos.filter((x) => x.deletadoEm === null)) {
      const s = calcularSaldoContrato(c);
      const somaKg = romaneiosEntreguesDoContrato(c.id).reduce((a, r) => a + pesoComercialRomaneio(r), 0);
      console.info(c.numeroContrato, "entregue", s.entregueBase, "kg | saldo", s.saldoBase, "kg |", s.saldoNeg);
      expect(s.saldoBase).toBeCloseTo(s.totalBase - s.entregueBase, 6);
      expect(Math.abs(s.entregueBase - somaKg)).toBeLessThan(1e-6 * Math.max(1, somaKg) + (somaKg === 0 ? 0 : somaKg));
      c.quantidadeEntregue = s.entregueNeg; c.quantidadeSaldo = s.saldoNeg;
    }
    expect(reconciliarSaldosContratos()).toEqual([]);
  });
});
