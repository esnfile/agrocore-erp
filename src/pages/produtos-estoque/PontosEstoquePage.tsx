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
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useOrganization } from "@/contexts/OrganizationContext";
import { pontoEstoqueService } from "@/lib/services";
import type { PontoEstoque } from "@/lib/mock-data";

const schema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória").max(150, "Máximo 150 caracteres").transform((v) => v.trim()),
  tipo: z.enum(["PROPRIO", "TERCEIRO"]),
  principal: z.boolean(),
  ativo: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function PontosEstoquePage() {
  const { grupoAtual, empresaAtual, filialAtual } = useOrganization();
  const selectedGrupo = grupoAtual?.id ?? null;
  const selectedEmpresa = empresaAtual?.id ?? null;
  const selectedFilial = filialAtual?.id ?? null;

  const [data, setData] = useState<PontoEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PontoEstoque | null>(null);

  const { register, handleSubmit, reset, setError, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const ativoValue = watch("ativo");
  const principalValue = watch("principal");
  const tipoValue = watch("tipo");

  const columns: Column<PontoEstoque>[] = [
    { key: "descricao", header: "Descrição" },
    {
      key: "tipo", header: "Tipo",
      render: (row) => <Badge variant="outline">{row.tipo === "PROPRIO" ? "Próprio" : "Terceiro"}</Badge>,
    },
    {
      key: "principal", header: "Principal",
      render: (row) => row.principal ? <Badge>Sim</Badge> : <Badge variant="secondary">Não</Badge>,
    },
    {
      key: "ativo", header: "Status",
      render: (row) => <Badge variant={row.ativo ? "default" : "secondary"}>{row.ativo ? "Ativo" : "Inativo"}</Badge>,
    },
    {
      key: "criadoEm", header: "Criado em",
      render: (row) => format(new Date(row.criadoEm), "dd/MM/yyyy HH:mm"),
    },
  ];

  const loadData = () => {
    if (!selectedEmpresa || !selectedFilial) { setData([]); setLoading(false); return; }
    setLoading(true);
    pontoEstoqueService.listar(selectedEmpresa, selectedFilial).then((list) => { setData(list); setLoading(false); });
  };

  useEffect(() => { loadData(); }, [selectedEmpresa, selectedFilial]);

  const openNew = () => {
    setEditingId(null);
    reset({ descricao: "", tipo: "PROPRIO", principal: false, ativo: true });
    setModalOpen(true);
  };

  const openEdit = (row: PontoEstoque) => {
    setEditingId(row.id);
    reset({ descricao: row.descricao, tipo: row.tipo, principal: row.principal, ativo: row.ativo });
    setModalOpen(true);
  };

  const onSave = handleSubmit(async (formData) => {
    if (!selectedGrupo || !selectedEmpresa || !selectedFilial) {
      toast({ title: "Erro", description: "Selecione Grupo, Empresa e Filial.", variant: "destructive" });
      return;
    }
    const dup = await pontoEstoqueService.descricaoExiste(formData.descricao, selectedEmpresa, selectedFilial, editingId ?? undefined);
    if (dup) { setError("descricao", { message: "Já existe um ponto de estoque com esta descrição" }); return; }

    setSaving(true);
    try {
      await pontoEstoqueService.salvar(
        { id: editingId ?? undefined, ...formData } as any,
        { grupoId: selectedGrupo, empresaId: selectedEmpresa, filialId: selectedFilial }
      );
      toast({ title: editingId ? "Ponto atualizado" : "Ponto criado", description: `"${formData.descricao}" salvo com sucesso.` });
      setModalOpen(false);
      loadData();
    } catch {
      toast({ title: "Erro", description: "Não foi possível salvar.", variant: "destructive" });
    } finally { setSaving(false); }
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await pontoEstoqueService.excluir(deleteTarget.id);
    toast({ title: "Ponto excluído", description: `"${deleteTarget.descricao}" foi removido.` });
    setDeleteTarget(null);
    loadData();
  };

  if (!selectedEmpresa || !selectedFilial) {
    return (
      <>
        <PageHeader title="Pontos de Estoque" description="Gerenciamento de pontos de armazenamento" />
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Selecione uma Empresa e Filial para visualizar os registros.
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Pontos de Estoque" description="Gerenciamento de pontos de armazenamento" />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchPlaceholder="Buscar por descrição..."
        onNew={openNew}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Editar Ponto de Estoque" : "Novo Ponto de Estoque"} saving={saving} onSave={onSave}>
        <div className="space-y-4" style={{ maxWidth: 600 }}>
          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição <span className="text-destructive">*</span></Label>
            <Input id="descricao" maxLength={150} {...register("descricao")} />
            {errors.descricao && <p className="text-xs text-destructive">{errors.descricao.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Tipo <span className="text-destructive">*</span></Label>
            <Select value={tipoValue} onValueChange={(v) => setValue("tipo", v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PROPRIO">Próprio</SelectItem>
                <SelectItem value="TERCEIRO">Terceiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Switch id="principal" checked={principalValue} onCheckedChange={(v) => setValue("principal", v)} />
            <Label htmlFor="principal">Ponto principal</Label>
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
            <AlertDialogDescription>Deseja realmente excluir este ponto de estoque?</AlertDialogDescription>
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
