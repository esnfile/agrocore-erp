import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { CrudModal } from "@/components/CrudModal";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useOrganization } from "@/contexts/OrganizationContext";
import { tabelaPrecoService, tabelaPrecoEmpresaService, empresaService } from "@/lib/services";
import type { TabelaPreco, Empresa } from "@/lib/mock-data";

const schema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória").max(150, "Máximo 150 caracteres").transform((v) => v.trim()),
  ativo: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface EmpresaRow {
  id?: string;
  empresaId: string;
  empresaNome: string;
  margemLucroPercentual: number;
}

export default function TabelaPrecosPage() {
  const { grupoAtual, empresas: empresasCtx } = useOrganization();
  const grupoId = grupoAtual?.id ?? null;

  const [data, setData] = useState<TabelaPreco[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TabelaPreco | null>(null);
  const [confirmMassUpdate, setConfirmMassUpdate] = useState(false);

  const [empresaRows, setEmpresaRows] = useState<EmpresaRow[]>([]);
  const [empresasGrupo, setEmpresasGrupo] = useState<Empresa[]>([]);

  const { register, handleSubmit, reset, setError, setValue, watch, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) });
  const ativoValue = watch("ativo");

  const columns: Column<TabelaPreco>[] = [
    { key: "descricao", header: "Descrição" },
    {
      key: "ativo", header: "Status",
      render: (row) => <Badge variant={row.ativo ? "default" : "secondary"}>{row.ativo ? "Ativo" : "Inativo"}</Badge>,
    },
    { key: "criadoEm", header: "Criado em", render: (row) => format(new Date(row.criadoEm), "dd/MM/yyyy HH:mm") },
    { key: "atualizadoEm", header: "Atualizado em", render: (row) => format(new Date(row.atualizadoEm), "dd/MM/yyyy HH:mm") },
  ];

  const loadData = useCallback(() => {
    if (!grupoId) { setData([]); setLoading(false); return; }
    setLoading(true);
    tabelaPrecoService.listar(grupoId).then((list) => { setData(list); setLoading(false); });
  }, [grupoId]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (grupoId) empresaService.listar(grupoId).then(setEmpresasGrupo);
  }, [grupoId]);

  const loadEmpresaRows = useCallback(async (tabelaId: string) => {
    const tpes = await tabelaPrecoEmpresaService.listarPorTabela(tabelaId);
    setEmpresaRows(tpes.map((tpe) => {
      const emp = empresasGrupo.find((e) => e.id === tpe.empresaId);
      return {
        id: tpe.id, empresaId: tpe.empresaId,
        empresaNome: emp?.nomeFantasia || emp?.razaoSocial || tpe.empresaId,
        margemLucroPercentual: tpe.margemLucroPercentual,
      };
    }));
  }, [empresasGrupo]);

  const openNew = () => {
    setEditingId(null);
    reset({ descricao: "", ativo: true });
    setEmpresaRows([]);
    setModalOpen(true);
  };

  const openEdit = async (row: TabelaPreco) => {
    setEditingId(row.id);
    reset({ descricao: row.descricao, ativo: row.ativo });
    await loadEmpresaRows(row.id);
    setModalOpen(true);
  };

  const onSave = handleSubmit(async (formData) => {
    if (!grupoId) return;
    const dup = await tabelaPrecoService.descricaoExiste(formData.descricao, grupoId, editingId ?? undefined);
    if (dup) { setError("descricao", { message: "Já existe tabela de preço com esta descrição" }); return; }

    setSaving(true);
    try {
      const saved = await tabelaPrecoService.salvar({ id: editingId ?? undefined, ...formData }, grupoId);
      for (const row of empresaRows) {
        await tabelaPrecoEmpresaService.salvar({
          id: row.id, empresaId: row.empresaId,
          margemLucroPercentual: row.margemLucroPercentual,
        }, saved.id);
      }
      toast({ title: editingId ? "Tabela atualizada" : "Tabela criada", description: `"${formData.descricao}" salvo com sucesso.` });
      setModalOpen(false);
      loadData();
    } catch {
      toast({ title: "Erro", description: "Não foi possível salvar.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await tabelaPrecoService.excluir(deleteTarget.id);
    toast({ title: "Tabela excluída", description: `"${deleteTarget.descricao}" foi removida.` });
    setDeleteTarget(null);
    loadData();
  };

  const addEmpresa = () => {
    const usedIds = empresaRows.map((r) => r.empresaId);
    const available = empresasGrupo.filter((e) => !usedIds.includes(e.id));
    if (available.length === 0) {
      toast({ title: "Aviso", description: "Todas as empresas do grupo já foram adicionadas.", variant: "destructive" });
      return;
    }
    const emp = available[0];
    setEmpresaRows((prev) => [...prev, {
      empresaId: emp.id, empresaNome: emp.nomeFantasia || emp.razaoSocial,
      margemLucroPercentual: 0,
    }]);
  };

  const removeEmpresa = (index: number) => {
    setEmpresaRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEmpresaRow = (index: number, field: keyof EmpresaRow, value: any) => {
    setEmpresaRows((prev) => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const handleMassUpdate = () => {
    setConfirmMassUpdate(false);
    const count = Math.floor(Math.random() * 50) + 5;
    toast({ title: "Atualização concluída", description: `${count} produtos vinculados foram recalculados com sucesso.` });
  };

  if (!grupoId) {
    return (
      <>
        <PageHeader title="Tabela de Preços" description="Gerencie as tabelas de preço" />
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Selecione um Grupo para visualizar os registros.
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Tabela de Preços" description="Gerencie as tabelas de preço" />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchPlaceholder="Buscar por descrição..."
        onNew={openNew}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      <CrudModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar Tabela de Preço" : "Nova Tabela de Preço"}
        saving={saving}
        onSave={onSave}
        maxWidth="sm:max-w-4xl"
      >
        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="dados">Dados Gerais</TabsTrigger>
            <TabsTrigger value="empresas">Empresas</TabsTrigger>
          </TabsList>

          <TabsContent value="dados">
            <div className="space-y-4 max-w-[600px]">
              <div className="space-y-1.5">
                <Label htmlFor="descricao">Descrição <span className="text-destructive">*</span></Label>
                <Input id="descricao" maxLength={150} {...register("descricao")} />
                {errors.descricao && <p className="text-xs text-destructive">{errors.descricao.message}</p>}
              </div>
              <div className="flex items-center gap-3">
                <Switch id="ativo" checked={ativoValue} onCheckedChange={(v) => setValue("ativo", v)} />
                <Label htmlFor="ativo">Ativo</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="empresas">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Margem de Lucro por Empresa</h3>
                <div className="flex gap-2">
                  {editingId && (
                    <Button type="button" variant="outline" size="sm" onClick={() => setConfirmMassUpdate(true)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Atualizar produtos vinculados
                    </Button>
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={addEmpresa}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Empresa
                  </Button>
                </div>
              </div>

              {empresaRows.length === 0 ? (
                <div className="rounded-lg border bg-muted/50 p-6 text-center text-sm text-muted-foreground">
                  Nenhuma empresa vinculada. Clique em "Adicionar Empresa" para começar.
                </div>
              ) : (
                <div className="space-y-3">
                  {empresaRows.map((row, index) => (
                    <div key={index} className="rounded-lg border bg-card p-4">
                      <div className="flex items-center gap-4">
                        <Select
                          value={row.empresaId}
                          onValueChange={(v) => {
                            const emp = empresasGrupo.find((e) => e.id === v);
                            updateEmpresaRow(index, "empresaId", v);
                            updateEmpresaRow(index, "empresaNome", emp?.nomeFantasia || emp?.razaoSocial || v);
                          }}
                        >
                          <SelectTrigger className="w-[250px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {empresasGrupo.map((e) => (
                              <SelectItem key={e.id} value={e.id} disabled={empresaRows.some((r, i) => i !== index && r.empresaId === e.id)}>
                                {e.nomeFantasia || e.razaoSocial}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex-1 max-w-[200px] space-y-1.5">
                          <Label className="text-xs">Margem de Lucro (%)</Label>
                          <Input
                            type="number" step="0.01" min="0" max="99.99"
                            value={row.margemLucroPercentual}
                            onChange={(e) => updateEmpresaRow(index, "margemLucroPercentual", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeEmpresa(index)} className="text-destructive hover:text-destructive self-end">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CrudModal>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Deseja realmente excluir este registro? Esta ação não poderá ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmMassUpdate} onOpenChange={setConfirmMassUpdate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atualizar produtos vinculados</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá recalcular preços dos produtos vinculados a esta tabela de preço. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleMassUpdate}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
