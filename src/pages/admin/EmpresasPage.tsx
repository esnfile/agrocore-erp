import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { CrudModal } from "@/components/CrudModal";
import { empresaService } from "@/lib/services";
import { useOrganization } from "@/contexts/OrganizationContext";
import type { Empresa } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  grupoId: z.string().min(1, "Selecione um grupo"),
  nome: z.string().min(3, "Mínimo 3 caracteres").max(200, "Máximo 200 caracteres").transform((v) => v.trim()),
  descricao: z.string().optional(),
  ativo: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function EmpresasPage() {
  const [data, setData] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Empresa | null>(null);
  const { grupoAtual, grupos } = useOrganization();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const columns: Column<Empresa>[] = [
    {
      key: "grupoId",
      header: "Grupo",
      render: (row) => {
        const g = grupos.find((g) => g.id === row.grupoId);
        return g?.nome ?? row.grupoId;
      },
    },
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
  ];

  const loadData = () => {
    setLoading(true);
    empresaService.listar(grupoAtual?.id).then((list) => {
      setData(list);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [grupoAtual]);

  const openNew = () => {
    setEditingId(null);
    reset({
      grupoId: grupoAtual?.id ?? "",
      nome: "",
      descricao: "",
      ativo: true,
    });
    setModalOpen(true);
  };

  const openEdit = (row: Empresa) => {
    setEditingId(row.id);
    reset({
      grupoId: row.grupoId,
      nome: row.nome,
      descricao: row.descricao,
      ativo: row.ativo,
    });
    setModalOpen(true);
  };

  const onSave = handleSubmit(async (formData) => {
    setSaving(true);
    try {
      await empresaService.salvar({
        ...formData,
        id: editingId ?? undefined,
      });
      toast({
        title: editingId ? "Empresa atualizada" : "Empresa criada",
        description: `${formData.nome} salva com sucesso.`,
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
    const temFiliais = await empresaService.possuiFiliais(deleteTarget.id);
    if (temFiliais) {
      toast({
        title: "Exclusão bloqueada",
        description: "Não é possível excluir uma empresa que possui filiais vinculadas.",
        variant: "destructive",
      });
      setDeleteTarget(null);
      return;
    }
    await empresaService.excluir(deleteTarget.id);
    toast({ title: "Empresa excluída", description: `${deleteTarget.nome} foi removida.` });
    setDeleteTarget(null);
    loadData();
  };

  return (
    <>
      <PageHeader title="Empresas" description="Gerencie as empresas do grupo" />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchPlaceholder="Buscar empresa..."
        onNew={openNew}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />
      <CrudModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar Empresa" : "Nova Empresa"}
        saving={saving}
        onSave={onSave}
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Grupo */}
          <div className="space-y-1.5">
            <Label>Grupo <span className="text-destructive">*</span></Label>
            <Controller
              name="grupoId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {grupos.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.grupoId && <p className="text-xs text-destructive">{errors.grupoId.message}</p>}
          </div>

          {/* Ativo */}
          <div className="space-y-1.5 flex items-end gap-3">
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

          {/* Nome */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="nome">Nome <span className="text-destructive">*</span></Label>
            <Input id="nome" maxLength={200} {...register("nome")} />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
          </div>

          {/* Descrição */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" rows={3} {...register("descricao")} />
          </div>
        </div>
      </CrudModal>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente excluir esta empresa? Esta ação não poderá ser desfeita.
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
