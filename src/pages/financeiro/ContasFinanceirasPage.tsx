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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { financeiroContaFinanceiraService, financeiroTipoContaService, financeiroBancoService } from "@/lib/services";
import type { FinanceiroContaFinanceira, FinanceiroTipoConta, FinanceiroBanco } from "@/lib/mock-data";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ContasFinanceirasPage() {
  const { grupoAtual, empresaAtual, filialAtual } = useOrganization();
  const grupoId = grupoAtual?.id ?? "";
  const empresaId = empresaAtual?.id ?? "";
  const filialId = filialAtual?.id ?? "";
  const { toast } = useToast();

  const [data, setData] = useState<FinanceiroContaFinanceira[]>([]);
  const [tiposContas, setTiposContas] = useState<FinanceiroTipoConta[]>([]);
  const [bancos, setBancos] = useState<FinanceiroBanco[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [descricao, setDescricao] = useState("");
  const [tipoContaId, setTipoContaId] = useState("");
  const [bancoId, setBancoId] = useState<string>("");
  const [agencia, setAgencia] = useState("");
  const [contaCorrente, setContaCorrente] = useState("");
  const [permiteSaldoNegativo, setPermiteSaldoNegativo] = useState(false);
  const [ativo, setAtivo] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    const [d, tc, b] = await Promise.all([
      financeiroContaFinanceiraService.listar(empresaId, filialId),
      financeiroTipoContaService.listar(empresaId, filialId),
      financeiroBancoService.listar(empresaId, filialId),
    ]);
    setData(d); setTiposContas(tc); setBancos(b);
    setLoading(false);
  }, [empresaId, filialId]);

  useEffect(() => { carregar(); }, [carregar]);

  const getTipoNome = (id: string) => tiposContas.find((t) => t.id === id)?.descricao ?? "—";
  const getBancoNome = (id: string | null) => id ? bancos.find((b) => b.id === id)?.descricao ?? "—" : "—";
  const tipoSelecionado = tiposContas.find((t) => t.id === tipoContaId);
  const mostrarBanco = tipoSelecionado?.descricao?.toUpperCase() === "BANCO";

  const reset = () => {
    setDescricao(""); setTipoContaId(""); setBancoId(""); setAgencia(""); setContaCorrente("");
    setPermiteSaldoNegativo(false); setAtivo(true); setEditId(null);
  };

  const openNew = () => { reset(); setModalOpen(true); };
  const openEdit = (row: FinanceiroContaFinanceira) => {
    setEditId(row.id); setDescricao(row.descricao); setTipoContaId(row.tipoContaId);
    setBancoId(row.bancoId ?? ""); setAgencia(row.agencia); setContaCorrente(row.contaCorrente);
    setPermiteSaldoNegativo(row.permiteSaldoNegativo); setAtivo(row.ativo);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!descricao || !tipoContaId) { toast({ title: "Preencha os campos obrigatórios", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await financeiroContaFinanceiraService.salvar({
        id: editId ?? undefined, descricao, tipoContaId,
        bancoId: mostrarBanco ? (bancoId || null) : null,
        agencia: mostrarBanco ? agencia : "", contaCorrente: mostrarBanco ? contaCorrente : "",
        permiteSaldoNegativo, ativo,
      }, { grupoId, empresaId, filialId });
      toast({ title: "Conta financeira salva" });
      setModalOpen(false); carregar();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await financeiroContaFinanceiraService.excluir(deleteId);
    toast({ title: "Conta financeira excluída" });
    setDeleteId(null); carregar();
  };

  return (
    <div>
      <PageHeader title="Contas Financeiras" description="Cadastro de contas financeiras (caixa, banco, carteira)" />
      <div className="flex justify-end mb-4">
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Nova Conta Financeira</Button>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Banco</TableHead>
              <TableHead>Agência</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead className="text-right">Saldo Atual</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-28 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma conta financeira</TableCell></TableRow>
            ) : data.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.descricao}</TableCell>
                <TableCell>{getTipoNome(c.tipoContaId)}</TableCell>
                <TableCell>{getBancoNome(c.bancoId)}</TableCell>
                <TableCell>{c.agencia || "—"}</TableCell>
                <TableCell>{c.contaCorrente || "—"}</TableCell>
                <TableCell className={`text-right font-mono ${c.saldoAtual >= 0 ? "text-success" : "text-destructive"}`}>{fmt(c.saldoAtual)}</TableCell>
                <TableCell><Badge variant={c.ativo ? "default" : "secondary"}>{c.ativo ? "Ativo" : "Inativo"}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-center">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(c.id)} className="hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Editar Conta Financeira" : "Nova Conta Financeira"} saving={saving} onSave={handleSave}>
        <div className="space-y-4" style={{ maxWidth: 600 }}>
          <div className="space-y-1.5">
            <Label>Descrição <span className="text-destructive">*</span></Label>
            <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo de Conta <span className="text-destructive">*</span></Label>
            <Select value={tipoContaId} onValueChange={setTipoContaId}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {tiposContas.map((t) => <SelectItem key={t.id} value={t.id}>{t.descricao}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {mostrarBanco && (
            <>
              <div className="space-y-1.5">
                <Label>Banco</Label>
                <Select value={bancoId} onValueChange={setBancoId}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {bancos.map((b) => <SelectItem key={b.id} value={b.id}>{b.descricao}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Agência</Label>
                  <Input value={agencia} onChange={(e) => setAgencia(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Conta Corrente</Label>
                  <Input value={contaCorrente} onChange={(e) => setContaCorrente(e.target.value)} />
                </div>
              </div>
            </>
          )}
          <div className="flex items-center gap-3">
            <Switch checked={permiteSaldoNegativo} onCheckedChange={setPermiteSaldoNegativo} />
            <Label>Permite Saldo Negativo</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={ativo} onCheckedChange={setAtivo} />
            <Label>Ativo</Label>
          </div>
        </div>
      </CrudModal>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta financeira?</AlertDialogTitle>
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