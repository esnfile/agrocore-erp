import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Empresa, Filial, FinanceiroContaFinanceira, FinanceiroTipoLancamento } from "@/lib/mock-data";
import type { LancamentoFormState } from "./types";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const todayISO = () => new Date().toISOString().slice(0, 10);

interface Props {
  state: LancamentoFormState;
  update: (patch: Partial<LancamentoFormState>) => void;
  empresas: Empresa[];
  filiais: Filial[];
  contasFinanceiras: FinanceiroContaFinanceira[];
  tiposLancamento: FinanceiroTipoLancamento[];
}

export function DadosBaseSection({ state, update, empresas, filiais, contasFinanceiras, tiposLancamento }: Props) {
  const tiposVisiveis = tiposLancamento.filter((t) => t.ativo && t.apareceNaPesquisa);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Empresa <span className="text-destructive">*</span></Label>
          <Select value={state.empresaId} onValueChange={(v) => update({ empresaId: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {empresas.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Filial <span className="text-destructive">*</span></Label>
          <Select value={state.filialId} onValueChange={(v) => update({ filialId: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {filiais.map((f) => <SelectItem key={f.id} value={f.id}>{f.nomeRazao}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Conta Financeira <span className="text-destructive">*</span></Label>
          <Select value={state.contaFinanceiraId} onValueChange={(v) => update({ contaFinanceiraId: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione a conta..." /></SelectTrigger>
            <SelectContent>
              {contasFinanceiras.filter((c) => c.ativo).map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.descricao} — {fmt(c.saldoAtual)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Tipo de Lançamento <span className="text-destructive">*</span></Label>
          <Select value={state.tipoLancamentoId} onValueChange={(v) => update({ tipoLancamentoId: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione o tipo..." /></SelectTrigger>
            <SelectContent>
              {tiposVisiveis.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.descricao}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Data do Lançamento <span className="text-destructive">*</span></Label>
          <Input
            type="date"
            max={todayISO()}
            value={state.dataMovimento}
            onChange={(e) => update({ dataMovimento: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
