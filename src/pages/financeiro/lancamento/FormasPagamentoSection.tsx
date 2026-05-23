import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { LancamentoFormState } from "./types";
import { sumFormas } from "./types";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  state: LancamentoFormState;
  update: (patch: Partial<LancamentoFormState>) => void;
  valorEsperado?: number;
  adiantamentoReadOnly?: boolean;
  /** Quando true, soma menor que o esperado é permitida (baixa parcial) — o aviso "menor que" é suprimido aqui pois o componente de detalhes já exibe seu próprio aviso. */
  permitirParcial?: boolean;
}

export function FormasPagamentoSection({ state, update, valorEsperado, adiantamentoReadOnly, permitirParcial }: Props) {
  const total = sumFormas(state.formas);
  const dif = valorEsperado !== undefined ? +(total - valorEsperado).toFixed(2) : 0;
  const setF = (k: keyof LancamentoFormState["formas"]) => (e: React.ChangeEvent<HTMLInputElement>) =>
    update({ formas: { ...state.formas, [k]: parseFloat(e.target.value) || 0 } });

  const field = (label: string, k: keyof LancamentoFormState["formas"], readOnly = false) => (
    <div className="space-y-1.5">
      <Label>{label}{readOnly && <span className="ml-1 text-xs text-muted-foreground">(auto)</span>}</Label>
      <Input
        type="number" step="0.01" min="0"
        value={state.formas[k] || ""}
        onChange={readOnly ? undefined : setF(k)}
        readOnly={readOnly}
        className={readOnly ? "bg-muted cursor-not-allowed" : ""}
      />
    </div>
  );

  // Em modo "permitir parcial", só mostramos mensagem quando TOTAL > esperado (erro real de excesso).
  const mostrarAviso = valorEsperado !== undefined && dif !== 0 && (permitirParcial ? dif > 0 : true);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {field("Dinheiro", "dinheiro")}
        {field("Cheque", "cheque")}
        {field("Cartão", "cartao")}
        {field("Adiantamento", "adiantamento", adiantamentoReadOnly)}
      </div>
      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-sm font-medium">TOTAL</span>
        <span className="text-lg font-mono font-bold">{fmt(total)}</span>
      </div>
      {mostrarAviso && (
        <div className={`text-sm rounded-md px-3 py-2 ${dif > 0 ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning-foreground"}`}>
          {dif > 0
            ? `Soma das formas (${fmt(total)}) é maior que o valor informado (${fmt(valorEsperado)}). Diferença: ${fmt(dif)}`
            : `Soma das formas (${fmt(total)}) é menor que o valor informado (${fmt(valorEsperado)}). Diferença: ${fmt(Math.abs(dif))}`}
        </div>
      )}
    </div>
  );
}
