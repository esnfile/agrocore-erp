import { useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FinanceiroCentroCusto, FinanceiroTipoLancamento } from "@/lib/mock-data";
import { formatMoeda } from "@/lib/format";
import type { LancamentoFormState } from "./types";

interface Props {
  state: LancamentoFormState;
  update: (patch: Partial<LancamentoFormState>) => void;
  centrosCusto: FinanceiroCentroCusto[];
  tipo: FinanceiroTipoLancamento;
}

export function DetalhesGeral({ state, update, centrosCusto, tipo }: Props) {
  const { valorDetalhe: valor, multa, juros, descontos } = state;

  const totalCalculado = useMemo(
    () => (valor || 0) + (multa || 0) + (juros || 0) - (descontos || 0),
    [valor, multa, juros, descontos],
  );
  const totalGeral = Math.max(0, totalCalculado);
  const negativo = totalCalculado < 0;

  // Espelha totalGeral no state para o modal usar como valorEsperado das Formas
  useEffect(() => {
    if (state.totalGeral !== totalGeral) update({ totalGeral });
  }, [totalGeral, state.totalGeral, update]);

  const mostrarContaContabil = !!tipo.exigePlanoContas && !!tipo.contaContabilNome;
  const centrosAtivos = centrosCusto.filter((c) => c.ativo);

  const numInput = (val: number, onChange: (n: number) => void) => (
    <Input
      type="number"
      step="0.01"
      min="0"
      value={val || ""}
      placeholder="0,00"
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    />
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="space-y-1.5 md:col-span-3">
          <Label>Valor <span className="text-destructive">*</span></Label>
          {numInput(valor, (n) => update({ valorDetalhe: n }))}
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label>Multa</Label>
          {numInput(multa, (n) => update({ multa: n }))}
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label>Juros</Label>
          {numInput(juros, (n) => update({ juros: n }))}
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label>Descontos</Label>
          {numInput(descontos, (n) => update({ descontos: n }))}
        </div>
        <div className="space-y-1.5 md:col-span-3">
          <Label>Total</Label>
          <Input
            type="text"
            readOnly
            disabled
            value={formatMoeda(totalGeral)}
            className="font-semibold"
          />
          {negativo && (
            <p className="text-xs text-destructive">
              Descontos maiores que Valor + Multa + Juros.
            </p>
          )}
        </div>
      </div>

      {mostrarContaContabil && (
        <div className="space-y-1.5">
          <Label
            title="Configurada no cadastro do Tipo de Lançamento"
          >
            Conta Contábil
          </Label>
          <Input
            type="text"
            readOnly
            disabled
            value={`${tipo.contaContabilId ?? ""} - ${tipo.contaContabilNome ?? ""}`}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label>
          Centro de Custo {tipo.exigeCentroCusto && <span className="text-destructive">*</span>}
        </Label>
        <Select value={state.centroCustoId} onValueChange={(v) => update({ centroCustoId: v })}>
          <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
          <SelectContent>
            {centrosAtivos.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhum centro de custo cadastrado</div>
            ) : centrosAtivos.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.descricao}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
