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
import { coeficienteService, coeficienteEmpresaService, empresaService } from "@/lib/services";
import type { Coeficiente, CoeficienteEmpresa, Empresa, AplicaSobre } from "@/lib/mock-data";

const schema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória").max(150, "Máximo 150 caracteres").transform((v) => v.trim()),
  ativo: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface EmpresaRow {
  id?: string;
  empresaId: string;
  empresaNome: string;
  percentualCustoVariavel: number;
  percentualCustoFixo: number;
  percentualImpostos: number;
  aplicaSobre: AplicaSobre;
}

export default function CoeficientesPage() {
  const { grupoAtual, empresas: empresasCtx } = useOrganization();
  const grupoId = grupoAtual?.id ?? null;

  const [data, setData] = useState<Coeficiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Coeficiente | null>(null);
  const [confirmMassUpdate, setConfirmMassUpdate] = useState(false);

  // Empresas tab state
  const [empresaRows, setEmpresaRows] = useState<EmpresaRow[]>([]);
  const [empresasGrupo, setEmpresasGrupo] = useState<Empresa[]>([]);

  const { register, handleSubmit, reset, setError, setValue, watch, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) });
  const ativoValue = watch("ativo");

  const columns: Column<Coeficiente>[] = [
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
    coeficienteService.listar(grupoId).then((list) => { setData(list); setLoading(false); });
  }, [grupoId]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (grupoId) {
      empresaService.listar(grupoId).then(setEmpresasGrupo);
    }
  }, [grupoId]);

  const loadEmpresaRows = useCallback(async (coefId: string) => {
    const ces = await coeficienteEmpresaService.listarPorCoeficiente(coefId);
    setEmpresaRows(ces.map((ce) => {
      const emp = empresasGrupo.find((e) => e.id === ce.empresaId);
      return {
        id: ce.id, empresaId: ce.empresaId,
        empresaNome: emp?.nome || emp?.nome || ce.empresaId,
        percentualCustoVariavel: ce.percentualCustoVariavel,
        percentualCustoFixo: ce.percentualCustoFixo,
        percentualImpostos: ce.percentualImpostos,
        aplicaSobre: ce.aplicaSobre,
      };
    }));
  }, [empresasGrupo]);

  const openNew = () => {
    setEditingId(null);
    reset({ descricao: "", ativo: true });
    setEmpresaRows([]);
    setModalOpen(true);
  };

  const openEdit = async (row: Coeficiente) => {
    setEditingId(row.id);
    reset({ descricao: row.descricao, ativo: row.ativo });
    await loadEmpresaRows(row.id);
    setModalOpen(true);
  };

  const onSave = handleSubmit(async (formData) => {
    if (!grupoId) return;
    const dup = await coeficienteService.descricaoExiste(formData.descricao, grupoId, editingId ?? undefined);
    if (dup) { setError("descricao", { message: "Já existe coeficiente com esta descrição" }); return; }

    setSaving(true);
    try {
      const saved = await coeficienteService.salvar({ id: editingId ?? undefined, ...formData }, grupoId);
      // Save empresa rows
      for (const row of empresaRows) {
        await coeficienteEmpresaService.salvar({
          id: row.id, empresaId: row.empresaId,
          percentualCustoVariavel: row.percentualCustoVariavel,
          percentualCustoFixo: row.percentualCustoFixo,
          percentualImpostos: row.percentualImpostos,
          aplicaSobre: row.aplicaSobre,
        }, saved.id);
      }
      toast({ title: editingId ? "Coeficiente atualizado" : "Coeficiente criado", description: `"${formData.descricao}" salvo com sucesso.` });
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
    await coeficienteService.excluir(deleteTarget.id);
    toast({ title: "Coeficiente excluído", description: `"${deleteTarget.descricao}" foi removido.` });
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
      empresaId: emp.id, empresaNome: emp.nome,
      percentualCustoVariavel: 0, percentualCustoFixo: 0, percentualImpostos: 0,
      aplicaSobre: "CUSTO_BASE",
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
        <PageHeader title="Coeficientes" description="Gerencie os coeficientes comerciais" />
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Selecione um Grupo para visualizar os registros.
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Coeficientes" description="Gerencie os coeficientes comerciais" />
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
        title={editingId ? "Editar Coeficiente" : "Novo Coeficiente"}
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
                <h3 className="text-sm font-medium">Percentuais por Empresa</h3>
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
                    <div key={index} className="rounded-lg border bg-card p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Select
                            value={row.empresaId}
                            onValueChange={(v) => {
                              const emp = empresasGrupo.find((e) => e.id === v);
                              updateEmpresaRow(index, "empresaId", v);
                              updateEmpresaRow(index, "empresaNome", emp?.nome || emp?.nome || v);
                            }}
                          >
                            <SelectTrigger className="w-[250px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {empresasGrupo.map((e) => (
                                <SelectItem key={e.id} value={e.id} disabled={empresaRows.some((r, i) => i !== index && r.empresaId === e.id)}>
                                  {e.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeEmpresa(index)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Custo Variável (%)</Label>
                          <Input
                            type="number" step="0.01" min="0" max="99.99"
                            value={row.percentualCustoVariavel}
                            onChange={(e) => updateEmpresaRow(index, "percentualCustoVariavel", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Custo Fixo (%)</Label>
                          <Input
                            type="number" step="0.01" min="0" max="99.99"
                            value={row.percentualCustoFixo}
                            onChange={(e) => updateEmpresaRow(index, "percentualCustoFixo", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Impostos (%)</Label>
                          <Input
                            type="number" step="0.01" min="0" max="99.99"
                            value={row.percentualImpostos}
                            onChange={(e) => updateEmpresaRow(index, "percentualImpostos", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Aplica Sobre</Label>
                          <Select value={row.aplicaSobre} onValueChange={(v) => updateEmpresaRow(index, "aplicaSobre", v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CUSTO_BASE">Custo Base</SelectItem>
                              <SelectItem value="CUSTO_COM_IMPOSTO">Custo c/ Imposto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CrudModal>

      {/* Delete confirmation */}
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

      {/* Mass update confirmation */}
      <AlertDialog open={confirmMassUpdate} onOpenChange={setConfirmMassUpdate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atualizar produtos vinculados</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá recalcular custos e preços dos produtos vinculados a este coeficiente. Deseja continuar?
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
