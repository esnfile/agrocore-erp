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
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useOrganization } from "@/contexts/OrganizationContext";
import { motoristaService } from "@/lib/services";
import type { Motorista } from "@/lib/mock-data";

const schema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(200).transform((v) => v.trim()),
  documento: z.string().max(30).optional().default(""),
  telefone: z.string().max(20).optional().default(""),
  ativo: z.boolean(),
});
type FormData = z.infer<typeof schema>;

const columns: Column<Motorista>[] = [
  { key: "nome", header: "Nome", render: (row) => row.nome },
  { key: "documento", header: "Documento", render: (row) => row.documento || "—" },
  { key: "telefone", header: "Telefone", render: (row) => row.telefone || "—" },
  { key: "ativo", header: "Status", render: (row) => <Badge variant={row.ativo ? "default" : "secondary"}>{row.ativo ? "Ativo" : "Inativo"}</Badge> },
  { key: "criadoEm", header: "Criado em", render: (row) => format(new Date(row.criadoEm), "dd/MM/yyyy HH:mm") },
];

export default function MotoristasPage() {
  const { empresaAtual, filialAtual, grupoAtual } = useOrganization();
  const [items, setItems] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Motorista | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { nome: "", documento: "", telefone: "", ativo: true } });

  const load = async () => {
    if (!empresaAtual || !filialAtual) return;
    setLoading(true);
    const data = await motoristaService.listar(empresaAtual.id, filialAtual.id);
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [empresaAtual, filialAtual]);

  const openNew = () => { setEditing(null); form.reset({ nome: "", documento: "", telefone: "", ativo: true }); setModalOpen(true); };
  const openEdit = (item: Motorista) => { setEditing(item); form.reset({ nome: item.nome, documento: item.documento, telefone: item.telefone, ativo: item.ativo }); setModalOpen(true); };

  const onSubmit = async () => {
    const valid = await form.trigger();
    if (!valid || !grupoAtual || !empresaAtual || !filialAtual) return;
    const data = form.getValues();
    setSaving(true);
    await motoristaService.salvar({ ...data, id: editing?.id }, { grupoId: grupoAtual.id, empresaId: empresaAtual.id, filialId: filialAtual.id });
    toast({ title: editing ? "Motorista atualizado" : "Motorista cadastrado" });
    setSaving(false);
    setModalOpen(false);
    load();
  };

  const onDelete = async () => {
    if (!deleteId) return;
    await motoristaService.excluir(deleteId);
    toast({ title: "Motorista excluído" });
    setDeleteId(null);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Motoristas" description="Cadastro de motoristas para romaneios" />
      <DataTable columns={columns} data={items} loading={loading} onNew={openNew} onEdit={openEdit} onDelete={(item) => setDeleteId(item.id)} />
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Motorista" : "Novo Motorista"} saving={saving} onSave={onSubmit}>
        <div className="space-y-4">
          <div><Label>Nome *</Label><Input {...form.register("nome")} />{form.formState.errors.nome && <p className="text-sm text-destructive mt-1">{form.formState.errors.nome.message}</p>}</div>
          <div><Label>Documento</Label><Input {...form.register("documento")} /></div>
          <div><Label>Telefone</Label><Input {...form.register("telefone")} /></div>
          <div className="flex items-center gap-2"><Switch checked={form.watch("ativo")} onCheckedChange={(v) => form.setValue("ativo", v)} /><Label>Ativo</Label></div>
        </div>
      </CrudModal>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
