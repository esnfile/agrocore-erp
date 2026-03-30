import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CrudModal } from "@/components/CrudModal";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { moedas as mockMoedasData, cotacoesMoeda as mockCotacoesData, type Moeda, type CotacaoMoeda } from "@/lib/mock-data";
import { toast } from "sonner";

export default function MoedasCotacoesPage() {
  const [tab, setTab] = useState("moedas");
  const [moedasList, setMoedasList] = useState<Moeda[]>(mockMoedasData);
  const [cotacoesList] = useState<CotacaoMoeda[]>(mockCotacoesData);

  // Filters
  const [filtroMoeda, setFiltroMoeda] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMoeda, setEditingMoeda] = useState<Moeda | null>(null);
  const [form, setForm] = useState({ codigo: "", descricao: "", simbolo: "", ativo: true });

  // Selected moeda for cotações
  const [selectedMoedaId, setSelectedMoedaId] = useState<string | null>(null);

  const getMoedaNome = (id: string) => moedasList.find(m => m.id === id)?.codigo ?? id;

  // Get latest cotação for each moeda
  const getCotacaoAtual = (moedaId: string): number | null => {
    const cots = cotacoesList
      .filter(c => c.moedaOrigemId === moedaId && !c.deletadoEm)
      .sort((a, b) => new Date(b.dataHoraCotacao).getTime() - new Date(a.dataHoraCotacao).getTime());
    return cots.length > 0 ? cots[0].valorCompra : null;
  };

  // Filtered moedas
  const moedasFiltradas = useMemo(() => {
    let items = moedasList.filter(m => !m.deletadoEm);
    if (filtroMoeda !== "todos") items = items.filter(m => m.id === filtroMoeda);
    if (filtroStatus !== "todos") items = items.filter(m => filtroStatus === "ativo" ? m.ativo : !m.ativo);
    return items;
  }, [moedasList, filtroMoeda, filtroStatus]);

  // Filtered cotações
  const cotacoesFiltradas = useMemo(() => {
    let items = cotacoesList.filter(c => !c.deletadoEm);
    if (selectedMoedaId) items = items.filter(c => c.moedaOrigemId === selectedMoedaId);
    if (filtroPeriodo) {
      const start = new Date(filtroPeriodo);
      items = items.filter(c => new Date(c.dataHoraCotacao) >= start);
    }
    return items.sort((a, b) => new Date(b.dataHoraCotacao).getTime() - new Date(a.dataHoraCotacao).getTime());
  }, [cotacoesList, selectedMoedaId, filtroPeriodo]);

  const openCreate = () => {
    setEditingMoeda(null);
    setForm({ codigo: "", descricao: "", simbolo: "", ativo: true });
    setModalOpen(true);
  };

  const openEdit = (moeda: Moeda) => {
    setEditingMoeda(moeda);
    setForm({ codigo: moeda.codigo, descricao: moeda.descricao, simbolo: moeda.simbolo, ativo: moeda.ativo });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.codigo.trim()) { toast.error("Código é obrigatório"); return; }
    if (!form.descricao.trim()) { toast.error("Descrição é obrigatória"); return; }
    const now = new Date().toISOString();
    if (editingMoeda) {
      setMoedasList(prev => prev.map(m => m.id === editingMoeda.id ? { ...m, ...form, atualizadoEm: now, atualizadoPor: "u1" } : m));
      toast.success("Moeda atualizada");
    } else {
      const newMoeda: Moeda = {
        id: `moeda${Date.now()}`,
        grupoId: "g1",
        empresaId: null,
        filialId: null,
        codigo: form.codigo.toUpperCase(),
        descricao: form.descricao,
        simbolo: form.simbolo,
        ativo: form.ativo,
        criadoEm: now, criadoPor: "u1",
        atualizadoEm: now, atualizadoPor: "u1",
        deletadoEm: null, deletadoPor: null,
      };
      setMoedasList(prev => [...prev, newMoeda]);
      toast.success("Moeda criada");
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setMoedasList(prev => prev.map(m => m.id === id ? { ...m, deletadoEm: new Date().toISOString(), deletadoPor: "u1" } : m));
    toast.success("Moeda removida");
  };

  const handleSelectMoeda = (moedaId: string) => {
    setSelectedMoedaId(prev => prev === moedaId ? null : moedaId);
    if (tab === "moedas") setTab("cotacoes");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Moedas e Cotações" description="Gerencie moedas aceitas e acompanhe cotações atualizadas." />

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Moeda</Label>
          <Select value={filtroMoeda} onValueChange={setFiltroMoeda}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              {moedasList.filter(m => !m.deletadoEm).map(m => (
                <SelectItem key={m.id} value={m.id}>{m.codigo} — {m.descricao}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Status</Label>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Período (a partir de)</Label>
          <Input type="date" value={filtroPeriodo} onChange={e => setFiltroPeriodo(e.target.value)} />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="moedas">Moedas</TabsTrigger>
          <TabsTrigger value="cotacoes">
            Cotações
            {selectedMoedaId && <Badge variant="secondary" className="ml-2 text-xs">{getMoedaNome(selectedMoedaId)}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="moedas" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Nova Moeda</Button>
          </div>
          <DataTable
            data={moedasFiltradas}
            columns={[
              { key: "codigo", header: "Moeda" },
              { key: "descricao", header: "Descrição" },
              { key: "simbolo", header: "Símbolo" },
              { key: "cotacaoAtual", header: "Cotação Atual (BRL)", render: (row) => {
                const cot = getCotacaoAtual(row.id);
                if (row.codigo === "BRL") return "—";
                return cot ? `R$ ${cot.toFixed(4)}` : "—";
              }},
              { key: "ativo", header: "Status", render: (row) => (
                <Badge variant={row.ativo ? "default" : "secondary"}>{row.ativo ? "Ativo" : "Inativo"}</Badge>
              )},
              { key: "acoes", header: "Ações", render: (row) => (
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(row)}><Pencil className="h-4 w-4" /></Button>
                  {row.codigo !== "BRL" && (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => handleSelectMoeda(row.id)} title="Ver cotações">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(row.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </>
                  )}
                </div>
              )},
            ]}
          />
        </TabsContent>

        <TabsContent value="cotacoes" className="space-y-4">
          <div className="flex justify-between items-center">
            {selectedMoedaId && (
              <Button size="sm" variant="outline" onClick={() => setSelectedMoedaId(null)}>Limpar filtro de moeda</Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={() => toast.info("Simulação: cotações atualizadas via API")}>
                <RefreshCw className="h-4 w-4 mr-1" /> Atualizar Cotações
              </Button>
            </div>
          </div>
          <DataTable
            data={cotacoesFiltradas}
            columns={[
              { key: "moedaOrigemId", header: "Moeda", render: (row) => getMoedaNome(row.moedaOrigemId) },
              { key: "valorCompra", header: "Compra", render: (row) => `R$ ${row.valorCompra.toFixed(4)}` },
              { key: "valorVenda", header: "Venda", render: (row) => `R$ ${row.valorVenda.toFixed(4)}` },
              { key: "variacao", header: "Variação", render: (row) => (
                <span className={row.variacaoPercentual >= 0 ? "text-green-700" : "text-destructive"}>
                  {row.variacaoPercentual >= 0 ? "+" : ""}{row.variacaoPercentual.toFixed(2)}%
                </span>
              )},
              { key: "valorMaximo", header: "Máx", render: (row) => `R$ ${row.valorMaximo.toFixed(4)}` },
              { key: "valorMinimo", header: "Mín", render: (row) => `R$ ${row.valorMinimo.toFixed(4)}` },
              { key: "dataHoraCotacao", header: "Data/Hora", render: (row) => new Date(row.dataHoraCotacao).toLocaleString("pt-BR") },
              { key: "fonte", header: "Fonte" },
            ]}
          />
        </TabsContent>
      </Tabs>

      {/* CRUD Modal for Moedas */}
      <CrudModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMoeda ? `Editar: ${editingMoeda.codigo}` : "Nova Moeda"}
        onSave={handleSave}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-end gap-2">
            <Label className="text-sm">Ativo</Label>
            <Switch checked={form.ativo} onCheckedChange={v => setForm(prev => ({ ...prev, ativo: v }))} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Código (Sigla) *</Label>
              <Input value={form.codigo} onChange={e => setForm(prev => ({ ...prev, codigo: e.target.value.toUpperCase() }))} placeholder="Ex: USD" maxLength={5} />
            </div>
            <div className="space-y-2">
              <Label>Símbolo</Label>
              <Input value={form.simbolo} onChange={e => setForm(prev => ({ ...prev, simbolo: e.target.value }))} placeholder="Ex: $" maxLength={5} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Input value={form.descricao} onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))} placeholder="Ex: Dólar Americano" />
          </div>
        </div>
      </CrudModal>
    </div>
  );
}
