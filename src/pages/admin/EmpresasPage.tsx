import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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

const schema = z.object({
  razaoSocial: z.string().min(3, "Mínimo 3 caracteres"),
  nomeFantasia: z.string().min(2, "Mínimo 2 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  inscricaoEstadual: z.string().optional(),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const columns: Column<Empresa>[] = [
  { key: "nomeFantasia", header: "Nome Fantasia" },
  { key: "razaoSocial", header: "Razão Social" },
  { key: "cnpj", header: "CNPJ" },
  { key: "email", header: "E-mail" },
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

const fields: { name: keyof FormData; label: string; required?: boolean }[] = [
  { name: "razaoSocial", label: "Razão Social", required: true },
  { name: "nomeFantasia", label: "Nome Fantasia", required: true },
  { name: "cnpj", label: "CNPJ", required: true },
  { name: "inscricaoEstadual", label: "Inscrição Estadual" },
  { name: "email", label: "E-mail", required: true },
  { name: "telefone", label: "Telefone" },
];

export default function EmpresasPage() {
  const [data, setData] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { grupoAtual } = useOrganization();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

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
    reset({ razaoSocial: "", nomeFantasia: "", cnpj: "", inscricaoEstadual: "", email: "", telefone: "" });
    setModalOpen(true);
  };

  const openEdit = (row: Empresa) => {
    setEditingId(row.id);
    reset(row);
    setModalOpen(true);
  };

  const onSave = handleSubmit(async (formData) => {
    setSaving(true);
    try {
      await empresaService.salvar({
        ...formData,
        id: editingId ?? undefined,
        grupoId: grupoAtual?.id ?? "g1",
      });
      toast({
        title: editingId ? "Empresa atualizada" : "Empresa criada",
        description: `${formData.nomeFantasia} salva com sucesso.`,
      });
      setModalOpen(false);
      loadData();
    } catch {
      toast({ title: "Erro", description: "Não foi possível salvar.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  });

  const handleDelete = async (row: Empresa) => {
    await empresaService.excluir(row.id);
    setData((prev) => prev.filter((e) => e.id !== row.id));
    toast({ title: "Empresa excluída", description: `${row.nomeFantasia} foi desativada.` });
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
        onDelete={handleDelete}
      />
      <CrudModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar Empresa" : "Nova Empresa"}
        saving={saving}
        onSave={onSave}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <Label htmlFor={f.name}>
                {f.label}
                {f.required && <span className="text-destructive ml-0.5">*</span>}
              </Label>
              <Input id={f.name} {...register(f.name)} />
              {errors[f.name] && (
                <p className="text-xs text-destructive">{errors[f.name]?.message}</p>
              )}
            </div>
          ))}
        </div>
      </CrudModal>
    </>
  );
}
