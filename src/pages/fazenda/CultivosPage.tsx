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

// ---- Interface & Mock ----
export interface Cultivo {
  id: string;
  safraId: string;
  safraNome: string;
  empresaId: string;
  filialId: string;
  produto: string;
  variedade: string;
  areaPlantadaHa: number;
  dataPlantio: string;
  dataColheitaPrevista: string;
  observacao: string;
  status: "Planejado" | "Plantado" | "Em Crescimento" | "Colhido" | "Cancelado";
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

const SAFRAS_REF = [
  { id: "saf1", nome: "Safra 2024/2025" },
  { id: "saf2", nome: "Safra 2023/2024" },
  { id: "saf3", nome: "Safra 2025/2026" },
  { id: "saf4", nome: "Safrinha 2025" },
];

const PRODUTOS_CULTURA = ["Soja", "Milho", "Trigo", "Algodão", "Café", "Cana-de-Açúcar"];

const mockCultivos: Cultivo[] = [
  {
    id: "cult1", safraId: "saf1", safraNome: "Safra 2024/2025",
    empresaId: "e1", filialId: "f1", produto: "Soja", variedade: "TMG 2381",
    areaPlantadaHa: 500, dataPlantio: "2024-10-01", dataColheitaPrevista: "2025-02-15",
    observacao: "", status: "Em Crescimento",
    criadoEm: "2024-09-20T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-10-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "cult2", safraId: "saf1", safraNome: "Safra 2024/2025",
    empresaId: "e1", filialId: "f1", produto: "Milho", variedade: "AG 9025",
    areaPlantadaHa: 300, dataPlantio: "2024-10-15", dataColheitaPrevista: "2025-03-10",
    observacao: "Milho safrinha após soja", status: "Plantado",
    criadoEm: "2024-10-10T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-10-15T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "cult3", safraId: "saf2", safraNome: "Safra 2023/2024",
    empresaId: "e1", filialId: "f2", produto: "Soja", variedade: "NS 7901",
    areaPlantadaHa: 800, dataPlantio: "2023-10-05", dataColheitaPrevista: "2024-02-20",
    observacao: "", status: "Colhido",
    criadoEm: "2023-09-15T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-03-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "cult4", safraId: "saf3", safraNome: "Safra 2025/2026",
    empresaId: "e2", filialId: "f3", produto: "Trigo", variedade: "BRS Pardela",
    areaPlantadaHa: 200, dataPlantio: "2025-05-01", dataColheitaPrevista: "2025-09-30",
    observacao: "Cultivo de inverno", status: "Planejado",
    criadoEm: "2025-01-15T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-15T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

const STATUS_OPTIONS = ["Planejado", "Plantado", "Em Crescimento", "Colhido", "Cancelado"] as const;

const schema = z.object({
  safraId: z.string().min(1, "Selecione uma safra"),
  empresaId: z.string().min(1, "Selecione uma empresa"),
  filialId: z.string().min(1, "Selecione uma filial"),
  produto: z.string().min(1, "Selecione um produto"),
  variedade: z.string().min(1, "Informe a variedade"),
  areaPlantadaHa: z.coerce.number().min(0.01, "Área deve ser maior que 0"),
  dataPlantio: z.string().min(1, "Informe a data de plantio"),
  dataColheitaPrevista: z.string().min(1, "Informe a data de colheita prevista"),
  observacao: z.string().optional(),
  status: z.enum(["Planejado", "Plantado", "Em Crescimento", "Colhido", "Cancelado"]),
});

type FormData = z.infer<typeof schema>;

const statusColor = (s: string) => {
  switch (s) {
    case "Em Crescimento": return "default";
    case "Colhido": return "secondary";
    case "Plantado": return "outline";
    case "Planejado": return "outline";
    case "Cancelado": return "destructive";
    default: return "secondary";
  }
};

export default function CultivosPage() {
  const [data, setData] = useState<Cultivo[]>(mockCultivos);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Cultivo | null>(null);
  const { empresaAtual, filialAtual } = useOrganization();

  const [filtroSafra, setFiltroSafra] = useState<string>("all");
  const [filtroProduto, setFiltroProduto] = useState<string>("all");
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>("all");
  const [filtroFilial, setFiltroFilial] = useState<string>("all");
  const [filtroStatus, setFiltroStatus] = useState<string>("all");

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const watchEmpresaId = watch("empresaId");
  const filiaisFiltradas = useMemo(() => filiais.filter((f) => f.empresaId === watchEmpresaId), [watchEmpresaId]);

  const filtered = useMemo(() => {
    return data.filter((c) => {
      if (filtroSafra !== "all" && c.safraId !== filtroSafra) return false;
      if (filtroProduto !== "all" && c.produto !== filtroProduto) return false;
      if (filtroEmpresa !== "all" && c.empresaId !== filtroEmpresa) return false;
      if (filtroFilial !== "all" && c.filialId !== filtroFilial) return false;
      if (filtroStatus !== "all" && c.status !== filtroStatus) return false;
      return true;
    });
  }, [data, filtroSafra, filtroProduto, filtroEmpresa, filtroFilial, filtroStatus]);

  const columns: Column<Cultivo>[] = [
    { key: "safraNome", header: "Safra" },
    { key: "produto", header: "Produto/Cultura" },
    { key: "variedade", header: "Variedade" },
    { key: "areaPlantadaHa", header: "Área (ha)", render: (r) => r.areaPlantadaHa.toLocaleString("pt-BR") },
    { key: "dataPlantio", header: "Data Plantio", render: (r) => new Date(r.dataPlantio).toLocaleDateString("pt-BR") },
    { key: "dataColheitaPrevista", header: "Colheita Prevista", render: (r) => new Date(r.dataColheitaPrevista).toLocaleDateString("pt-BR") },
    {
      key: "status", header: "Status",
      render: (r) => <Badge variant={statusColor(r.status) as any}>{r.status}</Badge>,
    },
  ];

  const openNew = () => {
    setEditingId(null);
    reset({
      safraId: "", empresaId: empresaAtual?.id ?? "", filialId: filialAtual?.id ?? "",
      produto: "", variedade: "", areaPlantadaHa: 0,
      dataPlantio: "", dataColheitaPrevista: "", observacao: "", status: "Planejado",
    });
    setModalOpen(true);
  };

  const openEdit = (row: Cultivo) => {
    setEditingId(row.id);
    reset({
      safraId: row.safraId, empresaId: row.empresaId, filialId: row.filialId,
      produto: row.produto, variedade: row.variedade, areaPlantadaHa: row.areaPlantadaHa,
      dataPlantio: row.dataPlantio, dataColheitaPrevista: row.dataColheitaPrevista,
      observacao: row.observacao, status: row.status,
    });
    setModalOpen(true);
  };

  const onSave = handleSubmit(async (formData) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const safraNome = SAFRAS_REF.find((s) => s.id === formData.safraId)?.nome ?? "";
    if (editingId) {
      setData((prev) => prev.map((c) => c.id === editingId ? { ...c, ...formData, safraNome, observacao: formData.observacao ?? "", atualizadoEm: new Date().toISOString(), atualizadoPor: "u1" } as Cultivo : c));
      toast({ title: "Cultivo atualizado", description: "Salvo com sucesso." });
    } else {
      const novo: Cultivo = {
        safraId: formData.safraId, empresaId: formData.empresaId, filialId: formData.filialId,
        produto: formData.produto, variedade: formData.variedade,
        areaPlantadaHa: formData.areaPlantadaHa, dataPlantio: formData.dataPlantio,
        dataColheitaPrevista: formData.dataColheitaPrevista, status: formData.status,
        id: `cult${Date.now()}`, safraNome, observacao: formData.observacao ?? "",
        criadoEm: new Date().toISOString(), criadoPor: "u1",
        atualizadoEm: new Date().toISOString(), atualizadoPor: "u1",
        deletadoEm: null, deletadoPor: null,
      };
      setData((prev) => [...prev, novo]);
      toast({ title: "Cultivo criado", description: "Adicionado com sucesso." });
    }
    setSaving(false);
    setModalOpen(false);
  });

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setData((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    toast({ title: "Cultivo excluído", description: `${deleteTarget.produto} — ${deleteTarget.variedade} removido.` });
    setDeleteTarget(null);
  };

  return (
    <>
      <PageHeader title="Cultivos" description="Cadastro e gestão dos cultivos vinculados às safras" />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select value={filtroSafra} onValueChange={setFiltroSafra}>
          <SelectTrigger><SelectValue placeholder="Safra" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as safras</SelectItem>
            {SAFRAS_REF.map((s) => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroProduto} onValueChange={setFiltroProduto}>
          <SelectTrigger><SelectValue placeholder="Produto" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os produtos</SelectItem>
            {PRODUTOS_CULTURA.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroEmpresa} onValueChange={(v) => { setFiltroEmpresa(v); setFiltroFilial("all"); }}>
          <SelectTrigger><SelectValue placeholder="Empresa" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {empresas.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroFilial} onValueChange={setFiltroFilial}>
          <SelectTrigger><SelectValue placeholder="Filial" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {filiais.filter((f) => filtroEmpresa === "all" || f.empresaId === filtroEmpresa).map((f) => (
              <SelectItem key={f.id} value={f.id}>{f.nomeRazao}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} loading={false} searchPlaceholder="Buscar cultivo..."
        onNew={openNew} onEdit={openEdit} onDelete={(row) => setDeleteTarget(row)} />

      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Editar Cultivo" : "Novo Cultivo"} saving={saving} onSave={onSave}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Safra <span className="text-destructive">*</span></Label>
            <Controller name="safraId" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {SAFRAS_REF.map((s) => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {errors.safraId && <p className="text-xs text-destructive">{errors.safraId.message}</p>}
          </div>
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
            <Label>Produto/Cultura <span className="text-destructive">*</span></Label>
            <Controller name="produto" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {PRODUTOS_CULTURA.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {errors.produto && <p className="text-xs text-destructive">{errors.produto.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Variedade <span className="text-destructive">*</span></Label>
            <Input {...register("variedade")} />
            {errors.variedade && <p className="text-xs text-destructive">{errors.variedade.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Área Plantada (ha) <span className="text-destructive">*</span></Label>
            <Input type="number" step="0.01" {...register("areaPlantadaHa")} />
            {errors.areaPlantadaHa && <p className="text-xs text-destructive">{errors.areaPlantadaHa.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Data Plantio <span className="text-destructive">*</span></Label>
            <Input type="date" {...register("dataPlantio")} />
            {errors.dataPlantio && <p className="text-xs text-destructive">{errors.dataPlantio.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Colheita Prevista <span className="text-destructive">*</span></Label>
            <Input type="date" {...register("dataColheitaPrevista")} />
            {errors.dataColheitaPrevista && <p className="text-xs text-destructive">{errors.dataColheitaPrevista.message}</p>}
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
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label>Observação</Label>
            <Textarea rows={2} {...register("observacao")} />
          </div>
        </div>
      </CrudModal>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Deseja excluir o cultivo "{deleteTarget?.produto} — {deleteTarget?.variedade}"?</AlertDialogDescription>
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
