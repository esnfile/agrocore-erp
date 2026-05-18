import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Pessoa, FinanceiroCentroCusto, FinanceiroTipoLancamento } from "@/lib/mock-data";
import type { LancamentoFormState } from "./types";

interface Props {
  state: LancamentoFormState;
  update: (patch: Partial<LancamentoFormState>) => void;
  pessoas: Pessoa[];
  centrosCusto: FinanceiroCentroCusto[];
  tipo: FinanceiroTipoLancamento;
}

export function DetalhesProlabore({ state, update, pessoas, centrosCusto, tipo }: Props) {
  const socios = pessoas.filter((p) => p.relacaoComercial?.includes("Sócio"));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-1.5">
        <Label>Sócio <span className="text-destructive">*</span></Label>
        <Select value={state.socioId} onValueChange={(v) => update({ socioId: v })}>
          <SelectTrigger><SelectValue placeholder="Selecione o sócio..." /></SelectTrigger>
          <SelectContent>
            {socios.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhuma pessoa marcada como Sócio</div>
            ) : socios.map((p) => <SelectItem key={p.id} value={p.id}>{p.nomeRazao}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Valor <span className="text-destructive">*</span></Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={state.valorDetalhe || ""}
          onChange={(e) => update({ valorDetalhe: parseFloat(e.target.value) || 0 })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>
          Centro de Custo {tipo.exigeCentroCusto && <span className="text-destructive">*</span>}
        </Label>
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
  );
}
