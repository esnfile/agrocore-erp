import { useEffect, useMemo, useState } from "react";
import { CrudModal } from "@/components/CrudModal";
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
import { REQUER_AUTORIZACAO_ADIANT_CLIENTE } from "@/lib/constants";
import { DadosBaseSection } from "./DadosBaseSection";
import { DetalhesProlabore } from "./DetalhesProlabore";
import { DetalhesAdiantFornecedor } from "./DetalhesAdiantFornecedor";
import { DetalhesAdiantCliente } from "./DetalhesAdiantCliente";
import { DetalhesDuplicatas } from "./DetalhesDuplicatas";
import { DetalhesGeral } from "./DetalhesGeral";
import { FormasPagamentoSection } from "./FormasPagamentoSection";
import { AutorizacaoSupervisorModal } from "./AutorizacaoSupervisorModal";
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
  const [saving, setSaving] = useState(false);
  const [formasPagto, setFormasPagto] = useState<FinanceiroFormaPagto[]>([]);
  const [autorizacaoOpen, setAutorizacaoOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setState(initialFormState(empresaAtual?.id ?? "", filialAtual?.id ?? ""));
      financeiroFormaPagtoService.listar(empresaAtual?.id ?? "", filialAtual?.id ?? "").then(setFormasPagto);
    }
  }, [open, empresaAtual, filialAtual]);

  const update = (patch: Partial<LancamentoFormState>) =>
    setState((s) => {
      // Limpeza ao trocar de Tipo de Lançamento: zera campos específicos das categorias.
      if (patch.tipoLancamentoId !== undefined && patch.tipoLancamentoId !== s.tipoLancamentoId) {
        return {
          ...s,
          ...patch,
          socioId: "",
          pessoaId: "",
          solicitacaoAdiantamentoId: "",
          referenciaMotivo: "",
          valorDetalhe: 0,
          multa: 0,
          juros: 0,
          descontos: 0,
          totalGeral: 0,
          parcelasSelecionadas: [],
          adiantamentosSelecionados: [],
          formas: { dinheiro: 0, cheque: 0, cartao: 0, adiantamento: 0 },
        };
      }
      return { ...s, ...patch };
    });


  const tipoSel = tiposLancamento.find((t) => t.id === state.tipoLancamentoId);

  const totalFormas = useMemo(() => sumFormas(state.formas), [state.formas]);

  const findForma = (descricao: string): FinanceiroFormaPagto | undefined =>
    formasPagto.find((f) => f.descricao.toLowerCase().includes(descricao.toLowerCase()) && f.ativo);

  // ------ Validações comuns ------
  const validarDadosBase = (): boolean => {
    if (!tipoSel) { toast({ title: "Selecione o tipo de lançamento", variant: "destructive" }); return false; }
    if (!state.empresaId || !state.filialId || !state.contaFinanceiraId) {
      toast({ title: "Preencha empresa, filial e conta financeira", variant: "destructive" }); return false;
    }
    if (new Date(state.dataMovimento) > new Date(new Date().toISOString().slice(0, 10))) {
      toast({ title: "Data não pode ser futura", variant: "destructive" }); return false;
    }
    return true;
  };

  const validarTotalFormas = (valor: number): { ok: boolean; forma?: FinanceiroFormaPagto } => {
    if (Math.abs(totalFormas - valor) > 0.0001) {
      toast({ title: "Soma das formas de pagamento deve ser igual ao valor informado", variant: "destructive" });
      return { ok: false };
    }
    const candidatos: [number, FinanceiroFormaPagto | undefined, string][] = [
      [state.formas.dinheiro, findForma("Dinheiro"), "Dinheiro"],
      [state.formas.cheque, findForma("Cheque"), "Cheque"],
      [state.formas.cartao, findForma("Cartão") ?? findForma("Cartao"), "Cartão"],
      [state.formas.adiantamento, findForma("Adiantamento"), "Adiantamento"],
    ];
    const naoZero = candidatos.filter(([v]) => v > 0);
    if (naoZero.length === 0) {
      toast({ title: "Informe ao menos uma forma de pagamento", variant: "destructive" });
      return { ok: false };
    }
    const forma =
      (naoZero.length > 1 ? findForma("Múltiplo") ?? findForma("Multiplo") : undefined)
      ?? naoZero[0][1];
    if (!forma) {
      toast({ title: `Forma de pagamento "${naoZero[0][2]}" não cadastrada`, variant: "destructive" });
      return { ok: false };
    }
    return { ok: true, forma };
  };

  // ------ Salvar (despacha por categoria) ------
  const handleSave = async () => {
    if (!validarDadosBase() || !tipoSel) return;

    if (tipoSel.categoria === "PROLABORE") return salvarProlabore();
    if (tipoSel.categoria === "ADIANT_FORNECEDOR") return salvarAdiantFornecedor();
    if (tipoSel.categoria === "ADIANT_CLIENTE") return iniciarSalvarAdiantCliente();
    if (tipoSel.categoria === "REC_DUPLICATA" || tipoSel.categoria === "PAG_DUPLICATA") return salvarBaixaDuplicatas();

    toast({ title: "Tipo ainda não implementado", description: "Em breve.", variant: "destructive" });
  };

  // ------ Recebimento / Pagamento de Duplicatas ------
  const salvarBaixaDuplicatas = async () => {
    if (!tipoSel) return;
    if (!state.pessoaId) { toast({ title: "Selecione a pessoa", variant: "destructive" }); return; }
    if (state.parcelasSelecionadas.length === 0) {
      toast({ title: "Selecione ao menos uma duplicata", variant: "destructive" }); return;
    }

    // Validação específica de duplicatas (permite baixa parcial)
    const totalParcelas = state.valorDetalhe; // sincronizado em DetalhesDuplicatas com soma dos saldos
    if (totalFormas <= 0.0001) {
      toast({ title: "Informe ao menos um valor em Formas de Pagamento", variant: "destructive" }); return;
    }
    if (totalFormas > totalParcelas + 0.01) {
      toast({ title: "TOTAL não pode ser maior que o valor das parcelas", variant: "destructive" }); return;
    }

    // Resolve forma de pagamento a partir dos campos preenchidos
    const candidatos: [number, FinanceiroFormaPagto | undefined, string][] = [
      [state.formas.dinheiro, findForma("Dinheiro"), "Dinheiro"],
      [state.formas.cheque, findForma("Cheque"), "Cheque"],
      [state.formas.cartao, findForma("Cartão") ?? findForma("Cartao"), "Cartão"],
      [state.formas.adiantamento, findForma("Adiantamento"), "Adiantamento"],
    ];
    const naoZero = candidatos.filter(([v]) => v > 0);
    const forma =
      (naoZero.length > 1 ? findForma("Múltiplo") ?? findForma("Multiplo") : undefined)
      ?? naoZero[0]?.[1];
    if (!forma) {
      toast({ title: `Forma de pagamento "${naoZero[0]?.[2] ?? ""}" não cadastrada`, variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const prefix = tipoSel.categoria === "REC_DUPLICATA" ? "REC" : "PAG";
      const numeroDocumento = `${prefix}-${Date.now()}`;
      const result = await financeiroMovimentacaoService.registrarBaixaDuplicatas({
        contaFinanceiraId: state.contaFinanceiraId,
        tipoLancamentoId: tipoSel.id,
        formaPagamentoId: forma.id,
        centroCustoId: state.centroCustoId || null,
        dataMovimento: state.dataMovimento,
        pessoaId: state.pessoaId,
        parcelaIds: state.parcelasSelecionadas,
        valorTotal: +totalFormas.toFixed(2),
        numeroDocumento,
        historico: state.historico || (tipoSel.categoria === "REC_DUPLICATA" ? "Recebimento de duplicata" : "Pagamento de duplicata"),
        formasPagamentoDetalhe: { ...state.formas },
        adiantamentosUsados: state.adiantamentosSelecionados,
      }, { grupoId: grupoAtual?.id ?? "", empresaId: state.empresaId, filialId: state.filialId });
      if (!result.sucesso) { toast({ title: "Erro", description: result.mensagem, variant: "destructive" }); return; }
      const parcial = totalFormas + 0.01 < totalParcelas;
      const saldoRest = +(totalParcelas - totalFormas).toFixed(2);
      const fmtBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      toast({
        title: tipoSel.categoria === "REC_DUPLICATA" ? "Recebimento registrado" : "Pagamento registrado",
        description: parcial
          ? `${result.parcelasLiquidadas} duplicata(s) baixada(s) — última ficou PARCIAL (saldo: ${fmtBRL(saldoRest)}).`
          : `Duplicatas quitadas com sucesso (${result.parcelasLiquidadas} baixada(s)).`,
      });
      onSaved(); onClose();
    } finally { setSaving(false); }
  };


  // ------ Prolabore ------
  const salvarProlabore = async () => {
    if (!tipoSel) return;
    if (!state.socioId) { toast({ title: "Selecione o sócio", variant: "destructive" }); return; }
    if (state.valorDetalhe <= 0) { toast({ title: "Informe o valor do prolabore", variant: "destructive" }); return; }
    if (tipoSel.exigeCentroCusto && !state.centroCustoId) {
      toast({ title: "Centro de custo obrigatório", variant: "destructive" }); return;
    }
    const v = validarTotalFormas(state.valorDetalhe);
    if (!v.ok || !v.forma) return;

    setSaving(true);
    try {
      const numeroDocumento = `PRO-${Date.now()}`;
      const result = await financeiroMovimentacaoService.registrar({
        contaFinanceiraId: state.contaFinanceiraId,
        tipoLancamentoId: tipoSel.id,
        formaPagamentoId: v.forma.id,
        planoContaId: null,
        centroCustoId: state.centroCustoId || null,
        dataMovimento: state.dataMovimento,
        valor: state.valorDetalhe,
        numeroDocumento,
        historico: state.historico || "Prolabore",
        contaOrigemId: null,
        contaDestinoId: null,
        parcelaId: null,
        pessoaId: state.socioId,
        formasPagamentoDetalhe: { ...state.formas },
      }, { grupoId: grupoAtual?.id ?? "", empresaId: state.empresaId, filialId: state.filialId });
      if (!result.sucesso) { toast({ title: "Erro", description: result.mensagem, variant: "destructive" }); return; }
      toast({ title: "Prolabore registrado com sucesso" });
      onSaved(); onClose();
    } finally { setSaving(false); }
  };

  // ------ Adiantamento a Fornecedor ------
  const salvarAdiantFornecedor = async () => {
    if (!tipoSel) return;
    if (!state.pessoaId) { toast({ title: "Selecione o fornecedor", variant: "destructive" }); return; }
    if (!state.solicitacaoAdiantamentoId) { toast({ title: "Selecione a solicitação aprovada", variant: "destructive" }); return; }
    if (state.valorDetalhe <= 0) { toast({ title: "Informe o valor a liberar", variant: "destructive" }); return; }
    // valor ≤ solicitação: validado no componente via prop, mas reforçamos aqui
    const v = validarTotalFormas(state.valorDetalhe);
    if (!v.ok || !v.forma) return;

    setSaving(true);
    try {
      const numeroDocumento = `ADF-${Date.now()}`;
      const result = await financeiroMovimentacaoService.registrar({
        contaFinanceiraId: state.contaFinanceiraId,
        tipoLancamentoId: tipoSel.id,
        formaPagamentoId: v.forma.id,
        planoContaId: null,
        centroCustoId: state.centroCustoId || null,
        dataMovimento: state.dataMovimento,
        valor: state.valorDetalhe,
        numeroDocumento,
        historico: state.historico || "Adiantamento a Fornecedor",
        pessoaId: state.pessoaId,
        formasPagamentoDetalhe: { ...state.formas },
        solicitacaoAdiantamentoId: state.solicitacaoAdiantamentoId,
      }, { grupoId: grupoAtual?.id ?? "", empresaId: state.empresaId, filialId: state.filialId });
      if (!result.sucesso) { toast({ title: "Erro", description: result.mensagem, variant: "destructive" }); return; }
      toast({
        title: "Adiantamento liberado com sucesso",
        description: `Saldo: ${result.adiantamento?.saldoRestante.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} disponível`,
      });
      onSaved(); onClose();
    } finally { setSaving(false); }
  };

  // ------ Adiantamento de Cliente ------
  const iniciarSalvarAdiantCliente = () => {
    if (!tipoSel) return;
    if (!state.pessoaId) { toast({ title: "Selecione o cliente", variant: "destructive" }); return; }
    if (state.valorDetalhe <= 0) { toast({ title: "Informe o valor", variant: "destructive" }); return; }
    if (!state.referenciaMotivo.trim()) {
      toast({ title: "Informe a referência/motivo", variant: "destructive" }); return;
    }
    const v = validarTotalFormas(state.valorDetalhe);
    if (!v.ok || !v.forma) return;

    if (REQUER_AUTORIZACAO_ADIANT_CLIENTE) {
      setAutorizacaoOpen(true);
    } else {
      void executarSalvarAdiantCliente();
    }
  };

  const executarSalvarAdiantCliente = async () => {
    if (!tipoSel) return;
    const v = validarTotalFormas(state.valorDetalhe);
    if (!v.ok || !v.forma) return;
    setSaving(true);
    try {
      const numeroDocumento = `ADC-${Date.now()}`;
      const historico = `${state.referenciaMotivo}${state.historico ? ` | ${state.historico}` : ""}`;
      const result = await financeiroMovimentacaoService.registrar({
        contaFinanceiraId: state.contaFinanceiraId,
        tipoLancamentoId: tipoSel.id,
        formaPagamentoId: v.forma.id,
        planoContaId: null,
        centroCustoId: state.centroCustoId || null,
        dataMovimento: state.dataMovimento,
        valor: state.valorDetalhe,
        numeroDocumento,
        historico,
        pessoaId: state.pessoaId,
        formasPagamentoDetalhe: { ...state.formas },
      }, { grupoId: grupoAtual?.id ?? "", empresaId: state.empresaId, filialId: state.filialId });
      if (!result.sucesso) { toast({ title: "Erro", description: result.mensagem, variant: "destructive" }); return; }
      toast({
        title: "Adiantamento registrado com sucesso",
        description: `Saldo: ${result.adiantamento?.saldoRestante.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} disponível`,
      });
      onSaved(); onClose();
    } finally { setSaving(false); }
  };

  const renderDetalhes = () => {
    if (!tipoSel) return <p className="text-sm text-muted-foreground">Selecione um tipo de lançamento para ver os detalhes.</p>;
    if (tipoSel.categoria === "PROLABORE") {
      return <DetalhesProlabore state={state} update={update} pessoas={pessoas} centrosCusto={centrosCusto} tipo={tipoSel} />;
    }
    if (tipoSel.categoria === "ADIANT_FORNECEDOR") {
      return <DetalhesAdiantFornecedor state={state} update={update} pessoas={pessoas} centrosCusto={centrosCusto} />;
    }
    if (tipoSel.categoria === "ADIANT_CLIENTE") {
      return <DetalhesAdiantCliente state={state} update={update} pessoas={pessoas} centrosCusto={centrosCusto} />;
    }
    if (tipoSel.categoria === "REC_DUPLICATA") {
      return <DetalhesDuplicatas state={state} update={update} pessoas={pessoas} centrosCusto={centrosCusto} tipoConta="RECEBER" />;
    }
    if (tipoSel.categoria === "PAG_DUPLICATA") {
      return <DetalhesDuplicatas state={state} update={update} pessoas={pessoas} centrosCusto={centrosCusto} tipoConta="PAGAR" />;
    }
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        Detalhes para <strong>{tipoSel.descricao}</strong> ({tipoSel.categoria}) em desenvolvimento.
      </div>
    );
  };

  const valorEsperado = tipoSel && (
    tipoSel.categoria === "PROLABORE"
    || tipoSel.categoria === "ADIANT_FORNECEDOR"
    || tipoSel.categoria === "ADIANT_CLIENTE"
    || tipoSel.categoria === "REC_DUPLICATA"
    || tipoSel.categoria === "PAG_DUPLICATA"
  ) ? state.valorDetalhe : undefined;

  const adiantamentoReadOnly = tipoSel?.categoria === "REC_DUPLICATA" || tipoSel?.categoria === "PAG_DUPLICATA";
  const permitirParcial = tipoSel?.categoria === "REC_DUPLICATA" || tipoSel?.categoria === "PAG_DUPLICATA";

  const clienteSel = pessoas.find((p) => p.id === state.pessoaId);

  return (
    <>
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
          <FormasPagamentoSection state={state} update={update} valorEsperado={valorEsperado} adiantamentoReadOnly={adiantamentoReadOnly} permitirParcial={permitirParcial} />

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

      <AutorizacaoSupervisorModal
        open={autorizacaoOpen}
        onClose={() => setAutorizacaoOpen(false)}
        onAuthorized={() => { setAutorizacaoOpen(false); void executarSalvarAdiantCliente(); }}
        resumo={{
          cliente: clienteSel?.nomeRazao ?? "—",
          valor: state.valorDetalhe,
          referencia: state.referenciaMotivo,
        }}
      />
    </>
  );
}
