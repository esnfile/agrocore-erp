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
import { veiculoService } from "@/lib/services";
import type { Veiculo } from "@/lib/mock-data";

const schema = z.object({
  placa: z.string().min(1, "Placa é obrigatória").max(10).transform((v) => v.trim().toUpperCase()),
  tipoVeiculo: z.string().max(50).optional().default(""),
  transportadora: z.string().max(200).optional().default(""),
  ativo: z.boolean(),
});
type FormData = z.infer<typeof schema>;

const columns: Column<Veiculo>[] = [
  { key: "placa", header: "Placa", render: (row) => row.placa },
  { key: "tipoVeiculo", header: "Tipo", render: (row) => row.tipoVeiculo || "—" },
  { key: "transportadora", header: "Transportadora", render: (row) => row.transportadora || "—" },
  { key: "ativo", header: "Status", render: (row) => <Badge variant={row.ativo ? "default" : "secondary"}>{row.ativo ? "Ativo" : "Inativo"}</Badge> },
  { key: "criadoEm", header: "Criado em", render: (row) => format(new Date(row.criadoEm), "dd/MM/yyyy HH:mm") },
];

export default function VeiculosPage() {
  const { empresaAtual, filialAtual, grupoAtual } = useOrganization();
  const [items, setItems] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Veiculo | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { placa: "", tipoVeiculo: "", transportadora: "", ativo: true } });

  const load = async () => {
    if (!empresaAtual || !filialAtual) return;
    setLoading(true);
    const data = await veiculoService.listar(empresaAtual.id, filialAtual.id);
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [empresaAtual, filialAtual]);

  const openNew = () => { setEditing(null); form.reset({ placa: "", tipoVeiculo: "", transportadora: "", ativo: true }); setModalOpen(true); };
  const openEdit = (item: Veiculo) => { setEditing(item); form.reset({ placa: item.placa, tipoVeiculo: item.tipoVeiculo, transportadora: item.transportadora, ativo: item.ativo }); setModalOpen(true); };

  const onSubmit = async () => {
    const valid = await form.trigger();
    if (!valid || !grupoAtual || !empresaAtual || !filialAtual) return;
    const data = form.getValues();
    setSaving(true);
    await veiculoService.salvar({ ...data, id: editing?.id }, { grupoId: grupoAtual.id, empresaId: empresaAtual.id, filialId: filialAtual.id });
    toast({ title: editing ? "Veículo atualizado" : "Veículo cadastrado" });
    setSaving(false);
    setModalOpen(false);
    load();
  };

  const onDelete = async () => {
    if (!deleteId) return;
    await veiculoService.excluir(deleteId);
    toast({ title: "Veículo excluído" });
    setDeleteId(null);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Veículos" description="Cadastro de veículos para romaneios" />
      <DataTable columns={columns} data={items} loading={loading} onNew={openNew} onEdit={openEdit} onDelete={(item) => setDeleteId(item.id)} />
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Veículo" : "Novo Veículo"} saving={saving} onSave={onSubmit}>
        <div className="space-y-4">
          <div><Label>Placa *</Label><Input {...form.register("placa")} />{form.formState.errors.placa && <p className="text-sm text-destructive mt-1">{form.formState.errors.placa.message}</p>}</div>
          <div><Label>Tipo de Veículo</Label><Input {...form.register("tipoVeiculo")} placeholder="Ex: Carreta, Truck, Bi-trem" /></div>
          <div><Label>Transportadora</Label><Input {...form.register("transportadora")} /></div>
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
