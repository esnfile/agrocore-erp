import { useEffect, useMemo, useState } from "react";
import { CrudModal } from "@/components/CrudModal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  financeiroMovimentacaoService, financeiroFormaPagtoService,
} from "@/lib/services";
import type {
  Pessoa, FinanceiroContaFinanceira, FinanceiroTipoLancamento,
  FinanceiroCentroCusto, FinanceiroFormaPagto,
} from "@/lib/mock-data";
import { DadosBaseSection } from "./DadosBaseSection";
import { DetalhesProlabore } from "./DetalhesProlabore";
import { FormasPagamentoSection } from "./FormasPagamentoSection";
import { initialFormState, sumFormas, type LancamentoFormState } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  tiposLancamento: FinanceiroTipoLancamento[];
  contasFinanceiras: FinanceiroContaFinanceira[];
  pessoas: Pessoa[];
  centrosCusto: FinanceiroCentroCusto[];
}

export function LancamentoCaixaModal({
  open, onClose, onSaved,
  tiposLancamento, contasFinanceiras, pessoas, centrosCusto,
}: Props) {
  const { grupoAtual, empresaAtual, filialAtual, empresas, filiais } = useOrganization();
  const { toast } = useToast();

  const [state, setState] = useState<LancamentoFormState>(() =>
    initialFormState(empresaAtual?.id ?? "", filialAtual?.id ?? "")
  );
  const [accordionValue, setAccordionValue] = useState<string[]>(["dados"]);
  const [saving, setSaving] = useState(false);
  const [formasPagto, setFormasPagto] = useState<FinanceiroFormaPagto[]>([]);

  useEffect(() => {
    if (open) {
      setState(initialFormState(empresaAtual?.id ?? "", filialAtual?.id ?? ""));
      setAccordionValue(["dados"]);
      financeiroFormaPagtoService.listar(empresaAtual?.id ?? "", filialAtual?.id ?? "").then(setFormasPagto);
    }
  }, [open, empresaAtual, filialAtual]);

  const update = (patch: Partial<LancamentoFormState>) => setState((s) => ({ ...s, ...patch }));

  const tipoSel = tiposLancamento.find((t) => t.id === state.tipoLancamentoId);

  // Auto-open detalhes ao selecionar tipo
  useEffect(() => {
    if (tipoSel && !accordionValue.includes("detalhes")) {
      setAccordionValue((v) => [...v, "detalhes"]);
    }
  }, [tipoSel?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalFormas = useMemo(() => sumFormas(state.formas), [state.formas]);

  const findForma = (descricao: string): FinanceiroFormaPagto | undefined =>
    formasPagto.find((f) => f.descricao.toLowerCase().includes(descricao.toLowerCase()) && f.ativo);

  const handleSave = async () => {
    if (!tipoSel) { toast({ title: "Selecione o tipo de lançamento", variant: "destructive" }); return; }
    if (!state.empresaId || !state.filialId || !state.contaFinanceiraId) {
      toast({ title: "Preencha empresa, filial e conta financeira", variant: "destructive" }); return;
    }
    if (new Date(state.dataMovimento) > new Date(new Date().toISOString().slice(0, 10))) {
      toast({ title: "Data não pode ser futura", variant: "destructive" }); return;
    }

    if (tipoSel.categoria === "PROLABORE") {
      if (!state.socioId) { toast({ title: "Selecione o sócio", variant: "destructive" }); return; }
      if (state.valorDetalhe <= 0) { toast({ title: "Informe o valor do prolabore", variant: "destructive" }); return; }
      if (tipoSel.exigeCentroCusto && !state.centroCustoId) {
        toast({ title: "Centro de custo obrigatório", variant: "destructive" }); return;
      }
      if (Math.abs(totalFormas - state.valorDetalhe) > 0.0001) {
        toast({ title: "Soma das formas de pagamento deve ser igual ao valor do prolabore", variant: "destructive" }); return;
      }

      setSaving(true);
      try {
        const numeroDocumento = `PRO-${Date.now()}`;
        const mapping: [number, FinanceiroFormaPagto | undefined, string][] = [
          [state.formas.dinheiro, findForma("Dinheiro"), "Dinheiro"],
          [state.formas.cheque, findForma("Cheque"), "Cheque"],
          [state.formas.cartao, findForma("Cartão") ?? findForma("Cartao"), "Cartão"],
          [state.formas.adiantamento, findForma("Adiantamento"), "Adiantamento"],
        ];

        for (const [valor, forma, label] of mapping) {
          if (valor <= 0) continue;
          if (!forma) {
            toast({ title: `Forma de pagamento "${label}" não cadastrada`, variant: "destructive" });
            setSaving(false); return;
          }
          const result = await financeiroMovimentacaoService.registrar({
            contaFinanceiraId: state.contaFinanceiraId,
            tipoLancamentoId: tipoSel.id,
            formaPagamentoId: forma.id,
            planoContaId: null,
            centroCustoId: state.centroCustoId || null,
            dataMovimento: state.dataMovimento,
            valor,
            numeroDocumento,
            historico: state.historico || `Prolabore - ${label}`,
            contaOrigemId: null,
            contaDestinoId: null,
            parcelaId: null,
            pessoaId: state.socioId,
          }, { grupoId: grupoAtual?.id ?? "", empresaId: state.empresaId, filialId: state.filialId });
          if (!result.sucesso) {
            toast({ title: "Erro", description: result.mensagem, variant: "destructive" });
            setSaving(false); return;
          }
        }
        toast({ title: "Prolabore lançado com sucesso" });
        onSaved();
        onClose();
      } finally { setSaving(false); }
      return;
    }

    toast({ title: "Tipo ainda não implementado", description: "Em breve.", variant: "destructive" });
  };

  const renderDetalhes = () => {
    if (!tipoSel) return <p className="text-sm text-muted-foreground">Selecione um tipo de lançamento para ver os detalhes.</p>;
    if (tipoSel.categoria === "PROLABORE") {
      return <DetalhesProlabore state={state} update={update} pessoas={pessoas} centrosCusto={centrosCusto} tipo={tipoSel} />;
    }
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        Detalhes para <strong>{tipoSel.descricao}</strong> ({tipoSel.categoria}) em desenvolvimento. Por enquanto, apenas o tipo <strong>PROLABORE</strong> está disponível.
      </div>
    );
  };

  const valorEsperado = tipoSel?.categoria === "PROLABORE" ? state.valorDetalhe : undefined;

  return (
    <CrudModal open={open} onClose={onClose} title="Novo Lançamento de Caixa" saving={saving} onSave={handleSave} maxWidth="sm:max-w-5xl">
      <div className="space-y-5">
        <DadosBaseSection
          state={state}
          update={update}
          empresas={empresas}
          filiais={filiais}
          contasFinanceiras={contasFinanceiras}
          tiposLancamento={tiposLancamento}
        />

        <div className="border-t" />
        {renderDetalhes()}

        <div className="border-t" />
        <FormasPagamentoSection state={state} update={update} valorEsperado={valorEsperado} />

        <div className="border-t" />
        <div className="space-y-1.5">
          <Label>Histórico</Label>
          <Textarea
            rows={3}
            maxLength={500}
            value={state.historico}
            onChange={(e) => update({ historico: e.target.value })}
          />
          <p className="text-xs text-muted-foreground text-right">{state.historico.length}/500</p>
        </div>
      </div>
    </CrudModal>
  );
}
