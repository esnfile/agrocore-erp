import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { CrudModal } from "@/components/CrudModal";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  condicaoDescontoModeloService,
  condicaoDescontoModeloItemService,
} from "@/lib/services";
import type {
  CondicaoDescontoModelo,
  CondicaoDescontoModeloItem,
  TipoCondicaoDesconto,
} from "@/lib/mock-data";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function ModelosCondicoesPage() {
  const { grupoAtual, empresaAtual, filialAtual } = useOrganization();
  const empresaId = empresaAtual?.id ?? "";
  const filialId = filialAtual?.id ?? "";
  const grupoId = grupoAtual?.id ?? "";

  const [modelos, setModelos] = useState<CondicaoDescontoModelo[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState<CondicaoDescontoModelo | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dados");

  // Form fields
  const [descricao, setDescricao] = useState("");
  const [ativo, setAtivo] = useState(true);

  // Itens
  const [itens, setItens] = useState<CondicaoDescontoModeloItem[]>([]);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CondicaoDescontoModeloItem | null>(null);
  const [savingItem, setSavingItem] = useState(false);

  // Item form fields
  const [itemDescricao, setItemDescricao] = useState("");
  const [itemTipo, setItemTipo] = useState<TipoCondicaoDesconto>("PERCENTUAL");
  const [itemValor, setItemValor] = useState("");
  const [itemOrdem, setItemOrdem] = useState("");
  const [itemAutomatico, setItemAutomatico] = useState(false);

  const loadModelos = async () => {
    if (!empresaId || !filialId) return;
    setLoading(true);
    const list = await condicaoDescontoModeloService.listar(empresaId, filialId);
    setModelos(list);
    setLoading(false);
  };

  useEffect(() => { loadModelos(); }, [empresaId, filialId]);

  const openNew = () => {
    setEditingModelo(null);
    setDescricao("");
    setAtivo(true);
    setItens([]);
    setActiveTab("dados");
    setModalOpen(true);
  };

  const openEdit = async (m: CondicaoDescontoModelo) => {
    setEditingModelo(m);
    setDescricao(m.descricao);
    setAtivo(m.ativo);
    const items = await condicaoDescontoModeloItemService.listarPorModelo(m.id);
    setItens(items);
    setActiveTab("dados");
    setModalOpen(true);
  };

  const onSave = async () => {
    if (!descricao.trim()) {
      toast({ title: "Erro", description: "Descrição é obrigatória.", variant: "destructive" });
      return;
    }
    const dup = await condicaoDescontoModeloService.descricaoExiste(descricao, empresaId, filialId, editingModelo?.id);
    if (dup) {
      toast({ title: "Erro", description: "Já existe um modelo com esta descrição.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await condicaoDescontoModeloService.salvar(
        { id: editingModelo?.id, descricao, ativo },
        { grupoId, empresaId, filialId }
      );
      toast({ title: "Sucesso", description: editingModelo ? "Modelo atualizado." : "Modelo criado." });
      setModalOpen(false);
      loadModelos();
    } catch {
      toast({ title: "Erro", description: "Falha ao salvar.", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    await condicaoDescontoModeloService.excluir(deleteId);
    toast({ title: "Sucesso", description: "Modelo excluído." });
    loadModelos();
    setDeleteId(null);
  };

  // Item CRUD
  const openNewItem = () => {
    setEditingItem(null);
    setItemDescricao("");
    setItemTipo("PERCENTUAL");
    setItemValor("");
    setItemOrdem(String(itens.length + 1));
    setItemAutomatico(false);
    setItemModalOpen(true);
  };

  const openEditItem = (item: CondicaoDescontoModeloItem) => {
    setEditingItem(item);
    setItemDescricao(item.descricao);
    setItemTipo(item.tipo);
    setItemValor(String(item.valor));
    setItemOrdem(String(item.ordemCalculo));
    setItemAutomatico(item.automatico);
    setItemModalOpen(true);
  };

  const onSaveItem = async () => {
    if (!itemDescricao.trim()) {
      toast({ title: "Erro", description: "Descrição é obrigatória.", variant: "destructive" });
      return;
    }
    if (!itemValor || isNaN(Number(itemValor)) || Number(itemValor) <= 0) {
      toast({ title: "Erro", description: "Valor deve ser > 0.", variant: "destructive" });
      return;
    }
    if (!editingModelo) return;
    setSavingItem(true);
    try {
      await condicaoDescontoModeloItemService.salvar(
        {
          id: editingItem?.id,
          modeloId: editingModelo.id,
          descricao: itemDescricao,
          tipo: itemTipo,
          valor: Number(itemValor),
          ordemCalculo: Number(itemOrdem) || 1,
          automatico: itemAutomatico,
        },
        { grupoId, empresaId, filialId }
      );
      toast({ title: "Sucesso", description: editingItem ? "Item atualizado." : "Item adicionado." });
      setItemModalOpen(false);
      const items = await condicaoDescontoModeloItemService.listarPorModelo(editingModelo.id);
      setItens(items);
    } catch {
      toast({ title: "Erro", description: "Falha ao salvar item.", variant: "destructive" });
    } finally { setSavingItem(false); }
  };

  const onDeleteItem = async (id: string) => {
    if (!editingModelo) return;
    await condicaoDescontoModeloItemService.excluir(id);
    toast({ title: "Sucesso", description: "Item excluído." });
    const items = await condicaoDescontoModeloItemService.listarPorModelo(editingModelo.id);
    setItens(items);
  };

  if (!grupoId) {
    return (
      <>
        <PageHeader title="Modelos de Condições" description="Modelos reutilizáveis de condições comerciais" />
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Selecione um Grupo para visualizar modelos.
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Modelos de Condições" description="Modelos reutilizáveis de condições comerciais (descontos e ajustes)" />

      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Novo Modelo</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modelos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Nenhum modelo cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                modelos.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.descricao}</TableCell>
                    <TableCell>
                      <Badge variant={m.ativo ? "default" : "secondary"}>
                        {m.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(m.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal Modelo */}
      <CrudModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingModelo ? "Editar Modelo de Condições" : "Novo Modelo de Condições"}
        saving={saving}
        onSave={onSave}
        maxWidth="sm:max-w-4xl"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="dados">Dados Gerais</TabsTrigger>
              <TabsTrigger value="itens" disabled={!editingModelo}>Itens do Modelo</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Label htmlFor="modelo-ativo" className="text-sm">Ativo</Label>
              <Switch id="modelo-ativo" checked={ativo} onCheckedChange={setAtivo} />
            </div>
          </div>

          <TabsContent value="dados">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Descrição <span className="text-destructive">*</span></Label>
                <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={150} placeholder="Ex: Soja Padrão Trading" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="itens">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={openNewItem}>
                  <Plus className="mr-2 h-4 w-4" />Novo Item
                </Button>
              </div>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ordem</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Automático</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itens.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhum item cadastrado neste modelo.
                        </TableCell>
                      </TableRow>
                    ) : (
                      itens.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.ordemCalculo}</TableCell>
                          <TableCell className="font-medium">{item.descricao}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {item.tipo === "PERCENTUAL" ? "%" : "R$"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {item.tipo === "PERCENTUAL"
                              ? `${item.valor.toFixed(2)}%`
                              : `R$ ${item.valor.toFixed(2)}`}
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.automatico ? "default" : "secondary"}>
                              {item.automatico ? "Sim" : "Não"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditItem(item)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => onDeleteItem(item.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CrudModal>

      {/* Item Modal */}
      <CrudModal
        open={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title={editingItem ? "Editar Item" : "Novo Item"}
        saving={savingItem}
        onSave={onSaveItem}
        maxWidth="sm:max-w-xl"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Descrição <span className="text-destructive">*</span></Label>
            <Input value={itemDescricao} onChange={(e) => setItemDescricao(e.target.value)} maxLength={150} placeholder="Ex: FUNRURAL" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo <span className="text-destructive">*</span></Label>
              <Select value={itemTipo} onValueChange={(v) => setItemTipo(v as TipoCondicaoDesconto)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTUAL">Percentual (%)</SelectItem>
                  <SelectItem value="VALOR_FIXO">Valor Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Valor <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                step="0.000001"
                value={itemValor}
                onChange={(e) => setItemValor(e.target.value)}
                placeholder={itemTipo === "PERCENTUAL" ? "Ex: 1.50" : "Ex: 2.00"}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ordem de Cálculo</Label>
              <Input
                type="number"
                value={itemOrdem}
                onChange={(e) => setItemOrdem(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={itemAutomatico} onCheckedChange={setItemAutomatico} id="item-automatico" />
            <Label htmlFor="item-automatico">Automático (valor travado no contrato)</Label>
          </div>
        </div>
      </CrudModal>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Modelo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este modelo de condições?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
