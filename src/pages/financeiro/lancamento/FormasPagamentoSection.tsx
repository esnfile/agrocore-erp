import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import type { FinanceiroFormaPagto } from "@/lib/mock-data";
import type { LancamentoFormState, ComposicaoDinheiroItem } from "./types";
import { sumFormas, sumComposicao } from "./types";
import { ComposicaoDinheiroModal } from "./ComposicaoDinheiroModal";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  state: LancamentoFormState;
  update: (patch: Partial<LancamentoFormState>) => void;
  valorEsperado?: number;
  adiantamentoReadOnly?: boolean;
  /** Quando true, soma menor que o esperado é permitida (baixa parcial) — o aviso "menor que" é suprimido aqui pois o componente de detalhes já exibe seu próprio aviso. */
  permitirParcial?: boolean;
  formasPagto: FinanceiroFormaPagto[];
}

export function FormasPagamentoSection({ state, update, valorEsperado, adiantamentoReadOnly, permitirParcial, formasPagto }: Props) {
  const [composicaoOpen, setComposicaoOpen] = useState(false);
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

  const onConfirmComposicao = (itens: ComposicaoDinheiroItem[]) => {
    const soma = +sumComposicao(itens).toFixed(2);
    update({
      composicaoDinheiro: itens,
      formas: { ...state.formas, dinheiro: soma },
    });
  };

  const qtdLinhas = state.composicaoDinheiro.length;

  // Em modo "permitir parcial", só mostramos mensagem quando TOTAL > esperado (erro real de excesso).
  const mostrarAviso = valorEsperado !== undefined && dif !== 0 && (permitirParcial ? dif > 0 : true);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Dinheiro: READ-ONLY + botão de composição */}
        <div className="space-y-1.5">
          <Label>
            Dinheiro
            <span className="ml-1 text-xs text-muted-foreground">(composição)</span>
          </Label>
          <div className="flex gap-1">
            <Input
              type="text"
              value={fmt(state.formas.dinheiro || 0)}
              readOnly
              className="bg-muted cursor-not-allowed font-mono"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setComposicaoOpen(true)}
              aria-label="Detalhar composição de Dinheiro"
              title={qtdLinhas > 0 ? `${qtdLinhas} forma(s) detalhada(s)` : "Detalhar formas (PIX, Espécie, etc.)"}
              className="shrink-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          {qtdLinhas > 0 && (
            <p className="text-xs text-muted-foreground">{qtdLinhas} forma(s) detalhada(s)</p>
          )}
        </div>
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

      <ComposicaoDinheiroModal
        open={composicaoOpen}
        onClose={() => setComposicaoOpen(false)}
        onConfirm={onConfirmComposicao}
        formasPagto={formasPagto}
        valorAtual={state.composicaoDinheiro}
      />
    </div>
  );
}
