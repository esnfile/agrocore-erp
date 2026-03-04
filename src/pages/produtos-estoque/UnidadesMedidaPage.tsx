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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useOrganization } from "@/contexts/OrganizationContext";
import { unidadeMedidaService } from "@/lib/services";
import type { UnidadeMedida, TipoUnidadeMedida } from "@/lib/mock-data";

const schema = z.object({
  codigo: z
    .string()
    .min(1, "Código é obrigatório")
    .max(10, "Máximo 10 caracteres")
    .transform((v) => v.trim().toUpperCase()),
  descricao: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(100, "Máximo 100 caracteres")
    .transform((v) => v.trim()),
  tipo: z.enum(["PESO", "VOLUME", "UNIDADE"]),
  fatorBase: z.coerce.number().min(0.000001, "Fator deve ser maior que 0"),
  ativo: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const tipoLabels: Record<TipoUnidadeMedida, string> = {
  PESO: "Peso",
  VOLUME: "Volume",
  UNIDADE: "Unidade",
};

export default function UnidadesMedidaPage() {
  const { grupoAtual, empresaAtual, filialAtual } = useOrganization();
  const empresaId = empresaAtual?.id ?? null;
  const filialId = filialAtual?.id ?? null;

  const [data, setData] = useState<UnidadeMedida[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UnidadeMedida | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const ativoValue = watch("ativo");

  const columns: Column<UnidadeMedida>[] = [
    { key: "codigo", header: "Código" },
    { key: "descricao", header: "Descrição" },
    {
      key: "tipo",
      header: "Tipo",
      render: (row) => tipoLabels[row.tipo] ?? row.tipo,
    },
    {
      key: "fatorBase",
      header: "Fator Base",
      render: (row) => row.fatorBase.toString(),
    },
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

  const loadData = useCallback(() => {
    if (!empresaId || !filialId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    unidadeMedidaService.listar(empresaId, filialId).then((list) => {
      setData(list);
      setLoading(false);
    });
  }, [empresaId, filialId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openNew = () => {
    setEditingId(null);
    reset({ codigo: "", descricao: "", tipo: "PESO", fatorBase: 1, ativo: true });
    setModalOpen(true);
  };

  const openEdit = (row: UnidadeMedida) => {
    setEditingId(row.id);
    reset({
      codigo: row.codigo,
      descricao: row.descricao,
      tipo: row.tipo,
      fatorBase: row.fatorBase,
      ativo: row.ativo,
    });
    setModalOpen(true);
  };

  const onSave = handleSubmit(async (formData) => {
    if (!empresaId || !filialId || !grupoAtual) return;
    const dup = await unidadeMedidaService.codigoExiste(
      formData.codigo,
      empresaId,
      filialId,
      editingId ?? undefined
    );
    if (dup) {
      setError("codigo", { message: "Código já cadastrado" });
      return;
    }
    setSaving(true);
    try {
      await unidadeMedidaService.salvar(
        { id: editingId ?? undefined, ...formData },
        { grupoId: grupoAtual.id, empresaId, filialId }
      );
      toast({
        title: editingId ? "Unidade atualizada" : "Unidade criada",
        description: `"${formData.codigo} - ${formData.descricao}" salva com sucesso.`,
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
    const emUso = await unidadeMedidaService.estaEmUso(deleteTarget.id);
    if (emUso) {
      toast({
        title: "Não é possível excluir",
        description: "Esta unidade está sendo utilizada em produtos.",
        variant: "destructive",
      });
      setDeleteTarget(null);
      return;
    }
    await unidadeMedidaService.excluir(deleteTarget.id);
    toast({
      title: "Unidade excluída",
      description: `"${deleteTarget.codigo}" foi removida.`,
    });
    setDeleteTarget(null);
    loadData();
  };

  if (!empresaId || !filialId) {
    return (
      <>
        <PageHeader title="Unidades de Medida" description="Gerencie as unidades de medida" />
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Selecione uma Empresa e Filial para visualizar os registros.
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Unidades de Medida" description="Gerencie as unidades de medida" />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchPlaceholder="Buscar por código ou descrição..."
        onNew={openNew}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      <CrudModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar Unidade de Medida" : "Nova Unidade de Medida"}
        saving={saving}
        onSave={onSave}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="codigo">
                Código <span className="text-destructive">*</span>
              </Label>
              <Input id="codigo" maxLength={10} {...register("codigo")} />
              {errors.codigo && (
                <p className="text-xs text-destructive">{errors.codigo.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descricao">
                Descrição <span className="text-destructive">*</span>
              </Label>
              <Input id="descricao" maxLength={100} {...register("descricao")} />
              {errors.descricao && (
                <p className="text-xs text-destructive">{errors.descricao.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>
                Tipo <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("tipo")}
                onValueChange={(v) => setValue("tipo", v as TipoUnidadeMedida)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PESO">Peso</SelectItem>
                  <SelectItem value="VOLUME">Volume</SelectItem>
                  <SelectItem value="UNIDADE">Unidade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fatorBase">
                Fator Base <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fatorBase"
                type="number"
                step="0.000001"
                min="0"
                {...register("fatorBase")}
              />
              {errors.fatorBase && (
                <p className="text-xs text-destructive">{errors.fatorBase.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="ativo"
              checked={ativoValue}
              onCheckedChange={(v) => setValue("ativo", v)}
            />
            <Label htmlFor="ativo">Ativo</Label>
          </div>
        </div>
      </CrudModal>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente excluir a unidade "{deleteTarget?.codigo} - {deleteTarget?.descricao}"?
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
