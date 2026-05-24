import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FinanceiroCentroCusto, FinanceiroContaFinanceira } from "@/lib/mock-data";
import { financeiroTipoContas } from "@/lib/mock-data";
import { formatMoeda } from "@/lib/format";
import type { LancamentoFormState } from "./types";

interface Props {
  state: LancamentoFormState;
  update: (patch: Partial<LancamentoFormState>) => void;
  contasFinanceiras: FinanceiroContaFinanceira[];
  centrosCusto: FinanceiroCentroCusto[];
}

const tipoDescricao = (c: FinanceiroContaFinanceira) =>
  financeiroTipoContas.find((t) => t.id === c.tipoContaId)?.descricao ?? "";

export function DetalhesTransferencia({ state, update, contasFinanceiras, centrosCusto }: Props) {
  const origem = contasFinanceiras.find((c) => c.id === state.contaFinanceiraId);
  const destinosDisponiveis = contasFinanceiras.filter(
    (c) => c.ativo && c.id !== state.contaFinanceiraId,
  );
  const centrosAtivos = centrosCusto.filter((c) => c.ativo);
  const valor = state.valorDetalhe || 0;
  const saldoInsuficiente =
    !!origem && valor > origem.saldoAtual && !origem.permiteSaldoNegativo;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Conta Origem</Label>
        <Input
          type="text"
          readOnly
          disabled
          value={
            origem
              ? `${origem.descricao} — ${tipoDescricao(origem)} — Saldo: ${formatMoeda(origem.saldoAtual)}`
              : ""
          }
          className="font-medium"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="space-y-1.5 md:col-span-7">
          <Label>Conta Destino <span className="text-destructive">*</span></Label>
          <Select
            value={state.contaDestinoId}
            onValueChange={(v) => update({ contaDestinoId: v })}
            disabled={!origem}
          >
            <SelectTrigger>
              <SelectValue placeholder={origem ? "Selecione a conta destino..." : "Selecione a conta origem primeiro"} />
            </SelectTrigger>
            <SelectContent>
              {destinosDisponiveis.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Nenhuma outra conta ativa disponível
                </div>
              ) : (
                destinosDisponiveis.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.descricao} ({tipoDescricao(c)})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 md:col-span-5">
          <Label>Valor <span className="text-destructive">*</span></Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={state.valorDetalhe || ""}
            placeholder="0,00"
            onChange={(e) => update({ valorDetalhe: parseFloat(e.target.value) || 0 })}
          />
          {saldoInsuficiente && (
            <p className="text-xs text-destructive">
              Saldo insuficiente. Será solicitada confirmação ao salvar.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Centro de Custo</Label>
        <Select value={state.centroCustoId} onValueChange={(v) => update({ centroCustoId: v })}>
          <SelectTrigger><SelectValue placeholder="Selecione (opcional)..." /></SelectTrigger>
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
