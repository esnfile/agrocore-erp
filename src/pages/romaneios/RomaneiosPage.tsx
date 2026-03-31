import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useOrganization } from "@/contexts/OrganizationContext";
import { romaneioService } from "@/lib/services";
import { produtos as mockProdutos, empresas, filiais } from "@/lib/mock-data";
import type { Romaneio } from "@/lib/mock-data";
import {
  STATUS_LABELS, STATUS_COLORS, ORIGEM_LABELS,
  type StatusRomaneioNew, type OrigemRomaneio,
} from "./romaneio-types";
import {
  Search, Plus, Pencil, Trash2, Eye, ChevronLeft, ChevronRight, ArrowUpDown,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FormRow } from "@/components/FormRow";

const PAGE_SIZE = 15;

export default function RomaneiosPage() {
  const navigate = useNavigate();
  const { empresaAtual, filialAtual, grupoAtual } = useOrganization();

  const [romaneios, setRomaneios] = useState<Romaneio[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("TODOS");
  const [filterOrigem, setFilterOrigem] = useState<string>("TODOS");
  const [filterEmpresa, setFilterEmpresa] = useState<string>(empresaAtual?.id || "TODAS");
  const [filterFilial, setFilterFilial] = useState<string>(filialAtual?.id || "TODAS");

  // Sort
  const [sortKey, setSortKey] = useState<string>("criadoEm");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  // Sync filters with global context
  useEffect(() => {
    if (empresaAtual) setFilterEmpresa(empresaAtual.id);
    if (filialAtual) setFilterFilial(filialAtual.id);
  }, [empresaAtual, filialAtual]);

  const load = useCallback(async () => {
    setLoading(true);
    // Load all romaneios (we filter client-side for multi-empresa support)
    let data: Romaneio[] = [];
    if (filterEmpresa === "TODAS") {
      // Load across all empresas — for now concat from known empresas
      for (const emp of empresas.filter((e) => e.deletadoEm === null && e.grupoId === grupoAtual?.id)) {
        for (const fil of filiais.filter((f) => f.empresaId === emp.id && f.deletadoEm === null)) {
          const r = await romaneioService.listar(emp.id, fil.id);
          data = data.concat(r);
        }
      }
    } else if (filterFilial === "TODAS") {
      for (const fil of filiais.filter((f) => f.empresaId === filterEmpresa && f.deletadoEm === null)) {
        const r = await romaneioService.listar(filterEmpresa, fil.id);
        data = data.concat(r);
      }
    } else {
      data = await romaneioService.listar(filterEmpresa, filterFilial);
    }
    setRomaneios(data);
    setLoading(false);
  }, [filterEmpresa, filterFilial, grupoAtual]);

  useEffect(() => { load(); }, [load]);

  const produtoMap = useMemo(() => {
    const m: Record<string, string> = {};
    mockProdutos.forEach((p) => { m[p.id] = p.descricao; });
    return m;
  }, []);

  const empresaMap = useMemo(() => {
    const m: Record<string, string> = {};
    empresas.forEach((e) => { m[e.id] = e.nome; });
    return m;
  }, []);

  const filialMap = useMemo(() => {
    const m: Record<string, string> = {};
    filiais.forEach((f) => { m[f.id] = f.nomeRazao; });
    return m;
  }, []);

  // Filter
  const filtered = useMemo(() => {
    let list = romaneios;
    if (filterStatus !== "TODOS") list = list.filter((r) => r.status === filterStatus);
    if (filterOrigem !== "TODOS") list = list.filter((r) => r.origem === filterOrigem);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.id.toLowerCase().includes(q) ||
        r.motoristaNome.toLowerCase().includes(q) ||
        r.placaVeiculo.toLowerCase().includes(q) ||
        (produtoMap[r.produtoId] || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [romaneios, filterStatus, filterOrigem, search, produtoMap]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = (a as any)[sortKey] ?? "";
      const bv = (b as any)[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(0);
  };

  const onDelete = async () => {
    if (!deleteId) return;
    await romaneioService.excluir(deleteId);
    toast({ title: "Romaneio excluído" });
    setDeleteId(null);
    load();
  };

  const statusOptions = [
    "RASCUNHO", "AGUARDANDO_PESAGEM", "PESAGEM_PARCIAL", "AGUARDANDO_VINCULO",
    "AGUARDANDO_CLASSIFICACAO", "CLASSIFICADO", "FINALIZADO", "CANCELADO",
  ] as StatusRomaneioNew[];

  const origemOptions: OrigemRomaneio[] = ["CONTRATO", "COLHEITA", "AVULSO"];

  const filiaisFiltradas = filterEmpresa !== "TODAS"
    ? filiais.filter((f) => f.empresaId === filterEmpresa && f.deletadoEm === null)
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Romaneios" description="Gestão de romaneios operacionais" />
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Romaneios" description="Gestão de romaneios operacionais" />

      {/* Context bar */}
      <div className="rounded-lg border bg-card p-3">
        <FormRow columns={4}>
          <div>
            <label className="text-xs text-muted-foreground font-medium">Empresa</label>
            <Select value={filterEmpresa} onValueChange={(v) => { setFilterEmpresa(v); setFilterFilial("TODAS"); setPage(0); }}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas as empresas</SelectItem>
                {empresas.filter((e) => e.deletadoEm === null && e.grupoId === grupoAtual?.id).map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium">Filial</label>
            <Select value={filterFilial} onValueChange={(v) => { setFilterFilial(v); setPage(0); }} disabled={filterEmpresa === "TODAS"}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas as filiais</SelectItem>
                {filiaisFiltradas.map((f) => <SelectItem key={f.id} value={f.id}>{f.nomeRazao}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium">Status</label>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(0); }}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                {statusOptions.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium">Origem</label>
            <Select value={filterOrigem} onValueChange={(v) => { setFilterOrigem(v); setPage(0); }}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todas</SelectItem>
                {origemOptions.map((o) => <SelectItem key={o} value={o}>{ORIGEM_LABELS[o]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </FormRow>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Buscar por ID, motorista, placa, produto..." className="pl-9" />
        </div>
        <Button size="sm" onClick={() => navigate("/romaneios/novo")} className="gap-1">
          <Plus className="h-4 w-4" /> Novo Romaneio
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {(filterEmpresa === "TODAS" || filterFilial === "TODAS") && (
                <>
                  <TableHead className="w-32">
                    <button className="flex items-center gap-1 hover:text-foreground text-xs" onClick={() => toggleSort("empresaId")}>Empresa <ArrowUpDown className="h-3 w-3" /></button>
                  </TableHead>
                  <TableHead className="w-32">
                    <button className="flex items-center gap-1 hover:text-foreground text-xs" onClick={() => toggleSort("filialId")}>Filial <ArrowUpDown className="h-3 w-3" /></button>
                  </TableHead>
                </>
              )}
              <TableHead className="w-20">
                <button className="flex items-center gap-1 hover:text-foreground text-xs" onClick={() => toggleSort("id")}>ID <ArrowUpDown className="h-3 w-3" /></button>
              </TableHead>
              <TableHead>
                <button className="flex items-center gap-1 hover:text-foreground text-xs" onClick={() => toggleSort("origem")}>Origem <ArrowUpDown className="h-3 w-3" /></button>
              </TableHead>
              <TableHead>
                <button className="flex items-center gap-1 hover:text-foreground text-xs" onClick={() => toggleSort("produtoId")}>Produto <ArrowUpDown className="h-3 w-3" /></button>
              </TableHead>
              <TableHead>Motorista</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead className="text-right">
                <button className="flex items-center gap-1 hover:text-foreground text-xs ml-auto" onClick={() => toggleSort("pesoLiquidoFisico")}>P. Físico <ArrowUpDown className="h-3 w-3" /></button>
              </TableHead>
              <TableHead className="text-right">
                <button className="flex items-center gap-1 hover:text-foreground text-xs ml-auto" onClick={() => toggleSort("pesoClassificado")}>P. Classif. <ArrowUpDown className="h-3 w-3" /></button>
              </TableHead>
              <TableHead>
                <button className="flex items-center gap-1 hover:text-foreground text-xs" onClick={() => toggleSort("status")}>Status <ArrowUpDown className="h-3 w-3" /></button>
              </TableHead>
              <TableHead>
                <button className="flex items-center gap-1 hover:text-foreground text-xs" onClick={() => toggleSort("criadoEm")}>Data <ArrowUpDown className="h-3 w-3" /></button>
              </TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-muted-foreground py-8">Nenhum romaneio encontrado.</TableCell>
              </TableRow>
            ) : paged.map((rom) => {
              const statusKey = rom.status as StatusRomaneioNew;
              return (
                <TableRow key={rom.id} className="cursor-pointer" onClick={() => navigate(`/romaneios/${rom.id}`)}>
                  {(filterEmpresa === "TODAS" || filterFilial === "TODAS") && (
                    <>
                      <TableCell className="text-xs">{empresaMap[rom.empresaId] || rom.empresaId.substring(0, 6)}</TableCell>
                      <TableCell className="text-xs">{filialMap[rom.filialId] || rom.filialId.substring(0, 6)}</TableCell>
                    </>
                  )}
                  <TableCell className="font-mono text-xs">{rom.id.substring(0, 8)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {ORIGEM_LABELS[rom.origem] || rom.origem}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{produtoMap[rom.produtoId] || "—"}</TableCell>
                  <TableCell className="text-sm">{rom.motoristaNome || "—"}</TableCell>
                  <TableCell className="text-sm font-mono">{rom.placaVeiculo || "—"}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {rom.pesoLiquidoFisico > 0 ? `${rom.pesoLiquidoFisico.toFixed(3)}` : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {rom.pesoClassificado > 0 ? `${rom.pesoClassificado.toFixed(3)}` : (rom.pesoLiquidoSecoLimpo > 0 ? `${rom.pesoLiquidoSecoLimpo.toFixed(3)}` : "—")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_COLORS[statusKey] || "default"} className="text-[10px]">
                      {STATUS_LABELS[statusKey] || rom.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{format(new Date(rom.criadoEm), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/romaneios/${rom.id}`)} title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {rom.status !== "FINALIZADO" && rom.status !== "CANCELADO" && (
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(rom.id)} title="Excluir">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{sorted.length} registro{sorted.length !== 1 && "s"} — Página {page + 1} de {totalPages}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Romaneio?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
