import { useState, useMemo, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CrudModal } from "@/components/CrudModal";
import { SearchableSelect } from "@/components/SearchableSelect";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import {
  empresas,
  descontoTipos as mockDescontoTipos,
  descontoEmpresaConfigs as mockDescontoEmpresaConfigs,
} from "@/lib/mock-data";
import type {
  DescontoTipo,
  DescontoEmpresaConfig,
  TipoDescontoCalculo,
  AplicacaoDesconto,
  CategoriaDesconto,
} from "@/lib/mock-data";
import { toast } from "sonner";

// ---- Types ----
interface DescontoHistorico {
  id: string;
  descontoTipoId: string;
  data: string;
  usuario: string;
  campo: string;
  valorAnterior: string;
  valorNovo: string;
}

const mockHistorico: DescontoHistorico[] = [
  { id: "h1", descontoTipoId: "dt1", data: "2025-03-01T10:00:00Z", usuario: "Admin", campo: "valorPadrao", valorAnterior: "8.50", valorNovo: "9.53" },
  { id: "h2", descontoTipoId: "dt1", data: "2025-01-15T14:30:00Z", usuario: "Admin", campo: "ativo", valorAnterior: "false", valorNovo: "true" },
  { id: "h3", descontoTipoId: "dt2", data: "2025-02-10T09:00:00Z", usuario: "Admin", campo: "descricao", valorAnterior: "FUNRURAL antigo", valorNovo: "Contribuição ao Fundo de Assistência ao Trabalhador Rural" },
];

const tipoLabels: Record<TipoDescontoCalculo, string> = {
  percentual: "Percentual (%)",
  valor_fixo_unitario: "Fixo / Ton (R$)",
  valor_fixo_total: "Fixo Total (R$)",
};

const categoriaLabels: Record<CategoriaDesconto, string> = {
  tributario: "Tributário",
  qualidade: "Qualidade",
  operacional: "Operacional",
  comercial: "Comercial",
};

// Helpers to convert between AplicacaoDesconto and boolean flags
function aplicacaoToFlags(a: AplicacaoDesconto): { contrato: boolean; romaneio: boolean } {
  return { contrato: a === "contrato" || a === "ambos", romaneio: a === "romaneio" || a === "ambos" };
}
function flagsToAplicacao(contrato: boolean, romaneio: boolean): AplicacaoDesconto {
  if (contrato && romaneio) return "ambos";
  if (contrato) return "contrato";
  if (romaneio) return "romaneio";
  return "contrato"; // fallback
}

// Reusable tag selector component
function AplicacaoTags({ value, onChange, disabled }: { value: AplicacaoDesconto; onChange: (v: AplicacaoDesconto) => void; disabled?: boolean }) {
  const flags = aplicacaoToFlags(value);
  return (
    <div className="flex gap-2">
      <label className={`inline-flex items-center gap-1.5 cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-colors select-none ${flags.contrato ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input hover:bg-accent"} ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
        <Checkbox
          checked={flags.contrato}
          onCheckedChange={(checked) => {
            const newContrato = !!checked;
            if (!newContrato && !flags.romaneio) return;
            onChange(flagsToAplicacao(newContrato, flags.romaneio));
          }}
          disabled={disabled}
          className="h-3.5 w-3.5 border-current data-[state=checked]:bg-transparent data-[state=checked]:text-current"
        />
        Contrato
      </label>
      <label className={`inline-flex items-center gap-1.5 cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-colors select-none ${flags.romaneio ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input hover:bg-accent"} ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
        <Checkbox
          checked={flags.romaneio}
          onCheckedChange={(checked) => {
            const newRomaneio = !!checked;
            if (!newRomaneio && !flags.contrato) return;
            onChange(flagsToAplicacao(flags.contrato, newRomaneio));
          }}
          disabled={disabled}
          className="h-3.5 w-3.5 border-current data-[state=checked]:bg-transparent data-[state=checked]:text-current"
        />
        Romaneio
      </label>
    </div>
  );
}

const emptyForm: DescontoTipo = {
  id: "", nome: "", descricao: "", categoria: "tributario", tipo: "percentual", ordemAplicacao: 1, obrigatorio: false, aplicacao: "contrato", ativo: true,
};

export default function CondicoesDescontosPage() {
  const [descontos, setDescontos] = useState(mockDescontoTipos);
  const [empresaConfigs, setEmpresaConfigs] = useState(mockDescontoEmpresaConfigs);

  // Filters
  const [filtroEmpresa, setFiltroEmpresa] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroAplicacao, setFiltroAplicacao] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("basicos");
  const [editingItem, setEditingItem] = useState<DescontoTipo | null>(null);
  const [form, setForm] = useState<DescontoTipo>(emptyForm);

  // Inline editing for empresa configs
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineForm, setInlineForm] = useState<{ valorPadrao: number; ativo: boolean }>({ valorPadrao: 0, ativo: true });

  // New empresa config form
  const [showNewConfig, setShowNewConfig] = useState(false);
  const [newConfigForm, setNewConfigForm] = useState<{ empresaId: string; valorPadrao: number; ativo: boolean }>({ empresaId: "", valorPadrao: 0, ativo: true });

  const empresaAtivas = empresas.filter(e => !e.deletadoEm);
  const getEmpresaNome = (id: string) => empresaAtivas.find(e => e.id === id)?.nome ?? id;

  // Build listing joining descontos with their empresa configs
  const listagem = useMemo(() => {
    let items = descontos.filter(d => !filtroStatus || filtroStatus === "todos" || (filtroStatus === "ativo" ? d.ativo : !d.ativo));
    if (filtroTipo && filtroTipo !== "todos") items = items.filter(d => d.tipo === filtroTipo);
    if (filtroAplicacao && filtroAplicacao !== "todos") {
      items = items.filter(d => d.aplicacao === filtroAplicacao || d.aplicacao === "ambos");
    }

    return items.map(d => {
      const configs = empresaConfigs.filter(c => c.descontoTipoId === d.id);
      const empresasVinculadas = configs.map(c => c.empresaId);

      if (filtroEmpresa && filtroEmpresa !== "todos") {
        if (!empresasVinculadas.includes(filtroEmpresa)) return null;
      }

      const mainConfig = filtroEmpresa && filtroEmpresa !== "todos"
        ? configs.find(c => c.empresaId === filtroEmpresa)
        : configs[0];

      return {
        ...d,
        empresaNome: mainConfig ? getEmpresaNome(mainConfig.empresaId) : "—",
        valorPadrao: mainConfig?.valorPadrao ?? 0,
        totalEmpresas: configs.length,
      };
    }).filter(Boolean);
  }, [descontos, empresaConfigs, filtroEmpresa, filtroTipo, filtroAplicacao, filtroStatus]);

  const openCreate = () => {
    setEditingItem(null);
    setForm({ ...emptyForm, ordemAplicacao: descontos.length + 1 });
    setModalTab("basicos");
    setInlineEditId(null);
    setShowNewConfig(false);
    setModalOpen(true);
  };

  const openEdit = (item: DescontoTipo) => {
    setEditingItem(item);
    setForm({ ...item });
    setModalTab("basicos");
    setInlineEditId(null);
    setShowNewConfig(false);
    setModalOpen(true);
  };

  const hasInlineEditing = inlineEditId !== null;

  const handleSave = () => {
    if (hasInlineEditing) {
      toast.error("Finalize a edição da configuração por empresa antes de salvar o tipo de desconto.");
      return;
    }
    if (!form.nome.trim()) { toast.error("Nome é obrigatório"); return; }
    if (editingItem) {
      setDescontos(prev => prev.map(d => d.id === editingItem.id ? { ...form } : d));
      toast.success("Tipo de desconto atualizado");
    } else {
      const newId = `dt${Date.now()}`;
      setDescontos(prev => [...prev, { ...form, id: newId }]);
      toast.success("Tipo de desconto criado");
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setDescontos(prev => prev.filter(d => d.id !== id));
    setEmpresaConfigs(prev => prev.filter(c => c.descontoTipoId !== id));
    toast.success("Tipo de desconto removido");
  };

  // Empresa config CRUD
  const configsForCurrent = editingItem ? empresaConfigs.filter(c => c.descontoTipoId === editingItem.id) : [];

  const saveNewConfig = () => {
    if (!newConfigForm.empresaId) { toast.error("Selecione uma empresa"); return; }
    if (configsForCurrent.some(c => c.empresaId === newConfigForm.empresaId)) {
      toast.error("Esta empresa já está vinculada");
      return;
    }
    const newCfg: DescontoEmpresaConfig = {
      id: `dec${Date.now()}`,
      descontoTipoId: editingItem!.id,
      empresaId: newConfigForm.empresaId,
      valorPadrao: newConfigForm.valorPadrao,
      ativo: newConfigForm.ativo,
    };
    setEmpresaConfigs(prev => [...prev, newCfg]);
    toast.success("Empresa vinculada");
    setShowNewConfig(false);
    setNewConfigForm({ empresaId: "", valorPadrao: 0, ativo: true });
  };

  const startInlineEdit = (cfg: DescontoEmpresaConfig) => {
    setInlineEditId(cfg.id);
    setInlineForm({ valorPadrao: cfg.valorPadrao, ativo: cfg.ativo });
    setShowNewConfig(false);
  };

  const saveInlineEdit = () => {
    if (!inlineEditId) return;
    setEmpresaConfigs(prev => prev.map(c => c.id === inlineEditId ? { ...c, valorPadrao: inlineForm.valorPadrao, ativo: inlineForm.ativo } : c));
    toast.success("Configuração atualizada");
    setInlineEditId(null);
  };

  const cancelInlineEdit = () => {
    setInlineEditId(null);
  };

  const deleteConfig = (id: string) => {
    setEmpresaConfigs(prev => prev.filter(c => c.id !== id));
    toast.success("Configuração removida");
  };

  const historicoForCurrent = editingItem ? mockHistorico.filter(h => h.descontoTipoId === editingItem.id) : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Condições e Descontos" description="Gerencie tipos de desconto e suas condições de aplicação por empresa." />

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Empresa</Label>
          <SearchableSelect
            value={filtroEmpresa}
            onChange={setFiltroEmpresa}
            placeholder="Todas"
            options={[{ id: "todos", label: "Todas" }, ...empresaAtivas.map(e => ({ id: e.id, label: e.nome }))]}
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Tipo</Label>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="percentual">Percentual</SelectItem>
              <SelectItem value="valor_fixo_unitario">Fixo / Ton</SelectItem>
              <SelectItem value="valor_fixo_total">Fixo Total</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Aplicação</Label>
          <Select value={filtroAplicacao} onValueChange={setFiltroAplicacao}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="contrato">Contrato</SelectItem>
              <SelectItem value="romaneio">Romaneio</SelectItem>
              <SelectItem value="ambos">Ambos</SelectItem>
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
      </div>

      {/* Action */}
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Novo Tipo de Desconto</Button>
      </div>

      {/* Main Table */}
      <DataTable
        data={listagem as any[]}
        columns={[
          { key: "nome", header: "Tipo de Desconto" },
          { key: "descricao", header: "Descrição", render: (row) => (
            <div className="line-clamp-2 min-w-[200px]" title={row.descricao}>{row.descricao}</div>
          )},
          { key: "categoria", header: "Categoria", render: (row) => categoriaLabels[row.categoria as CategoriaDesconto] ?? row.categoria },
          { key: "aplicacao", header: "Aplicação", render: (row) => {
            const flags = aplicacaoToFlags(row.aplicacao as AplicacaoDesconto);
            return (
              <div className="flex gap-1">
                {flags.contrato && <Badge variant="outline" className="text-xs">Contrato</Badge>}
                {flags.romaneio && <Badge variant="outline" className="text-xs">Romaneio</Badge>}
              </div>
            );
          }},
          { key: "obrigatorio", header: "Obrigatório", render: (row) => (
            <Badge variant={row.obrigatorio ? "default" : "outline"}>{row.obrigatorio ? "Sim" : "Não"}</Badge>
          )},
          { key: "empresaNome", header: "Empresa", render: (row) => (
            <span>{row.empresaNome} {row.totalEmpresas > 1 && <span className="text-xs text-muted-foreground ml-1">(+{row.totalEmpresas - 1})</span>}</span>
          )},
          { key: "valorPadrao", header: "Valor Padrão", render: (row) => {
            if (row.tipo === "percentual") return `${row.valorPadrao.toFixed(2)}%`;
            return `R$ ${row.valorPadrao.toFixed(2)}`;
          }},
          { key: "ativo", header: "Status", render: (row) => (
            <Badge variant={row.ativo ? "default" : "secondary"}>{row.ativo ? "Ativo" : "Inativo"}</Badge>
          )},
          { key: "acoes", header: "Ações", render: (row) => (
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => openEdit(row)}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(row.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          )},
        ]}
      />

      {/* Modal with 3 tabs */}
      <CrudModal
        open={modalOpen}
        onClose={() => { if (hasInlineEditing) { toast.error("Finalize a edição da configuração antes de fechar."); return; } setModalOpen(false); }}
        title={editingItem ? `Editar: ${editingItem.nome}` : "Novo Tipo de Desconto"}
        onSave={handleSave}
        maxWidth="sm:max-w-4xl"
      >
        <Tabs value={modalTab} onValueChange={setModalTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="basicos">Dados Básicos</TabsTrigger>
              <TabsTrigger value="empresas" disabled={!editingItem}>Config. por Empresa</TabsTrigger>
              <TabsTrigger value="historico" disabled={!editingItem}>Histórico</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Ativo</Label>
              <Switch checked={form.ativo} onCheckedChange={v => setForm(prev => ({ ...prev, ativo: v }))} />
            </div>
          </div>

          {/* Tab: Dados Básicos */}
          <TabsContent value="basicos" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.nome} onChange={e => setForm(prev => ({ ...prev, nome: e.target.value }))} placeholder="Ex: FUNRURAL" />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.categoria} onValueChange={v => setForm(prev => ({ ...prev, categoria: v as CategoriaDesconto }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tributario">Tributário</SelectItem>
                    <SelectItem value="qualidade">Qualidade</SelectItem>
                    <SelectItem value="operacional">Operacional</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={v => setForm(prev => ({ ...prev, tipo: v as TipoDescontoCalculo }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentual">Percentual (%)</SelectItem>
                    <SelectItem value="valor_fixo_unitario">Fixo por Tonelada (R$)</SelectItem>
                    <SelectItem value="valor_fixo_total">Fixo Total (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ordem de Aplicação</Label>
                <Input type="number" min={1} value={form.ordemAplicacao} onChange={e => setForm(prev => ({ ...prev, ordemAplicacao: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.descricao} onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))} rows={3} placeholder="Descrição detalhada do tipo de desconto..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label>Aplicação</Label>
                <AplicacaoTags
                  value={form.aplicacao}
                  onChange={v => setForm(prev => ({ ...prev, aplicacao: v }))}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Switch
                    id="obrigatorio"
                    checked={form.obrigatorio}
                    onCheckedChange={v => setForm(prev => ({ ...prev, obrigatorio: v }))}
                  />
                  <Label htmlFor="obrigatorio">Obrigatório no contrato ou romaneio</Label>
                </div>
                <p className="text-xs text-muted-foreground pl-11">O contrato não poderá ser salvo sem aplicar este desconto.</p>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Config por Empresa */}
          <TabsContent value="empresas" className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => {
                if (hasInlineEditing) { toast.error("Finalize a edição em andamento antes de vincular nova empresa."); return; }
                setShowNewConfig(true);
                setNewConfigForm({ empresaId: "", valorPadrao: 0, ativo: true });
              }}>
                <Plus className="h-4 w-4 mr-1" /> Vincular Empresa
              </Button>
            </div>

            {showNewConfig && (
              <div className="border rounded-md p-4 space-y-3 bg-muted/30">
                <p className="text-sm font-medium">Nova Configuração</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Empresa *</Label>
                    <SearchableSelect
                      value={newConfigForm.empresaId}
                      onChange={v => setNewConfigForm(prev => ({ ...prev, empresaId: v }))}
                      placeholder="Selecione"
                      options={empresaAtivas.map(e => ({ id: e.id, label: e.nome }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Valor Padrão</Label>
                    <Input type="number" step="0.01" value={newConfigForm.valorPadrao} onChange={e => setNewConfigForm(prev => ({ ...prev, valorPadrao: Number(e.target.value) }))} />
                  </div>
                  <div className="flex items-end gap-3 pb-0.5">
                    <Switch checked={newConfigForm.ativo} onCheckedChange={v => setNewConfigForm(prev => ({ ...prev, ativo: v }))} />
                    <Label className="text-xs">Ativo</Label>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => setShowNewConfig(false)}>Cancelar</Button>
                  <Button size="sm" onClick={saveNewConfig}>Salvar</Button>
                </div>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Valor Padrão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configsForCurrent.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma empresa vinculada</TableCell></TableRow>
                )}
                {configsForCurrent.map(cfg => {
                  const isEditing = inlineEditId === cfg.id;
                  return (
                    <TableRow key={cfg.id}>
                      <TableCell className="font-medium">{getEmpresaNome(cfg.empresaId)}</TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            className="h-8 w-32"
                            value={inlineForm.valorPadrao}
                            onChange={e => setInlineForm(prev => ({ ...prev, valorPadrao: Number(e.target.value) }))}
                          />
                        ) : (
                          form.tipo === "percentual" ? `${cfg.valorPadrao.toFixed(2)}%` : `R$ ${cfg.valorPadrao.toFixed(2)}`
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Switch
                            checked={inlineForm.ativo}
                            onCheckedChange={v => setInlineForm(prev => ({ ...prev, ativo: v }))}
                          />
                        ) : (
                          <Badge variant={cfg.ativo ? "default" : "secondary"}>{cfg.ativo ? "Ativo" : "Inativo"}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {isEditing ? (
                            <>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={saveInlineEdit}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10" onClick={cancelInlineEdit}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startInlineEdit(cfg)} disabled={hasInlineEditing}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => deleteConfig(cfg.id)} disabled={hasInlineEditing}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Tab: Histórico */}
          <TabsContent value="historico" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Campo</TableHead>
                  <TableHead>Valor Anterior</TableHead>
                  <TableHead>Valor Novo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historicoForCurrent.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum registro de alteração</TableCell></TableRow>
                )}
                {historicoForCurrent.map(h => (
                  <TableRow key={h.id}>
                    <TableCell className="text-sm">{new Date(h.data).toLocaleString("pt-BR")}</TableCell>
                    <TableCell>{h.usuario}</TableCell>
                    <TableCell><Badge variant="outline">{h.campo}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{h.valorAnterior}</TableCell>
                    <TableCell className="font-medium">{h.valorNovo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CrudModal>
    </div>
  );
}
