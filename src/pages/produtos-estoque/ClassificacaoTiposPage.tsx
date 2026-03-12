import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { CrudModal } from "@/components/CrudModal";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useOrganization } from "@/contexts/OrganizationContext";
import { classificacaoTipoService } from "@/lib/services";
import type { ClassificacaoTipo, UnidadeClassificacao } from "@/lib/mock-data";

const schema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória").max(100).transform((v) => v.trim()),
  unidade: z.enum(["PERCENTUAL", "KG", "GRAMAS"]),
  ativo: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function ClassificacaoTiposPage() {
  const { grupoAtual, empresaAtual, filialAtual } = useOrganization();
  const empresaId = empresaAtual?.id ?? "";
  const filialId = filialAtual?.id ?? "";
  const grupoId = grupoAtual?.id ?? "";

  const [data, setData] = useState<ClassificacaoTipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClassificacaoTipo | null>(null);

  const { register, handleSubmit, reset, setError, setValue, watch, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) });
  const ativoValue = watch("ativo");

  const columns: Column<ClassificacaoTipo>[] = [
    { key: "descricao", header: "Descrição" },
    { key: "unidade", header: "Unidade", render: (r) => {
      const map: Record<string, string> = { PERCENTUAL: "%", KG: "Kg", GRAMAS: "g" };
      return map[r.unidade] ?? r.unidade;
    }},
    { key: "ativo", header: "Status", render: (r) => (
      <Badge variant={r.ativo ? "default" : "secondary"}>{r.ativo ? "Ativo" : "Inativo"}</Badge>
    )},
  ];

  const loadData = useCallback(() => {
    if (!empresaId || !filialId) { setData([]); setLoading(false); return; }
    setLoading(true);
    classificacaoTipoService.listar(empresaId, filialId).then((list) => {
      setData(list);
      setLoading(false);
    });
  }, [empresaId, filialId]);

  useEffect(() => { loadData(); }, [loadData]);

  const openNew = () => {
    setEditingId(null);
    reset({ descricao: "", unidade: "PERCENTUAL", ativo: true });
    setModalOpen(true);
  };

  const openEdit = (row: ClassificacaoTipo) => {
    setEditingId(row.id);
    reset({ descricao: row.descricao, unidade: row.unidade, ativo: row.ativo });
    setModalOpen(true);
  };

  const onSave = handleSubmit(async (formData) => {
    if (!grupoId || !empresaId || !filialId) return;
    const dup = await classificacaoTipoService.descricaoExiste(formData.descricao, empresaId, filialId, editingId ?? undefined);
    if (dup) { setError("descricao", { message: "Já existe tipo com esta descrição" }); return; }
    setSaving(true);
    try {
      await classificacaoTipoService.salvar(
        { id: editingId ?? undefined, ...formData },
        { grupoId, empresaId, filialId }
      );
      toast({ title: editingId ? "Atualizado" : "Criado", description: `"${formData.descricao}" salvo com sucesso.` });
      setModalOpen(false);
      loadData();
    } catch {
      toast({ title: "Erro", description: "Falha ao salvar.", variant: "destructive" });
    } finally { setSaving(false); }
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await classificacaoTipoService.excluir(deleteTarget.id);
    toast({ title: "Excluído", description: `"${deleteTarget.descricao}" removido.` });
    setDeleteTarget(null);
    loadData();
  };

  if (!grupoId) {
    return (
      <>
        <PageHeader title="Tipos de Classificação" description="Tipos de análise para classificação de grãos" />
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Selecione um Grupo para visualizar.
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Tipos de Classificação" description="Tipos de análise para classificação de grãos (Umidade, Impureza, etc.)" />
      <DataTable columns={columns} data={data} loading={loading} searchPlaceholder="Buscar..." onNew={openNew} onEdit={openEdit} onDelete={(r) => setDeleteTarget(r)} />

      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Editar Tipo" : "Novo Tipo"} saving={saving} onSave={onSave}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Descrição <span className="text-destructive">*</span></Label>
            <Input maxLength={100} {...register("descricao")} />
            {errors.descricao && <p className="text-xs text-destructive">{errors.descricao.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Unidade <span className="text-destructive">*</span></Label>
            <Select value={watch("unidade")} onValueChange={(v) => setValue("unidade", v as UnidadeClassificacao)}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTUAL">Percentual (%)</SelectItem>
                <SelectItem value="KG">Quilograma (Kg)</SelectItem>
                <SelectItem value="GRAMAS">Gramas (g)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="ativo" checked={ativoValue} onCheckedChange={(v) => setValue("ativo", v)} />
            <Label htmlFor="ativo">Ativo</Label>
          </div>
        </div>
      </CrudModal>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Deseja excluir "{deleteTarget?.descricao}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
