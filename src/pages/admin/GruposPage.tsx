import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
    .max(150, "Máximo 150 caracteres")
    .transform((v) => v.trim()),
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
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const columns: Column<Grupo>[] = [
    { key: "nome", header: "Nome" },
    {
      key: "criadoEm",
      header: "Criado em",
      render: (row) => format(new Date(row.criadoEm), "dd/MM/yyyy HH:mm"),
    },
    {
      key: "atualizadoEm",
      header: "Atualizado em",
      render: (row) => format(new Date(row.atualizadoEm), "dd/MM/yyyy HH:mm"),
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
    reset({ nome: "" });
    setModalOpen(true);
  };

  const openEdit = (row: Grupo) => {
    setEditingId(row.id);
    reset({ nome: row.nome });
    setModalOpen(true);
  };

  const onSave = handleSubmit(async (formData) => {
    // Validar duplicidade
    const duplicado = await grupoService.nomeExiste(formData.nome, editingId ?? undefined);
    if (duplicado) {
      setError("nome", { message: "Já existe um grupo com este nome" });
      return;
    }

    setSaving(true);
    try {
      await grupoService.salvar({ id: editingId ?? undefined, nome: formData.nome });
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

      {/* Modal Cadastro/Edição */}
      <CrudModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar Grupo" : "Novo Grupo"}
        saving={saving}
        onSave={onSave}
      >
        <div className="space-y-4" style={{ maxWidth: 600, padding: "0" }}>
          <div className="space-y-1.5">
            <Label htmlFor="nome">
              Nome do Grupo <span className="text-destructive">*</span>
            </Label>
            <Input id="nome" maxLength={150} {...register("nome")} />
            {errors.nome && (
              <p className="text-xs text-destructive">{errors.nome.message}</p>
            )}
          </div>
        </div>
      </CrudModal>

      {/* Dialog de confirmação de exclusão */}
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
