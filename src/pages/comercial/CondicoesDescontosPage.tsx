import { useState, useMemo } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
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

const aplicacaoLabels: Record<AplicacaoDesconto, string> = {
  contrato: "Contrato",
  romaneio: "Romaneio",
  ambos: "Ambos",
};

const emptyForm: DescontoTipo = {
  id: "", nome: "", descricao: "", categoria: "tributario", tipo: "percentual", ordemAplicacao: 1, ativo: true,
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

  // Empresa config editing inside modal
  const [editingConfig, setEditingConfig] = useState<DescontoEmpresaConfig | null>(null);
  const [configForm, setConfigForm] = useState<Partial<DescontoEmpresaConfig>>({});

  const empresaAtivas = empresas.filter(e => !e.deletadoEm);

  const getEmpresaNome = (id: string) => empresaAtivas.find(e => e.id === id)?.nome ?? id;

  // Build a flat list joining descontos with their empresa configs for the main table
  const listagem = useMemo(() => {
    let items = descontos.filter(d => !filtroStatus || filtroStatus === "todos" || (filtroStatus === "ativo" ? d.ativo : !d.ativo));
    if (filtroTipo && filtroTipo !== "todos") items = items.filter(d => d.tipo === filtroTipo);

    return items.map(d => {
      const configs = empresaConfigs.filter(c => c.descontoTipoId === d.id);
      const empresasVinculadas = configs.map(c => c.empresaId);

      if (filtroEmpresa && filtroEmpresa !== "todos") {
        if (!empresasVinculadas.includes(filtroEmpresa)) return null;
      }
      if (filtroAplicacao && filtroAplicacao !== "todos") {
        const hasApp = configs.some(c => c.aplicacao === filtroAplicacao || c.aplicacao === "ambos");
        if (!hasApp) return null;
      }

      const mainConfig = filtroEmpresa && filtroEmpresa !== "todos"
        ? configs.find(c => c.empresaId === filtroEmpresa)
        : configs[0];

      return {
        ...d,
        empresaNome: mainConfig ? getEmpresaNome(mainConfig.empresaId) : "—",
        valorPadrao: mainConfig?.valorPadrao ?? 0,
        aplicacao: mainConfig?.aplicacao ?? "—",
        obrigatorio: mainConfig?.obrigatorio ?? false,
        totalEmpresas: configs.length,
      };
    }).filter(Boolean);
  }, [descontos, empresaConfigs, filtroEmpresa, filtroTipo, filtroAplicacao, filtroStatus]);

  const openCreate = () => {
    setEditingItem(null);
    setForm({ ...emptyForm, ordemAplicacao: descontos.length + 1 });
    setModalTab("basicos");
    setModalOpen(true);
  };

  const openEdit = (item: DescontoTipo) => {
    setEditingItem(item);
    setForm({ ...item });
    setModalTab("basicos");
    setModalOpen(true);
  };

  const handleSave = () => {
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

  // Empresa config CRUD within modal
  const configsForCurrent = editingItem ? empresaConfigs.filter(c => c.descontoTipoId === editingItem.id) : [];

  const saveConfig = () => {
    if (!configForm.empresaId) { toast.error("Selecione uma empresa"); return; }
    if (editingConfig) {
      setEmpresaConfigs(prev => prev.map(c => c.id === editingConfig.id ? { ...editingConfig, ...configForm } as DescontoEmpresaConfig : c));
      toast.success("Configuração atualizada");
    } else {
      const newCfg: DescontoEmpresaConfig = {
        id: `dec${Date.now()}`,
        descontoTipoId: editingItem!.id,
        empresaId: configForm.empresaId!,
        valorPadrao: configForm.valorPadrao ?? 0,
        obrigatorio: configForm.obrigatorio ?? false,
        aplicacao: (configForm.aplicacao as AplicacaoDesconto) ?? "contrato",
        ativo: configForm.ativo ?? true,
        observacoes: configForm.observacoes ?? "",
      };
      setEmpresaConfigs(prev => [...prev, newCfg]);
      toast.success("Empresa vinculada");
    }
    setEditingConfig(null);
    setConfigForm({});
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
          { key: "empresaNome", header: "Empresa", render: (row) => (
            <span>{row.empresaNome} {row.totalEmpresas > 1 && <span className="text-xs text-muted-foreground ml-1">(+{row.totalEmpresas - 1})</span>}</span>
          )},
          { key: "valorPadrao", header: "Valor Padrão", render: (row) => {
            if (row.tipo === "percentual") return `${row.valorPadrao.toFixed(2)}%`;
            return `R$ ${row.valorPadrao.toFixed(2)}`;
          }},
          { key: "aplicacao", header: "Aplicação", render: (row) => aplicacaoLabels[row.aplicacao as AplicacaoDesconto] ?? row.aplicacao },
          { key: "obrigatorio", header: "Obrigatório", render: (row) => (
            <Badge variant={row.obrigatorio ? "default" : "outline"}>{row.obrigatorio ? "Sim" : "Não"}</Badge>
          )},
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
        onClose={() => setModalOpen(false)}
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
                <Select value={form.tipo} onValueChange={v => setForm(prev => ({ ...prev, tipo: v as TipoDesconto }))}>
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
          </TabsContent>

          {/* Tab: Config por Empresa */}
          <TabsContent value="empresas" className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => {
                setEditingConfig(null);
                setConfigForm({ empresaId: "", valorPadrao: 0, obrigatorio: false, aplicacao: "contrato", ativo: true, observacoes: "" });
              }}>
                <Plus className="h-4 w-4 mr-1" /> Vincular Empresa
              </Button>
            </div>

            {configForm.empresaId !== undefined && !editingConfig && (
              <div className="border rounded-md p-4 space-y-3 bg-muted/30">
                <p className="text-sm font-medium">Nova Configuração</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Empresa *</Label>
                    <SearchableSelect
                      value={configForm.empresaId ?? ""}
                      onChange={v => setConfigForm(prev => ({ ...prev, empresaId: v }))}
                      placeholder="Selecione"
                      options={empresaAtivas.map(e => ({ id: e.id, label: e.nome }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Valor Padrão</Label>
                    <Input type="number" step="0.01" value={configForm.valorPadrao ?? 0} onChange={e => setConfigForm(prev => ({ ...prev, valorPadrao: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Aplicação</Label>
                    <Select value={configForm.aplicacao as string ?? "contrato"} onValueChange={v => setConfigForm(prev => ({ ...prev, aplicacao: v as AplicacaoDesconto }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contrato">Contrato</SelectItem>
                        <SelectItem value="romaneio">Romaneio</SelectItem>
                        <SelectItem value="ambos">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={configForm.obrigatorio ?? false} onCheckedChange={v => setConfigForm(prev => ({ ...prev, obrigatorio: v }))} />
                    <Label className="text-xs">Obrigatório</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={configForm.ativo ?? true} onCheckedChange={v => setConfigForm(prev => ({ ...prev, ativo: v }))} />
                    <Label className="text-xs">Ativo</Label>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Observações</Label>
                  <Input value={configForm.observacoes ?? ""} onChange={e => setConfigForm(prev => ({ ...prev, observacoes: e.target.value }))} placeholder="Observações..." />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => setConfigForm({})}>Cancelar</Button>
                  <Button size="sm" onClick={saveConfig}>Salvar</Button>
                </div>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Valor Padrão</TableHead>
                  <TableHead>Obrigatório</TableHead>
                  <TableHead>Aplicação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configsForCurrent.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhuma empresa vinculada</TableCell></TableRow>
                )}
                {configsForCurrent.map(cfg => (
                  <>
                    <TableRow key={cfg.id}>
                      <TableCell className="font-medium">{getEmpresaNome(cfg.empresaId)}</TableCell>
                      <TableCell>
                        {form.tipo === "percentual" ? `${cfg.valorPadrao.toFixed(2)}%` : `R$ ${cfg.valorPadrao.toFixed(2)}`}
                      </TableCell>
                      <TableCell><Badge variant={cfg.obrigatorio ? "default" : "outline"}>{cfg.obrigatorio ? "Sim" : "Não"}</Badge></TableCell>
                      <TableCell>{aplicacaoLabels[cfg.aplicacao]}</TableCell>
                      <TableCell><Badge variant={cfg.ativo ? "default" : "secondary"}>{cfg.ativo ? "Ativo" : "Inativo"}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{cfg.observacoes || "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => {
                            setEditingConfig(cfg);
                            setConfigForm({ ...cfg });
                          }}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteConfig(cfg.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {editingConfig?.id === cfg.id && (
                      <TableRow key={`edit-${cfg.id}`}>
                        <TableCell colSpan={7} className="bg-muted/30 p-4">
                          <div className="space-y-3">
                            <p className="text-sm font-medium">Editando: {getEmpresaNome(editingConfig.empresaId)}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Valor Padrão</Label>
                                <Input type="number" step="0.01" value={configForm.valorPadrao ?? 0} onChange={e => setConfigForm(prev => ({ ...prev, valorPadrao: Number(e.target.value) }))} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Aplicação</Label>
                                <Select value={configForm.aplicacao as string} onValueChange={v => setConfigForm(prev => ({ ...prev, aplicacao: v as AplicacaoDesconto }))}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="contrato">Contrato</SelectItem>
                                    <SelectItem value="romaneio">Romaneio</SelectItem>
                                    <SelectItem value="ambos">Ambos</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center gap-4 pt-5">
                                <div className="flex items-center gap-2">
                                  <Switch checked={configForm.obrigatorio ?? false} onCheckedChange={v => setConfigForm(prev => ({ ...prev, obrigatorio: v }))} />
                                  <Label className="text-xs">Obrigatório</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch checked={configForm.ativo ?? true} onCheckedChange={v => setConfigForm(prev => ({ ...prev, ativo: v }))} />
                                  <Label className="text-xs">Ativo</Label>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Observações</Label>
                              <Input value={configForm.observacoes ?? ""} onChange={e => setConfigForm(prev => ({ ...prev, observacoes: e.target.value }))} />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="outline" className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive" onClick={() => { setEditingConfig(null); setConfigForm({}); }}>Cancelar</Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={saveConfig}>Salvar</Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
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
