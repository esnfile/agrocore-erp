import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { CrudModal } from "@/components/CrudModal";
import { grupoPessoaService } from "@/lib/services";
import { useOrganization } from "@/contexts/OrganizationContext";
import type { GrupoPessoa } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
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
  descGrupoPessoa: z.string().min(1, "Obrigatório").max(50, "Máximo 50 caracteres"),
  ativo: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function GrupoPessoasPage() {
  const { grupoAtual, empresaAtual, filialAtual } = useOrganization();
  const [data, setData] = useState<GrupoPessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GrupoPessoa | null>(null);

  // Filtros
  const [filtroDesc, setFiltroDesc] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const columns: Column<GrupoPessoa>[] = [
    { key: "descGrupoPessoa", header: "Descrição" },
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

  const loadData = async () => {
    if (!empresaAtual || !filialAtual) return;
    setLoading(true);
    let list = await grupoPessoaService.listar(empresaAtual.id, filialAtual.id);
    if (filtroDesc) {
      const term = filtroDesc.toLowerCase();
      list = list.filter((gp) => gp.descGrupoPessoa.toLowerCase().includes(term));
    }
    if (filtroStatus) {
      const isAtivo = filtroStatus === "ativo";
      list = list.filter((gp) => gp.ativo === isAtivo);
    }
    setData(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [empresaAtual, filialAtual]);

  const handleFiltrar = () => loadData();
  const handleLimpar = () => {
    setFiltroDesc("");
    setFiltroStatus("");
    loadData();
  };

  const openNew = () => {
    setEditingId(null);
    reset({ descGrupoPessoa: "", ativo: true });
    setModalOpen(true);
  };

  const openEdit = (row: GrupoPessoa) => {
    setEditingId(row.id);
    reset({ descGrupoPessoa: row.descGrupoPessoa, ativo: row.ativo });
    setModalOpen(true);
  };

  const onSave = handleSubmit(async (formData) => {
    if (!grupoAtual || !empresaAtual || !filialAtual) return;
    const duplicado = await grupoPessoaService.nomeExiste(
      formData.descGrupoPessoa,
      empresaAtual.id,
      filialAtual.id,
      editingId ?? undefined
    );
    if (duplicado) {
      toast({
        title: "Nome duplicado",
        description: "Já existe um grupo de pessoas com esta descrição.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      await grupoPessoaService.salvar(
        { ...formData, id: editingId ?? undefined },
        { grupoId: grupoAtual.id, empresaId: empresaAtual.id, filialId: filialAtual.id }
      );
      toast({
        title: editingId ? "Grupo atualizado" : "Grupo criado",
        description: `${formData.descGrupoPessoa.trim()} salvo com sucesso.`,
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
    const temPessoas = await grupoPessoaService.possuiPessoas(deleteTarget.id);
    if (temPessoas) {
      toast({
        title: "Exclusão bloqueada",
        description: "Não é possível excluir um grupo que possui pessoas vinculadas.",
        variant: "destructive",
      });
      setDeleteTarget(null);
      return;
    }
    await grupoPessoaService.excluir(deleteTarget.id);
    toast({ title: "Grupo excluído", description: `${deleteTarget.descGrupoPessoa} foi removido.` });
    setDeleteTarget(null);
    loadData();
  };

  return (
    <>
      <PageHeader title="Grupo de Pessoas" description="Gerencie os grupos de pessoas" />

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Descrição</Label>
          <Input
            className="w-[220px]"
            placeholder="Buscar..."
            value={filtroDesc}
            onChange={(e) => setFiltroDesc(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={handleFiltrar}>
          <Search className="mr-1 h-4 w-4" /> Filtrar
        </Button>
        <Button size="sm" variant="outline" onClick={handleLimpar}>
          <X className="mr-1 h-4 w-4" /> Limpar
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchPlaceholder="Buscar grupo de pessoas..."
        onNew={openNew}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      <CrudModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar Grupo de Pessoas" : "Novo Grupo de Pessoas"}
        saving={saving}
        onSave={onSave}
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="descGrupoPessoa">
              Descrição <span className="text-destructive">*</span>
            </Label>
            <Input id="descGrupoPessoa" maxLength={50} {...register("descGrupoPessoa")} />
            {errors.descGrupoPessoa && (
              <p className="text-xs text-destructive">{errors.descGrupoPessoa.message}</p>
            )}
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente excluir este grupo de pessoas? Esta ação não poderá ser desfeita.
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
