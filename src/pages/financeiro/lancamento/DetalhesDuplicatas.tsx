import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Wallet, CreditCard } from "lucide-react";
import type {
  Pessoa, FinanceiroCentroCusto, FinanceiroParcela, FinanceiroConta,
  TipoBeneficiarioAdiantamento, FinanceiroAdiantamento,
} from "@/lib/mock-data";
import {
  financeiroParcelaService, financeiroAdiantamentoService,
} from "@/lib/services";
import type { LancamentoFormState } from "./types";
import { sumFormas } from "./types";
import { SelecionarAdiantamentoModal } from "./SelecionarAdiantamentoModal";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  state: LancamentoFormState;
  update: (patch: Partial<LancamentoFormState>) => void;
  pessoas: Pessoa[];
  centrosCusto: FinanceiroCentroCusto[];
  tipoConta: "RECEBER" | "PAGAR";
}

export function DetalhesDuplicatas({ state, update, pessoas, centrosCusto, tipoConta }: Props) {
  const isReceber = tipoConta === "RECEBER";
  const relacao = isReceber ? "Cliente" : "Fornecedor";
  const tipoBeneficiario: TipoBeneficiarioAdiantamento = isReceber ? "CLIENTE" : "FORNECEDOR";

  const elegiveis = pessoas.filter((p) => p.relacaoComercial?.includes(relacao));

  const [parcelas, setParcelas] = useState<Array<FinanceiroParcela & { conta?: FinanceiroConta; vencida?: boolean }>>([]);
  const [adiantamentos, setAdiantamentos] = useState<FinanceiroAdiantamento[]>([]);
  const [modalAdiantOpen, setModalAdiantOpen] = useState(false);

  useEffect(() => {
    if (!state.pessoaId) { setParcelas([]); setAdiantamentos([]); return; }
    (async () => {
      const allParcelas = await financeiroParcelaService.listarTodas(state.empresaId, state.filialId);
      const hoje = new Date().toISOString().slice(0, 10);
      const filtradas = allParcelas
        .filter((p) => {
          const c = p.conta;
          return c?.tipo === tipoConta && c.pessoaId === state.pessoaId
            && (p.status === "PENDENTE" || p.status === "PARCIAL" || p.status === "VENCIDA");
        })
        .map((p) => ({ ...p, vencida: p.dataVencimento < hoje && p.status !== "PAGO" }))
        .sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento));
      setParcelas(filtradas);

      const allAdt = await financeiroAdiantamentoService.listarPorPessoa(state.pessoaId);
      setAdiantamentos(allAdt.filter((a) =>
        a.tipoBeneficiario === tipoBeneficiario && a.saldoRestante > 0 && a.status !== "CANCELADO"
      ));
    })();
  }, [state.pessoaId, state.empresaId, state.filialId, tipoConta, tipoBeneficiario]);

  // Limpa seleções e adiantamentos ao trocar pessoa
  useEffect(() => {
    update({ parcelasSelecionadas: [], adiantamentosSelecionados: [], valorDetalhe: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.pessoaId]);

  const totalSelecionado = useMemo(() =>
    parcelas
      .filter((p) => state.parcelasSelecionadas.includes(p.id))
      .reduce((s, p) => s + p.saldoParcela, 0),
    [parcelas, state.parcelasSelecionadas]
  );

  // Sincroniza valorDetalhe com a soma das parcelas selecionadas (apenas referência);
  // a validação real usa totalFormas (permitindo baixa parcial).
  useEffect(() => {
    update({ valorDetalhe: +totalSelecionado.toFixed(2) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSelecionado]);

  const totalFormas = sumFormas(state.formas);
  const dif = +(totalSelecionado - totalFormas).toFixed(2);

  const toggleParcela = (id: string, checked: boolean) => {
    const next = checked
      ? [...state.parcelasSelecionadas, id]
      : state.parcelasSelecionadas.filter((x) => x !== id);
    update({ parcelasSelecionadas: next });
  };

  const saldoAdiantTotal = adiantamentos.reduce((s, a) => s + a.saldoRestante, 0);
  const adiantUsado = state.adiantamentosSelecionados.reduce((s, a) => s + a.valor, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>{relacao} <span className="text-destructive">*</span></Label>
          <Select value={state.pessoaId} onValueChange={(v) => update({ pessoaId: v })}>
            <SelectTrigger><SelectValue placeholder={`Selecione o ${relacao.toLowerCase()}...`} /></SelectTrigger>
            <SelectContent>
              {elegiveis.length === 0
                ? <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhum {relacao.toLowerCase()} cadastrado</div>
                : elegiveis.map((p) => <SelectItem key={p.id} value={p.id}>{p.nomeRazao}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Centro de Custo</Label>
          <Select value={state.centroCustoId} onValueChange={(v) => update({ centroCustoId: v })}>
            <SelectTrigger><SelectValue placeholder="Opcional..." /></SelectTrigger>
            <SelectContent>
              {centrosCusto.filter((c) => c.ativo).map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.descricao}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {state.pessoaId && (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Parcela</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parcelas.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Nenhuma duplicata em aberto para {relacao.toLowerCase()} selecionado.
                </TableCell></TableRow>
              ) : parcelas.map((p) => {
                const checked = state.parcelasSelecionadas.includes(p.id);
                return (
                  <TableRow key={p.id} className={checked ? "bg-primary/5" : ""}>
                    <TableCell><Checkbox checked={checked} onCheckedChange={(c) => toggleParcela(p.id, !!c)} /></TableCell>
                    <TableCell className="font-mono text-xs">{p.conta?.documentoReferencia ?? p.contaId}</TableCell>
                    <TableCell className="text-xs">{p.numeroParcela}/{p.totalParcelas}</TableCell>
                    <TableCell className="text-xs">{new Date(p.dataVencimento).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-right font-mono">{fmt(p.saldoParcela)}</TableCell>
                    <TableCell>
                      {p.vencida
                        ? <Badge variant="outline" className="border-destructive/50 text-destructive">VENCIDA</Badge>
                        : <Badge variant="outline">{p.status}</Badge>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {state.parcelasSelecionadas.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
            <span className="text-sm font-medium">TOTAL SELECIONADO</span>
            <span className="text-lg font-mono font-bold">{fmt(totalSelecionado)}</span>
          </div>
          {totalFormas > 0 && dif > 0.0001 && (
            <div className="text-sm rounded-md px-3 py-2 bg-warning/10 border border-warning/30 text-foreground flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 text-warning shrink-0" />
              <span>
                Baixa <strong>parcial</strong>: pagando <strong>{fmt(totalFormas)}</strong> de {fmt(totalSelecionado)}.
                Saldo restante de <strong>{fmt(dif)}</strong> permanecerá como PARCIAL na última parcela liquidada.
              </span>
            </div>
          )}
        </div>
      )}


      {state.pessoaId && (
        <div className="rounded-md border bg-muted/30 p-3 space-y-2">
          {saldoAdiantTotal > 0 ? (
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-primary shrink-0" />
              <span className="text-foreground">
                {relacao} possui adiantamento disponível:{" "}
                <strong className="text-primary">{fmt(saldoAdiantTotal)}</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4 shrink-0" />
              <span>Sem adiantamento disponível para este {relacao.toLowerCase()}.</span>
            </div>
          )}

          {saldoAdiantTotal > 0 && (
            <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4">
              <span>Selecionado: <span className="font-mono font-medium text-foreground">{fmt(adiantUsado)}</span></span>
              <span>Saldo Restante: <span className="font-mono text-foreground">{fmt(saldoAdiantTotal - adiantUsado)}</span></span>
              <span className="italic">Use o botão <strong>…</strong> ao lado de <strong>Adiantamento</strong> abaixo para selecionar.</span>
            </div>
          )}
        </div>
      )}
