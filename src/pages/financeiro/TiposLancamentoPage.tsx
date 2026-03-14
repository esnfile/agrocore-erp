import { useState, useEffect, useCallback } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { PageHeader } from "@/components/PageHeader";
import { CrudModal } from "@/components/CrudModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Lock } from "lucide-react";
import { financeiroTipoLancamentoService, financeiroTipoContaService } from "@/lib/services";
import type { FinanceiroTipoLancamento, FinanceiroTipoConta, TipoMovimentoFinanceiro } from "@/lib/mock-data";

export default function TiposLancamentoPage() {
  const { grupoAtual, empresaAtual, filialAtual } = useOrganization();
  const grupoId = grupoAtual?.id ?? "";
  const empresaId = empresaAtual?.id ?? "";
  const filialId = filialAtual?.id ?? "";
  const { toast } = useToast();

  const [data, setData] = useState<FinanceiroTipoLancamento[]>([]);
  const [tiposContas, setTiposContas] = useState<FinanceiroTipoConta[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FinanceiroTipoLancamento | null>(null);

  const [descricao, setDescricao] = useState("");
  const [tipoMovimento, setTipoMovimento] = useState<TipoMovimentoFinanceiro>("ENTRADA");
  const [tipoConta, setTipoConta] = useState<string[]>([]);
  const [exigeCentroCusto, setExigeCentroCusto] = useState(false);
  const [ativo, setAtivo] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    const [d, tc] = await Promise.all([
      financeiroTipoLancamentoService.listar(empresaId, filialId),
      financeiroTipoContaService.listar(empresaId, filialId),
    ]);
    setData(d); setTiposContas(tc);
    setLoading(false);
  }, [empresaId, filialId]);

  useEffect(() => { carregar(); }, [carregar]);

  const reset = () => {
    setDescricao(""); setTipoMovimento("ENTRADA"); setTipoConta([]); setExigeCentroCusto(false); setAtivo(true); setEditId(null);
  };

  const openNew = () => { reset(); setModalOpen(true); };
  const openEdit = (row: FinanceiroTipoLancamento) => {
    if (!row.permiteEdicao) { toast({ title: "Tipo de sistema não pode ser editado", variant: "destructive" }); return; }
    setEditId(row.id); setDescricao(row.descricao); setTipoMovimento(row.tipoMovimento);
    setTipoConta(row.tipoConta); setExigeCentroCusto(row.exigeCentroCusto); setAtivo(row.ativo);
    setModalOpen(true);
  };

  const toggleTipoConta = (desc: string) => {
    setTipoConta((prev) => prev.includes(desc) ? prev.filter((t) => t !== desc) : [...prev, desc]);
  };

  const handleSave = async () => {
    if (!descricao) { toast({ title: "Preencha a descrição", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await financeiroTipoLancamentoService.salvar({
        id: editId ?? undefined, descricao, tipoMovimento, tipoConta, exigeCentroCusto, ativo,
      }, { grupoId, empresaId, filialId });
      toast({ title: "Tipo de lançamento salvo" });
      setModalOpen(false); carregar();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await financeiroTipoLancamentoService.excluir(deleteTarget.id);
    if (result.sucesso) { toast({ title: "Excluído" }); } else { toast({ title: "Erro", description: result.mensagem, variant: "destructive" }); }
    setDeleteTarget(null); carregar();
  };

  const movColors: Record<string, string> = {
    ENTRADA: "border-success/50 text-success",
    SAIDA: "border-destructive/50 text-destructive",
    TRANSFERENCIA: "border-blue-400 text-blue-600",
  };

  return (
    <div>
      <PageHeader title="Tipos de Lançamento" description="Configuração dos tipos de lançamento financeiro" />
      <div className="flex justify-end mb-4">
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Novo Tipo</Button>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-32">Movimento</TableHead>
              <TableHead>Tipo Conta</TableHead>
              <TableHead className="w-24">Sistema</TableHead>
              <TableHead className="w-28">Centro Custo</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-28 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : data.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">
                  {t.origemSistema && <Lock className="inline h-3 w-3 mr-1 text-muted-foreground" />}
                  {t.descricao}
                </TableCell>
                <TableCell><Badge variant="outline" className={movColors[t.tipoMovimento]}>{t.tipoMovimento}</Badge></TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {t.tipoConta.map((tc) => <Badge key={tc} variant="secondary" className="text-xs">{tc}</Badge>)}
                  </div>
                </TableCell>
                <TableCell>{t.origemSistema ? "Sim" : "Não"}</TableCell>
                <TableCell>{t.exigeCentroCusto ? "Sim" : "Não"}</TableCell>
                <TableCell><Badge variant={t.ativo ? "default" : "secondary"}>{t.ativo ? "Ativo" : "Inativo"}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-center">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(t)} disabled={!t.permiteEdicao}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => t.permiteExclusao ? setDeleteTarget(t) : toast({ title: "Tipo de sistema não pode ser excluído", variant: "destructive" })} disabled={!t.permiteExclusao} className="hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Editar Tipo de Lançamento" : "Novo Tipo de Lançamento"} saving={saving} onSave={handleSave}>
        <div className="space-y-4" style={{ maxWidth: 600 }}>
          <div className="space-y-1.5">
            <Label>Descrição <span className="text-destructive">*</span></Label>
            <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo de Movimento <span className="text-destructive">*</span></Label>
            <Select value={tipoMovimento} onValueChange={(v) => setTipoMovimento(v as TipoMovimentoFinanceiro)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ENTRADA">Entrada</SelectItem>
                <SelectItem value="SAIDA">Saída</SelectItem>
                <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tipos de Conta (tags)</Label>
            <div className="flex flex-wrap gap-2">
              {tiposContas.map((tc) => (
                <Badge
                  key={tc.id}
                  variant={tipoConta.includes(tc.descricao) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTipoConta(tc.descricao)}
                >
                  {tc.descricao}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={exigeCentroCusto} onCheckedChange={setExigeCentroCusto} />
            <Label>Exige Centro de Custo</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={ativo} onCheckedChange={setAtivo} />
            <Label>Ativo</Label>
          </div>
        </div>
      </CrudModal>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tipo de lançamento?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}