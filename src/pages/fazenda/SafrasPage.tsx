import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { CrudModal } from "@/components/CrudModal";
import { useOrganization } from "@/contexts/OrganizationContext";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { empresas, filiais } from "@/lib/mock-data";

// ---- Interfaces & Mock ----
export interface Safra {
  id: string;
  empresaId: string;
  filialId: string;
  nome: string;
  descricao: string;
  anoSafra: string;
  dataInicio: string;
  dataFim: string;
  areaTotalHa: number;
  status: "Planejada" | "Em Andamento" | "Finalizada" | "Cancelada";
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

const mockSafras: Safra[] = [
  {
    id: "saf1", empresaId: "e1", filialId: "f1", nome: "Safra 2024/2025",
    descricao: "Safra principal de verão — soja e milho", anoSafra: "2024/2025",
    dataInicio: "2024-09-15", dataFim: "2025-03-30", areaTotalHa: 1200,
    status: "Em Andamento",
    criadoEm: "2024-08-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-09-15T10:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "saf2", empresaId: "e1", filialId: "f2", nome: "Safra 2023/2024",
    descricao: "Safra encerrada — soja", anoSafra: "2023/2024",
    dataInicio: "2023-09-10", dataFim: "2024-03-20", areaTotalHa: 800,
    status: "Finalizada",
    criadoEm: "2023-07-20T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-04-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "saf3", empresaId: "e2", filialId: "f3", nome: "Safra 2025/2026",
    descricao: "Planejamento da próxima safra", anoSafra: "2025/2026",
    dataInicio: "2025-09-01", dataFim: "2026-03-31", areaTotalHa: 950,
    status: "Planejada",
    criadoEm: "2025-01-10T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-10T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "saf4", empresaId: "e1", filialId: "f1", nome: "Safrinha 2025",
    descricao: "Milho segunda safra", anoSafra: "2024/2025",
    dataInicio: "2025-02-01", dataFim: "2025-07-15", areaTotalHa: 600,
    status: "Em Andamento",
    criadoEm: "2025-01-15T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-02-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

// ---- Schema ----
const schema = z.object({
  empresaId: z.string().min(1, "Selecione uma empresa"),
  filialId: z.string().min(1, "Selecione uma filial"),
  nome: z.string().min(3, "Mínimo 3 caracteres").max(200),
  descricao: z.string().optional(),
  anoSafra: z.string().min(1, "Informe o ano/safra"),
  dataInicio: z.string().min(1, "Informe a data de início"),
  dataFim: z.string().min(1, "Informe a data de fim"),
  areaTotalHa: z.coerce.number().min(0.01, "Área deve ser maior que 0"),
  status: z.enum(["Planejada", "Em Andamento", "Finalizada", "Cancelada"]),
});

type FormData = z.infer<typeof schema>;

const STATUS_OPTIONS = ["Planejada", "Em Andamento", "Finalizada", "Cancelada"] as const;
const ANO_OPTIONS = ["2023/2024", "2024/2025", "2025/2026"];

const statusColor = (s: string) => {
  switch (s) {
    case "Em Andamento": return "default";
    case "Finalizada": return "secondary";
    case "Planejada": return "outline";
    case "Cancelada": return "destructive";
    default: return "secondary";
  }
};

export default function SafrasPage() {
  const [data, setData] = useState<Safra[]>(mockSafras);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Safra | null>(null);
  const { empresaAtual, filialAtual } = useOrganization();

  // Filters
  const [filtroAno, setFiltroAno] = useState<string>("all");
  const [filtroStatus, setFiltroStatus] = useState<string>("all");
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>("all");
  const [filtroFilial, setFiltroFilial] = useState<string>("all");

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const watchEmpresaId = watch("empresaId");
  const filiaisFiltradas = useMemo(() => filiais.filter((f) => f.empresaId === watchEmpresaId), [watchEmpresaId]);

  const filtered = useMemo(() => {
    return data.filter((s) => {
      if (filtroAno !== "all" && s.anoSafra !== filtroAno) return false;
      if (filtroStatus !== "all" && s.status !== filtroStatus) return false;
      if (filtroEmpresa !== "all" && s.empresaId !== filtroEmpresa) return false;
      if (filtroFilial !== "all" && s.filialId !== filtroFilial) return false;
      return true;
    });
  }, [data, filtroAno, filtroStatus, filtroEmpresa, filtroFilial]);

  const columns: Column<Safra>[] = [
    { key: "nome", header: "Safra" },
    { key: "anoSafra", header: "Ano/Safra" },
    { key: "dataInicio", header: "Início", render: (r) => new Date(r.dataInicio).toLocaleDateString("pt-BR") },
    { key: "dataFim", header: "Fim", render: (r) => new Date(r.dataFim).toLocaleDateString("pt-BR") },
    {
      key: "empresaId", header: "Empresa",
      render: (r) => empresas.find((e) => e.id === r.empresaId)?.nome ?? "—",
    },
    {
      key: "filialId", header: "Filial",
      render: (r) => filiais.find((f) => f.id === r.filialId)?.nomeRazao ?? "—",
    },
    { key: "areaTotalHa", header: "Área (ha)", render: (r) => r.areaTotalHa.toLocaleString("pt-BR") },
    {
      key: "status", header: "Status",
      render: (r) => <Badge variant={statusColor(r.status) as any}>{r.status}</Badge>,
    },
  ];

  const openNew = () => {
    setEditingId(null);
    reset({
      empresaId: empresaAtual?.id ?? "",
      filialId: filialAtual?.id ?? "",
      nome: "", descricao: "", anoSafra: "2024/2025",
      dataInicio: "", dataFim: "", areaTotalHa: 0,
      status: "Planejada",
    });
    setModalOpen(true);
  };

  const openEdit = (row: Safra) => {
    setEditingId(row.id);
    reset({
      empresaId: row.empresaId, filialId: row.filialId,
      nome: row.nome, descricao: row.descricao, anoSafra: row.anoSafra,
      dataInicio: row.dataInicio, dataFim: row.dataFim,
      areaTotalHa: row.areaTotalHa, status: row.status,
    });
    setModalOpen(true);
  };

  const onSave = handleSubmit(async (formData) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    if (editingId) {
      setData((prev) => prev.map((s) => s.id === editingId ? { ...s, ...formData, atualizadoEm: new Date().toISOString(), atualizadoPor: "u1" } as Safra : s));
      toast({ title: "Safra atualizada", description: `${formData.nome} salva com sucesso.` });
    } else {
      const nova: Safra = {
        ...formData, id: `saf${Date.now()}`, descricao: formData.descricao ?? "",
        criadoEm: new Date().toISOString(), criadoPor: "u1",
        atualizadoEm: new Date().toISOString(), atualizadoPor: "u1",
        deletadoEm: null, deletadoPor: null,
      };
      setData((prev) => [...prev, nova]);
      toast({ title: "Safra criada", description: `${formData.nome} adicionada com sucesso.` });
    }
    setSaving(false);
    setModalOpen(false);
  });

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setData((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    toast({ title: "Safra excluída", description: `${deleteTarget.nome} foi removida.` });
    setDeleteTarget(null);
  };

  return (
    <>
      <PageHeader title="Gestão de Safras" description="Cadastro e acompanhamento das safras agrícolas" />

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select value={filtroAno} onValueChange={setFiltroAno}>
          <SelectTrigger><SelectValue placeholder="Ano/Safra" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os anos</SelectItem>
            {ANO_OPTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroEmpresa} onValueChange={(v) => { setFiltroEmpresa(v); setFiltroFilial("all"); }}>
          <SelectTrigger><SelectValue placeholder="Empresa" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {empresas.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroFilial} onValueChange={setFiltroFilial}>
          <SelectTrigger><SelectValue placeholder="Filial" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as filiais</SelectItem>
            {filiais.filter((f) => filtroEmpresa === "all" || f.empresaId === filtroEmpresa).map((f) => (
              <SelectItem key={f.id} value={f.id}>{f.nomeRazao}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={false}
        searchPlaceholder="Buscar safra..."
        onNew={openNew}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      {/* Modal CRUD */}
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Editar Safra" : "Nova Safra"} saving={saving} onSave={onSave}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Empresa <span className="text-destructive">*</span></Label>
            <Controller name="empresaId" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {empresas.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {errors.empresaId && <p className="text-xs text-destructive">{errors.empresaId.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Filial <span className="text-destructive">*</span></Label>
            <Controller name="filialId" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {filiaisFiltradas.map((f) => <SelectItem key={f.id} value={f.id}>{f.nomeRazao}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {errors.filialId && <p className="text-xs text-destructive">{errors.filialId.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Status <span className="text-destructive">*</span></Label>
            <Controller name="status" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
            <Label>Nome da Safra <span className="text-destructive">*</span></Label>
            <Input maxLength={200} {...register("nome")} />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Ano/Safra <span className="text-destructive">*</span></Label>
            <Controller name="anoSafra" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ANO_OPTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {errors.anoSafra && <p className="text-xs text-destructive">{errors.anoSafra.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Data Início <span className="text-destructive">*</span></Label>
            <Input type="date" {...register("dataInicio")} />
            {errors.dataInicio && <p className="text-xs text-destructive">{errors.dataInicio.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Data Fim <span className="text-destructive">*</span></Label>
            <Input type="date" {...register("dataFim")} />
            {errors.dataFim && <p className="text-xs text-destructive">{errors.dataFim.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Área Total (ha) <span className="text-destructive">*</span></Label>
            <Input type="number" step="0.01" {...register("areaTotalHa")} />
            {errors.areaTotalHa && <p className="text-xs text-destructive">{errors.areaTotalHa.message}</p>}
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label>Descrição</Label>
            <Textarea rows={2} {...register("descricao")} />
          </div>
        </div>
      </CrudModal>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Deseja realmente excluir a safra "{deleteTarget?.nome}"?</AlertDialogDescription>
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
