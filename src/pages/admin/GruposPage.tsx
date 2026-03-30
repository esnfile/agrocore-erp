import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { CrudModal } from "@/components/CrudModal";
import { grupoService } from "@/lib/services";
import type { Grupo } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const schema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(200, "Máximo 200 caracteres")
    .transform((v) => v.trim()),
  descricao: z.string().optional(),
  ativo: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function GruposPage() {
  const [data, setData] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Grupo | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const columns: Column<Grupo>[] = [
    { key: "nome", header: "Nome" },
    { key: "descricao", header: "Descrição" },
    {
      key: "ativo",
      header: "Status",
      render: (row) => (
        <Badge variant={row.ativo ? "default" : "secondary"}>
          {row.ativo ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      key: "criadoEm",
      header: "Criado em",
      render: (row) => format(new Date(row.criadoEm), "dd/MM/yyyy HH:mm"),
    },
  ];

  const loadData = () => {
    setLoading(true);
    grupoService.listar().then((list) => {
      setData(list);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNew = () => {
    setEditingId(null);
    reset({ nome: "", descricao: "", ativo: true });
    setModalOpen(true);
  };

  const openEdit = (row: Grupo) => {
    setEditingId(row.id);
    reset({ nome: row.nome, descricao: row.descricao, ativo: row.ativo });
    setModalOpen(true);
  };

  const onSave = handleSubmit(async (formData) => {
    const duplicado = await grupoService.nomeExiste(formData.nome, editingId ?? undefined);
    if (duplicado) {
      setError("nome", { message: "Já existe um grupo com este nome" });
      return;
    }

    setSaving(true);
    try {
      await grupoService.salvar({
        id: editingId ?? undefined,
        nome: formData.nome,
        descricao: formData.descricao ?? "",
        ativo: formData.ativo,
      });
      toast({
        title: editingId ? "Grupo atualizado" : "Grupo criado",
        description: `"${formData.nome}" salvo com sucesso.`,
      });
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

    const possuiEmpresas = await grupoService.possuiEmpresas(deleteTarget.id);
    if (possuiEmpresas) {
      toast({
        title: "Exclusão bloqueada",
        description: "Não é possível excluir um grupo que possui empresas vinculadas.",
        variant: "destructive",
      });
      setDeleteTarget(null);
      return;
    }

    await grupoService.excluir(deleteTarget.id);
    toast({ title: "Grupo excluído", description: `"${deleteTarget.nome}" foi removido.` });
    setDeleteTarget(null);
    loadData();
  };

  return (
    <>
      <PageHeader title="Grupos" description="Gerencie os grupos empresariais" />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchPlaceholder="Buscar por nome..."
        onNew={openNew}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      <CrudModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar Grupo" : "Novo Grupo"}
        saving={saving}
        onSave={onSave}
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="nome">
              Nome do Grupo <span className="text-destructive">*</span>
            </Label>
            <Input id="nome" maxLength={200} {...register("nome")} />
            {errors.nome && (
              <p className="text-xs text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" rows={3} {...register("descricao")} />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="ativo">Ativo</Label>
            <Controller
              name="ativo"
              control={control}
              render={({ field }) => (
                <Switch id="ativo" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
        </div>
      </CrudModal>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente excluir este grupo? Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
