import { useCallback, useEffect, useState } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { PageHeader } from "@/components/PageHeader";
import { CrudModal } from "@/components/CrudModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Check, X, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adiantamentoSolicitacaoService, pessoaService } from "@/lib/services";
import type { AdiantamentoSolicitacao, Pessoa, StatusSolicitacaoAdiantamento } from "@/lib/mock-data";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const statusColors: Record<StatusSolicitacaoAdiantamento, string> = {
  SOLICITADO: "bg-warning/20 text-warning border-warning/30",
  APROVADO: "bg-blue-100 text-blue-700 border-blue-300",
  LIBERADO: "bg-success/20 text-success border-success/30",
  REJEITADO: "bg-destructive/20 text-destructive border-destructive/30",
  CANCELADO: "bg-muted text-muted-foreground border-muted-foreground/30",
};

export default function SolicitacoesAdiantamentoPage() {
  const { grupoAtual, empresaAtual, filialAtual } = useOrganization();
  const { toast } = useToast();
  const empresaId = empresaAtual?.id ?? "";
  const filialId = filialAtual?.id ?? "";

  const [data, setData] = useState<AdiantamentoSolicitacao[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroPessoa, setFiltroPessoa] = useState<string>("TODOS");

  const [novo, setNovo] = useState({ pessoaId: "", valor: 0, observacoes: "" });
  const [saving, setSaving] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    const [s, p] = await Promise.all([
      adiantamentoSolicitacaoService.listar(empresaId, filialId),
      pessoaService.listar(empresaId, filialId),
    ]);
    setData(s); setPessoas(p);
    setLoading(false);
  }, [empresaId, filialId]);

  useEffect(() => { carregar(); }, [carregar]);

  const fornecedores = pessoas.filter((p) => p.relacaoComercial?.includes("Fornecedor"));
  const getNome = (id: string) => pessoas.find((p) => p.id === id)?.nomeRazao ?? "—";

  const filtrado = data.filter((s) =>
    (filtroStatus === "TODOS" || s.status === filtroStatus)
    && (filtroPessoa === "TODOS" || s.pessoaId === filtroPessoa)
  );

  const abrirNovo = () => { setNovo({ pessoaId: "", valor: 0, observacoes: "" }); setModalOpen(true); };

  const salvarNovo = async () => {
    setSaving(true);
    const r = await adiantamentoSolicitacaoService.criar(novo, {
      grupoId: grupoAtual?.id ?? "", empresaId, filialId, usuarioId: "u1",
    });
    setSaving(false);
    if (!r.sucesso) { toast({ title: "Erro", description: r.mensagem, variant: "destructive" }); return; }
    toast({ title: "Solicitação criada" });
    setModalOpen(false); carregar();
  };

  const acao = async (id: string, fn: () => Promise<{ sucesso: boolean; mensagem: string }>, ok: string) => {
    const r = await fn();
    if (!r.sucesso) toast({ title: "Erro", description: r.mensagem, variant: "destructive" });
    else { toast({ title: ok }); carregar(); }
  };

  return (
    <div>
      <PageHeader title="Solicitações de Adiantamento" description="Solicitações de adiantamento a fornecedores (fluxo: SOLICITADO → APROVADO → LIBERADO no Caixa)" />

      <div className="flex flex-wrap gap-3 items-end justify-between mb-4">
        <div className="flex gap-3">
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="SOLICITADO">Solicitado</SelectItem>
                <SelectItem value="APROVADO">Aprovado</SelectItem>
                <SelectItem value="LIBERADO">Liberado</SelectItem>
                <SelectItem value="REJEITADO">Rejeitado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Fornecedor</Label>
            <Select value={filtroPessoa} onValueChange={setFiltroPessoa}>
              <SelectTrigger className="w-60"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                {fornecedores.map((p) => <SelectItem key={p.id} value={p.id}>{p.nomeRazao}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={abrirNovo}><Plus className="h-4 w-4 mr-1" />Nova Solicitação</Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fornecedor</TableHead>
              <TableHead className="text-right w-36">Valor</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-32">Solicitação</TableHead>
              <TableHead className="w-32">Aprovação</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="w-56 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : filtrado.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma solicitação</TableCell></TableRow>
            ) : filtrado.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{getNome(s.pessoaId)}</TableCell>
                <TableCell className="text-right font-mono">{fmt(s.valor)}</TableCell>
                <TableCell><Badge variant="outline" className={statusColors[s.status]}>{s.status}</Badge></TableCell>
                <TableCell>{new Date(s.dataSolicitacao).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>{s.dataAprovacao ? new Date(s.dataAprovacao).toLocaleDateString("pt-BR") : "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-md truncate">{s.observacoes || "—"}</TableCell>
                <TableCell className="text-right">
                  {s.status === "SOLICITADO" && (
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="outline" className="h-7 text-success border-success/40 hover:bg-success/10"
                        onClick={() => acao(s.id, () => adiantamentoSolicitacaoService.aprovar(s.id), "Solicitação aprovada")}>
                        <Check className="h-3 w-3 mr-1" />Aprovar
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-destructive border-destructive/40 hover:bg-destructive/10"
                        onClick={() => acao(s.id, () => adiantamentoSolicitacaoService.rejeitar(s.id), "Solicitação rejeitada")}>
                        <X className="h-3 w-3 mr-1" />Rejeitar
                      </Button>
                    </div>
                  )}
                  {s.status === "APROVADO" && (
                    <div className="flex gap-1 justify-end items-center">
                      <span className="text-xs text-muted-foreground mr-1">Aguardando liberação no caixa</span>
                      <Button size="sm" variant="outline" className="h-7"
                        onClick={() => acao(s.id, () => adiantamentoSolicitacaoService.cancelar(s.id), "Solicitação cancelada")}>
                        <Ban className="h-3 w-3 mr-1" />Cancelar
                      </Button>
                    </div>
                  )}
                  {(s.status === "LIBERADO" || s.status === "REJEITADO" || s.status === "CANCELADO") && (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova Solicitação de Adiantamento"
        saving={saving} onSave={salvarNovo} maxWidth="sm:max-w-lg">
        <div className="space-y-4">
          <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            Solicitação destinada a <strong>Fornecedor</strong>. Adiantamento de Cliente é registrado diretamente no Caixa.
          </div>
          <div className="space-y-1.5">
            <Label>Fornecedor <span className="text-destructive">*</span></Label>
            <Select value={novo.pessoaId} onValueChange={(v) => setNovo((n) => ({ ...n, pessoaId: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {fornecedores.map((p) => <SelectItem key={p.id} value={p.id}>{p.nomeRazao}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Valor <span className="text-destructive">*</span></Label>
            <Input type="number" step="0.01" min="0" value={novo.valor || ""}
              onChange={(e) => setNovo((n) => ({ ...n, valor: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea rows={3} maxLength={500} value={novo.observacoes}
              onChange={(e) => setNovo((n) => ({ ...n, observacoes: e.target.value }))} />
          </div>
        </div>
      </CrudModal>
    </div>
  );
}
