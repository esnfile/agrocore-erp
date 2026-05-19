import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Pessoa, FinanceiroCentroCusto, AdiantamentoSolicitacao } from "@/lib/mock-data";
import { adiantamentoSolicitacaoService } from "@/lib/services";
import type { LancamentoFormState } from "./types";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  state: LancamentoFormState;
  update: (patch: Partial<LancamentoFormState>) => void;
  pessoas: Pessoa[];
  centrosCusto: FinanceiroCentroCusto[];
}

export function DetalhesAdiantFornecedor({ state, update, pessoas, centrosCusto }: Props) {
  const fornecedores = pessoas.filter((p) => p.relacaoComercial?.includes("Fornecedor"));
  const [solicitacoes, setSolicitacoes] = useState<AdiantamentoSolicitacao[]>([]);

  useEffect(() => {
    if (!state.pessoaId) { setSolicitacoes([]); return; }
    adiantamentoSolicitacaoService.listarAprovadosPorPessoa(state.pessoaId).then(setSolicitacoes);
  }, [state.pessoaId]);

  const solSel = solicitacoes.find((s) => s.id === state.solicitacaoAdiantamentoId);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Fornecedor <span className="text-destructive">*</span></Label>
          <Select
            value={state.pessoaId}
            onValueChange={(v) => update({ pessoaId: v, solicitacaoAdiantamentoId: "", valorDetalhe: 0 })}
          >
            <SelectTrigger><SelectValue placeholder="Selecione o fornecedor..." /></SelectTrigger>
            <SelectContent>
              {fornecedores.length === 0
                ? <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhum fornecedor cadastrado</div>
                : fornecedores.map((p) => <SelectItem key={p.id} value={p.id}>{p.nomeRazao}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Solicitação aprovada <span className="text-destructive">*</span></Label>
          <Select
            value={state.solicitacaoAdiantamentoId}
            onValueChange={(v) => {
              const s = solicitacoes.find((x) => x.id === v);
              update({ solicitacaoAdiantamentoId: v, valorDetalhe: s?.valor ?? 0 });
            }}
            disabled={!state.pessoaId}
          >
            <SelectTrigger>
              <SelectValue placeholder={state.pessoaId ? "Selecione a solicitação..." : "Escolha um fornecedor primeiro"} />
            </SelectTrigger>
            <SelectContent>
              {solicitacoes.length === 0
                ? <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhuma solicitação aprovada para este fornecedor</div>
                : solicitacoes.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {fmt(s.valor)} — {new Date(s.dataSolicitacao).toLocaleDateString("pt-BR")}
                    {s.observacoes ? ` — ${s.observacoes.slice(0, 40)}` : ""}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>
            Valor a liberar <span className="text-destructive">*</span>
            {solSel && (
              <span className="ml-2 text-xs text-muted-foreground">
                (máx. {fmt(solSel.valor)} — parcial permitida)
              </span>
            )}
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={state.valorDetalhe || ""}
            onChange={(e) => update({ valorDetalhe: parseFloat(e.target.value) || 0 })}
            disabled={!state.solicitacaoAdiantamentoId}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Centro de Custo</Label>
          <Select value={state.centroCustoId} onValueChange={(v) => update({ centroCustoId: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {centrosCusto.filter((c) => c.ativo).map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.descricao}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
