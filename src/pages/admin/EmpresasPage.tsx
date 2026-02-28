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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

// ---- Máscaras ----
function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

const schema = z.object({
  grupoId: z.string().min(1, "Selecione um grupo"),
  tipoPessoa: z.enum(["PF", "PJ"]),
  razaoSocial: z.string().min(3, "Mínimo 3 caracteres"),
  nomeFantasia: z.string().min(2, "Mínimo 2 caracteres"),
  cpfCnpj: z.string().min(1, "Obrigatório"),
  inscricaoEstadual: z.string().optional(),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().optional(),
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
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const tipoPessoa = watch("tipoPessoa") ?? "PJ";

  const columns: Column<Empresa>[] = [
    {
      key: "grupoId",
      header: "Grupo",
      render: (row) => {
        const g = grupos.find((g) => g.id === row.grupoId);
        return g?.nome ?? row.grupoId;
      },
    },
    { key: "nomeFantasia", header: "Nome Fantasia" },
    { key: "razaoSocial", header: "Nome/Razão Social" },
    { key: "cpfCnpj", header: "CPF/CNPJ" },
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
      tipoPessoa: "PJ",
      razaoSocial: "",
      nomeFantasia: "",
      cpfCnpj: "",
      inscricaoEstadual: "",
      email: "",
      telefone: "",
    });
    setModalOpen(true);
  };

  const openEdit = (row: Empresa) => {
    setEditingId(row.id);
    reset({
      grupoId: row.grupoId,
      tipoPessoa: row.tipoPessoa,
      razaoSocial: row.razaoSocial,
      nomeFantasia: row.nomeFantasia,
      cpfCnpj: row.cpfCnpj,
      inscricaoEstadual: row.inscricaoEstadual,
      email: row.email,
      telefone: row.telefone,
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
    toast({ title: "Empresa excluída", description: `${deleteTarget.nomeFantasia} foi removida.` });
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
          <div className="space-y-1.5 sm:col-span-2">
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

          {/* Tipo Pessoa */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Tipo de Pessoa</Label>
            <Controller
              name="tipoPessoa"
              control={control}
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="PJ" id="pj" />
                    <Label htmlFor="pj" className="font-normal cursor-pointer">Pessoa Jurídica</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="PF" id="pf" />
                    <Label htmlFor="pf" className="font-normal cursor-pointer">Pessoa Física</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          {/* Razão Social / Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="razaoSocial">
              {tipoPessoa === "PF" ? "Nome" : "Razão Social"} <span className="text-destructive">*</span>
            </Label>
            <Input id="razaoSocial" {...register("razaoSocial")} />
            {errors.razaoSocial && <p className="text-xs text-destructive">{errors.razaoSocial.message}</p>}
          </div>

          {/* Nome Fantasia */}
          <div className="space-y-1.5">
            <Label htmlFor="nomeFantasia">Nome Fantasia <span className="text-destructive">*</span></Label>
            <Input id="nomeFantasia" {...register("nomeFantasia")} />
            {errors.nomeFantasia && <p className="text-xs text-destructive">{errors.nomeFantasia.message}</p>}
          </div>

          {/* CPF/CNPJ com máscara */}
          <div className="space-y-1.5">
            <Label htmlFor="cpfCnpj">
              {tipoPessoa === "PF" ? "CPF" : "CNPJ"} <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="cpfCnpj"
              control={control}
              render={({ field }) => (
                <Input
                  id="cpfCnpj"
                  value={field.value}
                  onChange={(e) => {
                    const masked = tipoPessoa === "PF" ? maskCPF(e.target.value) : maskCNPJ(e.target.value);
                    field.onChange(masked);
                  }}
                  placeholder={tipoPessoa === "PF" ? "000.000.000-00" : "00.000.000/0000-00"}
                />
              )}
            />
            {errors.cpfCnpj && <p className="text-xs text-destructive">{errors.cpfCnpj.message}</p>}
          </div>

          {/* Inscrição Estadual */}
          <div className="space-y-1.5">
            <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
            <Input id="inscricaoEstadual" {...register("inscricaoEstadual")} />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail <span className="text-destructive">*</span></Label>
            <Input id="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          {/* Telefone */}
          <div className="space-y-1.5">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" {...register("telefone")} />
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
