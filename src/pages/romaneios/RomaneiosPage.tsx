import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { CrudModal } from "@/components/CrudModal";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  romaneioService, romaneioPesagemService,
  motoristaService, veiculoService, contratoService,
} from "@/lib/services";
import {
  produtos as mockProdutos,
} from "@/lib/mock-data";
import type { Romaneio, RomaneioPesagem, Motorista, Veiculo, Contrato, TipoPesagem } from "@/lib/mock-data";
import { Plus, Eye, Scale, XCircle, CheckCircle, Search } from "lucide-react";

const romaneioSchema = z.object({
  produtoId: z.string().min(1, "Produto é obrigatório"),
  contratoId: z.string().optional(),
  motoristaNome: z.string().min(1, "Nome do motorista é obrigatório"),
  motoristaDocumento: z.string().optional().default(""),
  placaVeiculo: z.string().min(1, "Placa é obrigatória"),
  observacao: z.string().optional().default(""),
});
type RomaneioFormData = z.infer<typeof romaneioSchema>;

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ABERTO: "default",
  FINALIZADO: "outline",
  AGUARDANDO_CONTRATO: "secondary",
  CANCELADO: "destructive",
};

const statusLabels: Record<string, string> = {
  ABERTO: "Aberto",
  FINALIZADO: "Finalizado",
  AGUARDANDO_CONTRATO: "Aguard. Contrato",
  CANCELADO: "Cancelado",
};

export default function RomaneiosPage() {
  const { empresaAtual, filialAtual, grupoAtual } = useOrganization();
  const [romaneios, setRomaneios] = useState<Romaneio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Detail view
  const [selected, setSelected] = useState<Romaneio | null>(null);
  const [pesagens, setPesagens] = useState<RomaneioPesagem[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);

  // Pesagem dialog
  const [pesagemOpen, setPesagemOpen] = useState(false);
  const [pesagemTipo, setPesagemTipo] = useState<TipoPesagem>("ENTRADA");
  const [pesagemPeso, setPesagemPeso] = useState("");

  // Quick search
  const [motoristaSuggestions, setMotoristaSuggestions] = useState<Motorista[]>([]);
  const [veiculoSuggestions, setVeiculoSuggestions] = useState<Veiculo[]>([]);
  const [showMotSugg, setShowMotSugg] = useState(false);
  const [showVeicSugg, setShowVeicSugg] = useState(false);

  // Quick register dialogs
  const [quickMotOpen, setQuickMotOpen] = useState(false);
  const [quickMotNome, setQuickMotNome] = useState("");
  const [quickMotDoc, setQuickMotDoc] = useState("");
  const [quickVeicOpen, setQuickVeicOpen] = useState(false);
  const [quickVeicPlaca, setQuickVeicPlaca] = useState("");
  const [quickVeicTipo, setQuickVeicTipo] = useState("");

  const [contratos, setContratos] = useState<Contrato[]>([]);

  const form = useForm<RomaneioFormData>({
    resolver: zodResolver(romaneioSchema),
    defaultValues: { produtoId: "", contratoId: "", motoristaNome: "", motoristaDocumento: "", placaVeiculo: "", observacao: "" },
  });

  const ctx = grupoAtual && empresaAtual && filialAtual
    ? { grupoId: grupoAtual.id, empresaId: empresaAtual.id, filialId: filialAtual.id }
    : null;

  const load = useCallback(async () => {
    if (!empresaAtual || !filialAtual) return;
    setLoading(true);
    const data = await romaneioService.listar(empresaAtual.id, filialAtual.id);
    setRomaneios(data);
    setLoading(false);
  }, [empresaAtual, filialAtual]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!empresaAtual || !filialAtual) return;
    contratoService.listar(empresaAtual.id, filialAtual.id).then(setContratos);
  }, [empresaAtual, filialAtual]);

  const produtos = mockProdutos.filter((p) => p.deletadoEm === null);

  const openNew = () => {
    form.reset({ produtoId: "", contratoId: "", motoristaNome: "", motoristaDocumento: "", placaVeiculo: "", observacao: "" });
    setModalOpen(true);
  };

  // Motorista search
  const searchMotorista = async (termo: string) => {
    form.setValue("motoristaNome", termo);
    if (!ctx || termo.length < 2) { setShowMotSugg(false); return; }
    const results = await motoristaService.buscarPorNome(ctx.empresaId, ctx.filialId, termo);
    setMotoristaSuggestions(results);
    setShowMotSugg(results.length > 0);
  };

  const selectMotorista = (m: Motorista) => {
    form.setValue("motoristaNome", m.nome);
    form.setValue("motoristaDocumento", m.documento);
    setShowMotSugg(false);
  };

  // Veículo search
  const searchVeiculo = async (termo: string) => {
    form.setValue("placaVeiculo", termo.toUpperCase());
    if (!ctx || termo.length < 2) { setShowVeicSugg(false); return; }
    const results = await veiculoService.buscarPorPlaca(ctx.empresaId, ctx.filialId, termo);
    setVeiculoSuggestions(results);
    setShowVeicSugg(results.length > 0);
  };

  const selectVeiculo = (v: Veiculo) => {
    form.setValue("placaVeiculo", v.placa);
    setShowVeicSugg(false);
  };

  // Quick register motorista
  const quickRegisterMotorista = async () => {
    if (!ctx || !quickMotNome) return;
    const m = await motoristaService.salvar({ nome: quickMotNome, documento: quickMotDoc }, ctx);
    form.setValue("motoristaNome", m.nome);
    form.setValue("motoristaDocumento", m.documento);
    setQuickMotOpen(false);
    setQuickMotNome("");
    setQuickMotDoc("");
    toast({ title: "Motorista cadastrado rapidamente" });
  };

  // Quick register veículo
  const quickRegisterVeiculo = async () => {
    if (!ctx || !quickVeicPlaca) return;
    const v = await veiculoService.salvar({ placa: quickVeicPlaca.toUpperCase(), tipoVeiculo: quickVeicTipo }, ctx);
    form.setValue("placaVeiculo", v.placa);
    setQuickVeicOpen(false);
    setQuickVeicPlaca("");
    setQuickVeicTipo("");
    toast({ title: "Veículo cadastrado rapidamente" });
  };

  const onSubmit = async (data: RomaneioFormData) => {
    if (!ctx) return;
    await romaneioService.salvar({
      produtoId: data.produtoId,
      contratoId: data.contratoId || null,
      motoristaNome: data.motoristaNome,
      motoristaDocumento: data.motoristaDocumento,
      placaVeiculo: data.placaVeiculo,
      observacao: data.observacao,
    }, ctx);
    toast({ title: "Romaneio criado com sucesso" });
    setModalOpen(false);
    load();
  };

  const openDetail = async (rom: Romaneio) => {
    setSelected(rom);
    const p = await romaneioPesagemService.listarPorRomaneio(rom.id);
    setPesagens(p);
    setDetailOpen(true);
  };

  const refreshDetail = async () => {
    if (!selected) return;
    const updated = await romaneioService.obterPorId(selected.id);
    if (updated) setSelected(updated);
    const p = await romaneioPesagemService.listarPorRomaneio(selected.id);
    setPesagens(p);
    load();
  };

  const addPesagem = async () => {
    if (!selected || !ctx || !pesagemPeso) return;
    const peso = parseFloat(pesagemPeso);
    if (isNaN(peso) || peso <= 0) { toast({ title: "Peso inválido", variant: "destructive" }); return; }
    await romaneioPesagemService.salvar({ romaneioId: selected.id, tipoPesagem: pesagemTipo, peso }, ctx);
    toast({ title: `Pesagem de ${pesagemTipo === "ENTRADA" ? "entrada" : "saída"} registrada` });
    setPesagemOpen(false);
    setPesagemPeso("");
    refreshDetail();
  };

  const finalizarRomaneio = async () => {
    if (!selected) return;
    if (pesagens.length < 2) { toast({ title: "É necessário pelo menos 2 pesagens (entrada e saída)", variant: "destructive" }); return; }
    await romaneioService.finalizar(selected.id);
    toast({ title: "Romaneio finalizado" });
    refreshDetail();
  };

  const cancelarRomaneio = async () => {
    if (!selected) return;
    await romaneioService.cancelar(selected.id);
    toast({ title: "Romaneio cancelado" });
    refreshDetail();
  };

  const onDelete = async () => {
    if (!deleteId) return;
    await romaneioService.excluir(deleteId);
    toast({ title: "Romaneio excluído" });
    setDeleteId(null);
    load();
  };

  const getProdutoNome = (id: string) => produtos.find((p) => p.id === id)?.descricao || id;
  const getContratoNum = (id: string | null) => {
    if (!id) return "—";
    const c = contratos.find((ct) => ct.id === id);
    return c ? c.numeroContrato : id;
  };

  const columns: Column<Romaneio>[] = [
    { header: "ID", accessor: "id", render: (v) => v.substring(0, 8) },
    { header: "Produto", accessor: "produtoId", render: (v) => getProdutoNome(v) },
    { header: "Contrato", accessor: "contratoId", render: (v) => getContratoNum(v) },
    { header: "Motorista", accessor: "motoristaNome" },
    { header: "Placa", accessor: "placaVeiculo" },
    { header: "Peso Líq. (ton)", accessor: "pesoLiquido", render: (v) => v > 0 ? v.toFixed(3) : "—" },
    {
      header: "Status", accessor: "status",
      render: (v) => <Badge variant={statusColors[v] || "default"}>{statusLabels[v] || v}</Badge>,
    },
    {
      header: "Data", accessor: "criadoEm",
      render: (v) => format(new Date(v), "dd/MM/yyyy HH:mm"),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Romaneios" description="Gestão de romaneios e pesagens" onNew={openNew} />

      <DataTable
        columns={columns}
        data={romaneios}
        loading={loading}
        onEdit={(item) => openDetail(item)}
        onDelete={(item) => item.status !== "FINALIZADO" && setDeleteId(item.id)}
        actions={(item) => (
          <Button variant="ghost" size="icon" onClick={() => openDetail(item)} title="Detalhes">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      />

      {/* New Romaneio Modal */}
      <CrudModal open={modalOpen} onOpenChange={setModalOpen} title="Novo Romaneio" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <Label>Produto *</Label>
            <Select value={form.watch("produtoId")} onValueChange={(v) => form.setValue("produtoId", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
              <SelectContent>
                {produtos.map((p) => <SelectItem key={p.id} value={p.id}>{p.descricao}</SelectItem>)}
              </SelectContent>
            </Select>
            {form.formState.errors.produtoId && <p className="text-sm text-destructive mt-1">{form.formState.errors.produtoId.message}</p>}
          </div>

          <div>
            <Label>Contrato (opcional)</Label>
            <Select value={form.watch("contratoId") || "none"} onValueChange={(v) => form.setValue("contratoId", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Sem contrato (avulso)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem contrato (avulso)</SelectItem>
                {contratos.filter((c) => c.status === "ATIVO" || c.status === "PARCIALMENTE_ENTREGUE").map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.numeroContrato} — {c.tipoContrato}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Motorista with search */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label>Motorista *</Label>
                <div className="relative">
                  <Input
                    value={form.watch("motoristaNome")}
                    onChange={(e) => searchMotorista(e.target.value)}
                    placeholder="Digite o nome do motorista"
                    onBlur={() => setTimeout(() => setShowMotSugg(false), 200)}
                  />
                  {showMotSugg && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
                      {motoristaSuggestions.map((m) => (
                        <button key={m.id} className="w-full text-left px-3 py-2 text-sm hover:bg-accent" onClick={() => selectMotorista(m)}>
                          {m.nome} {m.documento && `— ${m.documento}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button type="button" variant="outline" size="icon" className="mt-5" onClick={() => { setQuickMotNome(form.watch("motoristaNome")); setQuickMotOpen(true); }} title="Cadastro rápido">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.formState.errors.motoristaNome && <p className="text-sm text-destructive mt-1">{form.formState.errors.motoristaNome.message}</p>}
          </div>

          <div>
            <Label>Documento do Motorista</Label>
            <Input {...form.register("motoristaDocumento")} />
          </div>

          {/* Veículo with search */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label>Placa do Veículo *</Label>
                <div className="relative">
                  <Input
                    value={form.watch("placaVeiculo")}
                    onChange={(e) => searchVeiculo(e.target.value)}
                    placeholder="Digite a placa"
                    onBlur={() => setTimeout(() => setShowVeicSugg(false), 200)}
                  />
                  {showVeicSugg && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
                      {veiculoSuggestions.map((v) => (
                        <button key={v.id} className="w-full text-left px-3 py-2 text-sm hover:bg-accent" onClick={() => selectVeiculo(v)}>
                          {v.placa} {v.tipoVeiculo && `— ${v.tipoVeiculo}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button type="button" variant="outline" size="icon" className="mt-5" onClick={() => { setQuickVeicPlaca(form.watch("placaVeiculo")); setQuickVeicOpen(true); }} title="Cadastro rápido">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.formState.errors.placaVeiculo && <p className="text-sm text-destructive mt-1">{form.formState.errors.placaVeiculo.message}</p>}
          </div>

          <div>
            <Label>Observação</Label>
            <Textarea {...form.register("observacao")} rows={2} />
          </div>
        </div>
      </CrudModal>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Romaneio {selected?.id.substring(0, 8)}</DialogTitle>
          </DialogHeader>
          {selected && (
            <Tabs defaultValue="geral">
              <TabsList>
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="pesagens">Pesagens</TabsTrigger>
              </TabsList>

              <TabsContent value="geral" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Produto</CardTitle></CardHeader>
                    <CardContent><p className="font-medium">{getProdutoNome(selected.produtoId)}</p></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Contrato</CardTitle></CardHeader>
                    <CardContent><p className="font-medium">{getContratoNum(selected.contratoId)}</p></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Motorista</CardTitle></CardHeader>
                    <CardContent><p className="font-medium">{selected.motoristaNome}</p><p className="text-sm text-muted-foreground">{selected.motoristaDocumento || "—"}</p></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Veículo</CardTitle></CardHeader>
                    <CardContent><p className="font-medium">{selected.placaVeiculo}</p></CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Peso Bruto</CardTitle></CardHeader>
                    <CardContent><p className="text-xl font-bold">{selected.pesoBruto > 0 ? `${selected.pesoBruto.toFixed(3)} ton` : "—"}</p></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Peso Tara</CardTitle></CardHeader>
                    <CardContent><p className="text-xl font-bold">{selected.pesoTara > 0 ? `${selected.pesoTara.toFixed(3)} ton` : "—"}</p></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Peso Líquido</CardTitle></CardHeader>
                    <CardContent><p className="text-xl font-bold text-primary">{selected.pesoLiquido > 0 ? `${selected.pesoLiquido.toFixed(3)} ton` : "—"}</p></CardContent>
                  </Card>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={statusColors[selected.status]}>{statusLabels[selected.status]}</Badge>
                  <span className="text-sm text-muted-foreground">Criado em {format(new Date(selected.criadoEm), "dd/MM/yyyy HH:mm")}</span>
                </div>

                {selected.observacao && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Observação</CardTitle></CardHeader>
                    <CardContent><p>{selected.observacao}</p></CardContent>
                  </Card>
                )}

                {selected.status === "ABERTO" && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={finalizarRomaneio} className="gap-2"><CheckCircle className="h-4 w-4" /> Finalizar</Button>
                    <Button variant="destructive" onClick={cancelarRomaneio} className="gap-2"><XCircle className="h-4 w-4" /> Cancelar</Button>
                  </div>
                )}
                {selected.status === "AGUARDANDO_CONTRATO" && (
                  <div className="flex gap-2 pt-4">
                    <Button variant="destructive" onClick={cancelarRomaneio} className="gap-2"><XCircle className="h-4 w-4" /> Cancelar</Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pesagens" className="space-y-4">
                {(selected.status === "ABERTO" || selected.status === "AGUARDANDO_CONTRATO") && (
                  <Button onClick={() => setPesagemOpen(true)} className="gap-2"><Scale className="h-4 w-4" /> Registrar Pesagem</Button>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Peso (ton)</TableHead>
                      <TableHead>Data/Hora</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pesagens.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Nenhuma pesagem registrada</TableCell></TableRow>
                    ) : (
                      pesagens.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell><Badge variant={p.tipoPesagem === "ENTRADA" ? "default" : "secondary"}>{p.tipoPesagem}</Badge></TableCell>
                          <TableCell className="font-mono">{p.peso.toFixed(3)}</TableCell>
                          <TableCell>{format(new Date(p.dataHora), "dd/MM/yyyy HH:mm:ss")}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Pesagem Dialog */}
      <Dialog open={pesagemOpen} onOpenChange={setPesagemOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Pesagem</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo de Pesagem</Label>
              <Select value={pesagemTipo} onValueChange={(v) => setPesagemTipo(v as TipoPesagem)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRADA">Entrada</SelectItem>
                  <SelectItem value="SAIDA">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Peso (toneladas)</Label>
              <Input type="number" step="0.001" min="0" value={pesagemPeso} onChange={(e) => setPesagemPeso(e.target.value)} placeholder="0.000" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPesagemOpen(false)}>Cancelar</Button>
            <Button onClick={addPesagem}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Motorista Register */}
      <Dialog open={quickMotOpen} onOpenChange={setQuickMotOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cadastro Rápido — Motorista</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome *</Label><Input value={quickMotNome} onChange={(e) => setQuickMotNome(e.target.value)} /></div>
            <div><Label>Documento</Label><Input value={quickMotDoc} onChange={(e) => setQuickMotDoc(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickMotOpen(false)}>Cancelar</Button>
            <Button onClick={quickRegisterMotorista} disabled={!quickMotNome}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Veículo Register */}
      <Dialog open={quickVeicOpen} onOpenChange={setQuickVeicOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cadastro Rápido — Veículo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Placa *</Label><Input value={quickVeicPlaca} onChange={(e) => setQuickVeicPlaca(e.target.value.toUpperCase())} /></div>
            <div><Label>Tipo de Veículo</Label><Input value={quickVeicTipo} onChange={(e) => setQuickVeicTipo(e.target.value)} placeholder="Ex: Carreta, Truck" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickVeicOpen(false)}>Cancelar</Button>
            <Button onClick={quickRegisterVeiculo} disabled={!quickVeicPlaca}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
