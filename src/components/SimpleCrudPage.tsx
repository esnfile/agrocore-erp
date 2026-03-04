import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  descricao: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(150, "Máximo 150 caracteres")
    .transform((v) => v.trim()),
  ativo: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface SimpleEntity {
  id: string;
  descricao: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
  [key: string]: any;
}

interface SimpleCrudService<T> {
  listar(empresaId: string, filialId: string): Promise<T[]>;
  descricaoExiste(descricao: string, empresaId: string, filialId: string, excludeId?: string): Promise<boolean>;
  salvar(data: Partial<T>, ctx: { grupoId: string; empresaId: string; filialId: string }): Promise<T>;
  excluir(id: string): Promise<void>;
}

interface SimpleCrudPageProps<T extends SimpleEntity> {
  title: string;
  description: string;
  entityName: string;
  service: SimpleCrudService<T>;
  extraColumns?: Column<T>[];
  renderExtraFields?: (props: {
    register: any;
    errors: any;
    setValue: any;
    watch: any;
  }) => React.ReactNode;
  getExtraData?: (row: T) => Partial<T>;
  extraDefaultValues?: Record<string, any>;
  extraSchema?: z.ZodTypeAny;
}

export function SimpleCrudPage<T extends SimpleEntity>({
  title,
  description,
  entityName,
  service,
  extraColumns = [],
  renderExtraFields,
  getExtraData,
  extraDefaultValues = {},
  extraSchema,
}: SimpleCrudPageProps<T>) {
  const { grupoAtual, empresaAtual, filialAtual } = useOrganization();
  const selectedGrupo = grupoAtual?.id ?? null;
  const selectedEmpresa = empresaAtual?.id ?? null;
  const selectedFilial = filialAtual?.id ?? null;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);

  const mergedSchema = extraSchema
    ? z.intersection(schema, extraSchema as z.ZodTypeAny)
    : schema;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData & Record<string, any>>({
    resolver: zodResolver(mergedSchema as any),
  });

  const ativoValue = watch("ativo");

  const baseColumns: Column<T>[] = [
    { key: "descricao", header: "Descrição" },
    ...extraColumns,
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
    {
      key: "atualizadoEm",
      header: "Atualizado em",
      render: (row) => format(new Date(row.atualizadoEm), "dd/MM/yyyy HH:mm"),
    },
  ];

  const loadData = () => {
    if (!selectedEmpresa || !selectedFilial) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    service.listar(selectedEmpresa, selectedFilial).then((list) => {
      setData(list);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [selectedEmpresa, selectedFilial]);

  const openNew = () => {
    setEditingId(null);
    reset({ descricao: "", ativo: true, ...extraDefaultValues });
    setModalOpen(true);
  };

  const openEdit = (row: T) => {
    setEditingId(row.id);
    const extraData = getExtraData ? getExtraData(row) : {};
    reset({ descricao: row.descricao, ativo: row.ativo, ...extraData });
    setModalOpen(true);
  };

  const onSave = handleSubmit(async (formData) => {
    if (!selectedGrupo || !selectedEmpresa || !selectedFilial) {
      toast({ title: "Erro", description: "Selecione Grupo, Empresa e Filial.", variant: "destructive" });
      return;
    }

    const duplicado = await service.descricaoExiste(
      formData.descricao,
      selectedEmpresa,
      selectedFilial,
      editingId ?? undefined
    );
    if (duplicado) {
      setError("descricao", { message: `Já existe ${entityName} com esta descrição` });
      return;
    }

    setSaving(true);
    try {
      await service.salvar(
        { id: editingId ?? undefined, ...formData } as any,
        { grupoId: selectedGrupo, empresaId: selectedEmpresa, filialId: selectedFilial }
      );
      toast({
        title: editingId ? `${entityName} atualizado` : `${entityName} criado`,
        description: `"${formData.descricao}" salvo com sucesso.`,
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
    await service.excluir(deleteTarget.id);
    toast({ title: `${entityName} excluído`, description: `"${deleteTarget.descricao}" foi removido.` });
    setDeleteTarget(null);
    loadData();
  };

  if (!selectedEmpresa || !selectedFilial) {
    return (
      <>
        <PageHeader title={title} description={description} />
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Selecione uma Empresa e Filial para visualizar os registros.
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={title} description={description} />
      <DataTable
        columns={baseColumns}
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
        title={editingId ? `Editar ${entityName}` : `Novo ${entityName}`}
        saving={saving}
        onSave={onSave}
      >
        <div className="space-y-4" style={{ maxWidth: 600 }}>
          <div className="space-y-1.5">
            <Label htmlFor="descricao">
              Descrição <span className="text-destructive">*</span>
            </Label>
            <Input id="descricao" maxLength={150} {...register("descricao")} />
            {errors.descricao && (
              <p className="text-xs text-destructive">{(errors.descricao as any).message}</p>
            )}
          </div>

          {renderExtraFields && renderExtraFields({ register, errors, setValue, watch })}

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
              Deseja realmente excluir este registro? Esta ação não poderá ser desfeita.
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
