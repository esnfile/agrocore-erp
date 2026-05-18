import { useState, useEffect, useCallback } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import {
  financeiroMovimentacaoService, financeiroTipoLancamentoService,
  financeiroContaFinanceiraService, financeiroCentroCustoService,
  pessoaService,
} from "@/lib/services";
import type {
  FinanceiroMovimentacao, FinanceiroTipoLancamento, FinanceiroContaFinanceira,
  FinanceiroCentroCusto, Pessoa,
} from "@/lib/mock-data";
import { LancamentoCaixaModal } from "./lancamento/LancamentoCaixaModal";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function MovimentacoesPage() {
  const { empresaAtual, filialAtual } = useOrganization();
  const empresaId = empresaAtual?.id ?? "";
  const filialId = filialAtual?.id ?? "";

  const [movimentacoes, setMovimentacoes] = useState<FinanceiroMovimentacao[]>([]);
  const [tiposLancamento, setTiposLancamento] = useState<FinanceiroTipoLancamento[]>([]);
  const [contasFinanceiras, setContasFinanceiras] = useState<FinanceiroContaFinanceira[]>([]);
  const [centrosCusto, setCentrosCusto] = useState<FinanceiroCentroCusto[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    const [m, tl, cf, cc, pess] = await Promise.all([
      financeiroMovimentacaoService.listar(empresaId, filialId),
      financeiroTipoLancamentoService.listar(empresaId, filialId),
      financeiroContaFinanceiraService.listar(empresaId, filialId),
      financeiroCentroCustoService.listar(empresaId, filialId),
      pessoaService.listar(empresaId, filialId),
    ]);
    setMovimentacoes(m); setTiposLancamento(tl); setContasFinanceiras(cf);
    setCentrosCusto(cc); setPessoas(pess);
    setLoading(false);
  }, [empresaId, filialId]);

  useEffect(() => { carregar(); }, [carregar]);

  const getContaFinNome = (id: string) => contasFinanceiras.find((c) => c.id === id)?.descricao ?? "—";
  const getTipoLancNome = (id: string) => tiposLancamento.find((t) => t.id === id)?.descricao ?? "—";

  const movColors: Record<string, string> = {
    ENTRADA: "border-success/50 text-success",
    SAIDA: "border-destructive/50 text-destructive",
    TRANSFERENCIA: "border-blue-400 text-blue-600",
  };

  return (
    <div>
      <PageHeader title="Caixa e Bancos" description="Movimentações financeiras — recebimentos, pagamentos e transferências" />
      <div className="flex justify-end mb-4">
        <Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4 mr-1" />Novo Lançamento</Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Data</TableHead>
              <TableHead>Tipo Lançamento</TableHead>
              <TableHead>Conta Financeira</TableHead>
              <TableHead>Movimento</TableHead>
              <TableHead className="text-right w-36">Valor</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Histórico</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : movimentacoes.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma movimentação</TableCell></TableRow>
            ) : movimentacoes.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{new Date(m.dataMovimento).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>{getTipoLancNome(m.tipoLancamentoId)}</TableCell>
                <TableCell>{getContaFinNome(m.contaFinanceiraId)}</TableCell>
                <TableCell><Badge variant="outline" className={movColors[m.tipoMovimento]}>{m.tipoMovimento}</Badge></TableCell>
                <TableCell className="text-right font-mono">{fmt(m.valor)}</TableCell>
                <TableCell>{m.numeroDocumento || "—"}</TableCell>
                <TableCell className="text-muted-foreground truncate max-w-[200px]">{m.historico || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <LancamentoCaixaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={carregar}
        tiposLancamento={tiposLancamento}
        contasFinanceiras={contasFinanceiras}
        pessoas={pessoas}
        centrosCusto={centrosCusto}
      />
    </div>
  );
}
