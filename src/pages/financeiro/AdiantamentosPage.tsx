import { useState, useEffect, useCallback } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { financeiroAdiantamentoService, pessoaService } from "@/lib/services";
import type { FinanceiroAdiantamento, Pessoa } from "@/lib/mock-data";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const statusColors: Record<string, string> = {
  ABERTO: "bg-warning/20 text-warning border-warning/30",
  PARCIAL: "bg-blue-100 text-blue-700 border-blue-300",
  LIQUIDADO: "bg-success/20 text-success border-success/30",
  CANCELADO: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function AdiantamentosPage() {
  const { empresaAtual, filialAtual } = useOrganization();
  const empresaId = empresaAtual?.id ?? "";
  const filialId = filialAtual?.id ?? "";
  const [data, setData] = useState<FinanceiroAdiantamento[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    const [a, p] = await Promise.all([
      financeiroAdiantamentoService.listar(empresaId, filialId),
      pessoaService.listar(empresaId, filialId),
    ]);
    setData(a);
    setPessoas(p);
    setLoading(false);
  }, [empresaId, filialId]);

  useEffect(() => { carregar(); }, [carregar]);

  const getNome = (id: string) => pessoas.find((p) => p.id === id)?.nomeRazao ?? "—";

  return (
    <div>
      <PageHeader title="Adiantamentos" description="Adiantamentos de produtores/fornecedores (gerados automaticamente via movimentação)" />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pessoa</TableHead>
              <TableHead className="w-28">Data</TableHead>
              <TableHead className="w-36 text-right">Valor</TableHead>
              <TableHead className="w-36 text-right">Utilizado</TableHead>
              <TableHead className="w-36 text-right">Restante</TableHead>
              <TableHead className="w-28">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum adiantamento registrado</TableCell></TableRow>
            ) : data.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{getNome(a.pessoaId)}</TableCell>
                <TableCell>{new Date(a.dataAdiantamento).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="text-right font-mono">{fmt(a.valorAdiantamento)}</TableCell>
                <TableCell className="text-right font-mono">{fmt(a.saldoUtilizado)}</TableCell>
                <TableCell className="text-right font-mono">{fmt(a.saldoRestante)}</TableCell>
                <TableCell><Badge variant="outline" className={statusColors[a.status]}>{a.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}