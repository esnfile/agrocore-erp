import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { empresas, filiais } from "@/lib/mock-data";
import { Wheat, ClipboardList, TrendingUp, Scale } from "lucide-react";

// ---- Interfaces & Mock ----
interface RomaneioColheita {
  id: string;
  safraId: string;
  safraNome: string;
  cultivoId: string;
  cultivoNome: string;
  empresaId: string;
  filialId: string;
  romaneioNumero: string;
  data: string;
  produto: string;
  pesoBrutoTon: number;
  descontosTon: number;
  pesoLiquidoTon: number;
  status: "Confirmado" | "Pendente" | "Cancelado";
}

const mockRomaneios: RomaneioColheita[] = [
  {
    id: "rc1", safraId: "saf1", safraNome: "Safra 2024/2025",
    cultivoId: "cult1", cultivoNome: "Soja — TMG 2381",
    empresaId: "e1", filialId: "f1", romaneioNumero: "ROM-001",
    data: "2025-02-10", produto: "Soja",
    pesoBrutoTon: 32.5, descontosTon: 1.2, pesoLiquidoTon: 31.3,
    status: "Confirmado",
  },
  {
    id: "rc2", safraId: "saf1", safraNome: "Safra 2024/2025",
    cultivoId: "cult1", cultivoNome: "Soja — TMG 2381",
    empresaId: "e1", filialId: "f1", romaneioNumero: "ROM-002",
    data: "2025-02-12", produto: "Soja",
    pesoBrutoTon: 28.8, descontosTon: 0.9, pesoLiquidoTon: 27.9,
    status: "Confirmado",
  },
  {
    id: "rc3", safraId: "saf1", safraNome: "Safra 2024/2025",
    cultivoId: "cult1", cultivoNome: "Soja — TMG 2381",
    empresaId: "e1", filialId: "f1", romaneioNumero: "ROM-003",
    data: "2025-02-15", produto: "Soja",
    pesoBrutoTon: 35.2, descontosTon: 1.5, pesoLiquidoTon: 33.7,
    status: "Pendente",
  },
  {
    id: "rc4", safraId: "saf1", safraNome: "Safra 2024/2025",
    cultivoId: "cult2", cultivoNome: "Milho — AG 9025",
    empresaId: "e1", filialId: "f1", romaneioNumero: "ROM-004",
    data: "2025-03-05", produto: "Milho",
    pesoBrutoTon: 40.0, descontosTon: 2.0, pesoLiquidoTon: 38.0,
    status: "Confirmado",
  },
  {
    id: "rc5", safraId: "saf2", safraNome: "Safra 2023/2024",
    cultivoId: "cult3", cultivoNome: "Soja — NS 7901",
    empresaId: "e1", filialId: "f2", romaneioNumero: "ROM-005",
    data: "2024-02-20", produto: "Soja",
    pesoBrutoTon: 45.0, descontosTon: 1.8, pesoLiquidoTon: 43.2,
    status: "Confirmado",
  },
  {
    id: "rc6", safraId: "saf2", safraNome: "Safra 2023/2024",
    cultivoId: "cult3", cultivoNome: "Soja — NS 7901",
    empresaId: "e1", filialId: "f2", romaneioNumero: "ROM-006",
    data: "2024-02-22", produto: "Soja",
    pesoBrutoTon: 50.0, descontosTon: 2.1, pesoLiquidoTon: 47.9,
    status: "Confirmado",
  },
];

const SAFRAS_REF = [
  { id: "saf1", nome: "Safra 2024/2025" },
  { id: "saf2", nome: "Safra 2023/2024" },
  { id: "saf3", nome: "Safra 2025/2026" },
];
const CULTIVOS_REF = [
  { id: "cult1", nome: "Soja — TMG 2381" },
  { id: "cult2", nome: "Milho — AG 9025" },
  { id: "cult3", nome: "Soja — NS 7901" },
];

// Meta prevista por cultivo (ha * produtividade estimada ton/ha)
const META_COLHEITA: Record<string, number> = {
  cult1: 500 * 3.6,   // 1800 ton
  cult2: 300 * 9.0,   // 2700 ton
  cult3: 800 * 3.5,   // 2800 ton
};

export default function RomaneiosColheitasPage() {
  const [filtroSafra, setFiltroSafra] = useState<string>("all");
  const [filtroCultivo, setFiltroCultivo] = useState<string>("all");
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>("all");
  const [filtroFilial, setFiltroFilial] = useState<string>("all");
  const [filtroStatus, setFiltroStatus] = useState<string>("all");
  const [filtroPeriodoDe, setFiltroPeriodoDe] = useState("");
  const [filtroPeriodoAte, setFiltroPeriodoAte] = useState("");

  const filtered = useMemo(() => {
    return mockRomaneios.filter((r) => {
      if (filtroSafra !== "all" && r.safraId !== filtroSafra) return false;
      if (filtroCultivo !== "all" && r.cultivoId !== filtroCultivo) return false;
      if (filtroEmpresa !== "all" && r.empresaId !== filtroEmpresa) return false;
      if (filtroFilial !== "all" && r.filialId !== filtroFilial) return false;
      if (filtroStatus !== "all" && r.status !== filtroStatus) return false;
      if (filtroPeriodoDe && r.data < filtroPeriodoDe) return false;
      if (filtroPeriodoAte && r.data > filtroPeriodoAte) return false;
      return true;
    });
  }, [filtroSafra, filtroCultivo, filtroEmpresa, filtroFilial, filtroStatus, filtroPeriodoDe, filtroPeriodoAte]);

  // KPIs
  const totalColhidoTon = filtered.filter((r) => r.status === "Confirmado").reduce((s, r) => s + r.pesoLiquidoTon, 0);
  const totalRomaneios = filtered.length;
  const metaTotal = useMemo(() => {
    const cultivoIds = [...new Set(filtered.map((r) => r.cultivoId))];
    return cultivoIds.reduce((s, id) => s + (META_COLHEITA[id] ?? 0), 0);
  }, [filtered]);
  const progressoPct = metaTotal > 0 ? Math.min(100, (totalColhidoTon / metaTotal) * 100) : 0;
  const saldoColher = Math.max(0, metaTotal - totalColhidoTon);

  // Progress por cultivo
  const progressoPorCultivo = useMemo(() => {
    const cultivoIds = [...new Set(filtered.map((r) => r.cultivoId))];
    return cultivoIds.map((id) => {
      const nome = CULTIVOS_REF.find((c) => c.id === id)?.nome ?? id;
      const colhido = filtered.filter((r) => r.cultivoId === id && r.status === "Confirmado").reduce((s, r) => s + r.pesoLiquidoTon, 0);
      const meta = META_COLHEITA[id] ?? 0;
      const pct = meta > 0 ? Math.min(100, (colhido / meta) * 100) : 0;
      return { id, nome, colhido, meta, pct };
    });
  }, [filtered]);

  const columns: Column<RomaneioColheita>[] = [
    { key: "safraNome", header: "Safra" },
    { key: "cultivoNome", header: "Cultivo" },
    { key: "romaneioNumero", header: "Romaneio" },
    { key: "data", header: "Data", render: (r) => new Date(r.data).toLocaleDateString("pt-BR") },
    { key: "produto", header: "Produto" },
    { key: "pesoBrutoTon", header: "Peso Bruto (ton)", render: (r) => r.pesoBrutoTon.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) },
    { key: "descontosTon", header: "Descontos (ton)", render: (r) => r.descontosTon.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) },
    { key: "pesoLiquidoTon", header: "Peso Líquido (ton)", render: (r) => r.pesoLiquidoTon.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) },
    {
      key: "status", header: "Status",
      render: (r) => (
        <Badge variant={r.status === "Confirmado" ? "default" : r.status === "Pendente" ? "outline" : "destructive"}>
          {r.status}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Romaneios de Colheitas" description="Acompanhamento operacional das colheitas por safra e cultivo" />

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Wheat} label="Total Colhido" value={`${totalColhidoTon.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ton`} />
        <KpiCard icon={ClipboardList} label="Romaneios" value={String(totalRomaneios)} />
        <KpiCard icon={TrendingUp} label="Progresso" value={`${progressoPct.toFixed(1)}%`} />
        <KpiCard icon={Scale} label="Saldo a Colher" value={`${saldoColher.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ton`} />
      </div>

      {/* Progress por Cultivo */}
      {progressoPorCultivo.length > 0 && (
        <div className="mb-6 rounded-lg border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Progresso por Cultivo</h3>
          <div className="space-y-3">
            {progressoPorCultivo.map((c) => (
              <div key={c.id}>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{c.nome}</span>
                  <span>{c.colhido.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} / {c.meta.toLocaleString("pt-BR", { minimumFractionDigits: 0 })} ton ({c.pct.toFixed(1)}%)</span>
                </div>
                <Progress value={c.pct} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <Select value={filtroSafra} onValueChange={setFiltroSafra}>
          <SelectTrigger><SelectValue placeholder="Safra" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as safras</SelectItem>
            {SAFRAS_REF.map((s) => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroCultivo} onValueChange={setFiltroCultivo}>
          <SelectTrigger><SelectValue placeholder="Cultivo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {CULTIVOS_REF.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
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
            <SelectItem value="Confirmado">Confirmado</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <div className="space-y-1">
          <Label className="text-xs">De</Label>
          <Input type="date" value={filtroPeriodoDe} onChange={(e) => setFiltroPeriodoDe(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Até</Label>
          <Input type="date" value={filtroPeriodoAte} onChange={(e) => setFiltroPeriodoAte(e.target.value)} />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} loading={false} searchPlaceholder="Buscar romaneio..." />
    </>
  );
}

// ---- KPI Card ----
function KpiCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
