import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { FinanceiroFormaPagto, FinanceiroCheque, FinanceiroCartao, TipoBeneficiarioAdiantamento } from "@/lib/mock-data";
import type {
  LancamentoFormState, ComposicaoDinheiroItem, ComposicaoChequeItem, ComposicaoCartaoItem,
  AdiantamentoUso,
} from "./types";
import { sumFormas, sumComposicao } from "./types";
import { ComposicaoDinheiroModal } from "./ComposicaoDinheiroModal";
import { ComposicaoChequeModal } from "./ComposicaoChequeModal";
import { ComposicaoCartaoModal } from "./ComposicaoCartaoModal";
import { SelecionarAdiantamentoModal } from "./SelecionarAdiantamentoModal";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  state: LancamentoFormState;
  update: (patch: Partial<LancamentoFormState>) => void;
  valorEsperado?: number;
  adiantamentoReadOnly?: boolean;
  /** Quando true, soma menor que o esperado é permitida (baixa parcial). */
  permitirParcial?: boolean;
  formasPagto: FinanceiroFormaPagto[];
  cheques: FinanceiroCheque[];
  cartoes: FinanceiroCartao[];
  /** "RECEBIMENTO" para ENTRADA; "PAGAMENTO" para SAIDA. */
  modo: "RECEBIMENTO" | "PAGAMENTO";
  /** Pessoa usada para filtrar adiantamentos. Em Prolabore = sócio; demais = pessoaId. */
  pessoaIdAdiantamento?: string;
}

export function FormasPagamentoSection({
  state, update, valorEsperado, adiantamentoReadOnly, permitirParcial,
  formasPagto, cheques, cartoes, modo, pessoaIdAdiantamento,
}: Props) {
  const [dinheiroOpen, setDinheiroOpen] = useState(false);
  const [chequeOpen, setChequeOpen] = useState(false);
  const [cartaoOpen, setCartaoOpen] = useState(false);
  const [adiantOpen, setAdiantOpen] = useState(false);

  const total = sumFormas(state.formas);
  const dif = valorEsperado !== undefined ? +(total - valorEsperado).toFixed(2) : 0;

  const onConfirmDinheiro = (itens: ComposicaoDinheiroItem[]) => {
    const soma = +sumComposicao(itens).toFixed(2);
    update({ composicaoDinheiro: itens, formas: { ...state.formas, dinheiro: soma } });
  };
  const onConfirmCheque = (itens: ComposicaoChequeItem[]) => {
    const soma = +sumComposicao(itens).toFixed(2);
    update({ composicaoCheque: itens, formas: { ...state.formas, cheque: soma } });
  };
  const onConfirmCartao = (itens: ComposicaoCartaoItem[]) => {
    const soma = +sumComposicao(itens).toFixed(2);
    update({ composicaoCartao: itens, formas: { ...state.formas, cartao: soma } });
  };
  const onConfirmAdiantamento = (sel: AdiantamentoUso[]) => {
    const soma = +sel.reduce((s, a) => s + a.valor, 0).toFixed(2);
    update({ adiantamentosSelecionados: sel, formas: { ...state.formas, adiantamento: soma } });
  };

  // Cartão só pode ser usado em RECEBIMENTO (você não paga despesa com cartão recebido).
  const cartaoDisabled = modo === "PAGAMENTO";
  const cartaoHint = cartaoDisabled
    ? "Cartão é apenas para recebimentos"
    : "Cadastrar cartões recebidos";

  // Adiantamento: bloqueado quando vinculado às duplicatas (gerenciado em DetalhesDuplicatas)
  // ou quando não há pessoa selecionada.
  const adiantDisabled = !!adiantamentoReadOnly || !pessoaIdAdiantamento;
  const adiantHint = adiantamentoReadOnly
    ? "Vinculado às duplicatas (selecione adiantamentos no detalhe acima)"
    : !pessoaIdAdiantamento
      ? "Selecione a pessoa primeiro"
      : modo === "RECEBIMENTO"
        ? "Selecionar adiantamentos do cliente"
        : "Selecionar adiantamentos do fornecedor";
  const tipoBeneficiario: TipoBeneficiarioAdiantamento = modo === "RECEBIMENTO" ? "CLIENTE" : "FORNECEDOR";

  const renderComposField = (
    label: string,
    valor: number,
    qtd: number,
    onOpen: () => void,
    hint: string,
    disabled: boolean = false,
    autoTag: string = "composição",
  ) => {
    const button = (
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={disabled ? undefined : onOpen}
        disabled={disabled}
        aria-label={`Detalhar ${label}`}
        className="shrink-0"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    );
    return (
      <div className="space-y-1.5">
        <Label>
          {label}<span className="ml-1 text-xs text-muted-foreground">({autoTag})</span>
        </Label>
        <div className="flex gap-1">
          <Input
            type="text"
            value={fmt(valor || 0)}
            readOnly
            className="bg-muted cursor-not-allowed font-mono"
          />
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                {/* span wrapper para tooltip funcionar em disabled */}
                <span>{button}</span>
              </TooltipTrigger>
              <TooltipContent>{hint}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {qtd > 0 && (
          <p className="text-xs text-muted-foreground">{qtd} item(ns) detalhado(s)</p>
        )}
      </div>
    );
  };

  const mostrarAviso = valorEsperado !== undefined && dif !== 0 && (permitirParcial ? dif > 0 : true);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {renderComposField(
          "Dinheiro",
          state.formas.dinheiro,
          state.composicaoDinheiro.length,
          () => setDinheiroOpen(true),
          "Detalhar formas (PIX, Espécie, etc.)",
        )}
        {renderComposField(
          "Cheque",
          state.formas.cheque,
          state.composicaoCheque.length,
          () => setChequeOpen(true),
          modo === "PAGAMENTO" ? "Selecionar cheques cadastrados" : "Cadastrar cheques recebidos",
        )}
        {renderComposField(
          "Cartão",
          state.formas.cartao,
          state.composicaoCartao.length,
          () => setCartaoOpen(true),
          cartaoHint,
          cartaoDisabled,
        )}
        {renderComposField(
          "Adiantamento",
          state.formas.adiantamento,
          state.adiantamentosSelecionados.length,
          () => setAdiantOpen(true),
          adiantHint,
          adiantDisabled,
          adiantamentoReadOnly ? "auto" : "composição",
        )}
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
        open={dinheiroOpen}
        onClose={() => setDinheiroOpen(false)}
        onConfirm={onConfirmDinheiro}
        formasPagto={formasPagto}
        valorAtual={state.composicaoDinheiro}
      />
      <ComposicaoChequeModal
        open={chequeOpen}
        onClose={() => setChequeOpen(false)}
        onConfirm={onConfirmCheque}
        modo={modo}
        cheques={cheques}
        valorAtual={state.composicaoCheque}
      />
      <ComposicaoCartaoModal
        open={cartaoOpen}
        onClose={() => setCartaoOpen(false)}
        onConfirm={onConfirmCartao}
        modo={modo}
        cartoes={cartoes}
        valorAtual={state.composicaoCartao}
      />
      {pessoaIdAdiantamento && (
        <SelecionarAdiantamentoModal
          open={adiantOpen}
          onClose={() => setAdiantOpen(false)}
          pessoaId={pessoaIdAdiantamento}
          tipoBeneficiario={tipoBeneficiario}
          selecionadosAtuais={state.adiantamentosSelecionados}
          onConfirm={onConfirmAdiantamento}
        />
      )}
    </div>
  );
}
