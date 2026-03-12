import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { CrudModal } from "@/components/CrudModal";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  contratoService, contratoEntregaService, contratoFixacaoService,
  pontoEstoqueService, moedaService,
  condicaoDescontoModeloService, contratoCondicaoService,
  classificacaoTipoService, produtoClassificacaoService,
  classificacaoDescontoService, romaneioClassificacaoService,
} from "@/lib/services";
import {
  pessoas as mockPessoas,
  produtos as mockProdutos,
  unidadesMedida as mockUnidades,
  moedas as mockMoedas,
} from "@/lib/mock-data";
import type {
  Contrato, ContratoEntrega, ContratoFixacao,
  PontoEstoque, Moeda,
  CondicaoDescontoModelo, ContratoCondicao, TipoCondicaoDesconto,
  ClassificacaoTipo, ProdutoClassificacao, RomaneioClassificacao,
} from "@/lib/mock-data";
import { Plus, Pencil, Trash2, Eye, Lock } from "lucide-react";

// ---- Schemas ----
const contratoSchema = z.object({
  numeroContrato: z.string().min(1, "Número é obrigatório"),
  tipoContrato: z.enum(["COMPRA", "VENDA"]),
  pessoaId: z.string().min(1, "Parceiro é obrigatório"),
  produtoId: z.string().min(1, "Produto é obrigatório"),
  unidadeNegociacaoId: z.string().min(1, "Unidade é obrigatória"),
  quantidadeTotal: z.coerce.number().positive("Quantidade deve ser > 0"),
  moedaId: z.string().min(1, "Moeda é obrigatória"),
  precoUnitario: z.coerce.number().min(0),
  tipoPreco: z.enum(["FIXO", "A_FIXAR"]),
  dataContrato: z.string().min(1, "Data é obrigatória"),
  dataEntregaInicio: z.string().optional(),
  dataEntregaFim: z.string().optional(),
  observacoes: z.string().optional(),
});
type ContratoForm = z.infer<typeof contratoSchema>;

const entregaSchema = z.object({
  dataEntrega: z.string().min(1, "Data é obrigatória"),
  quantidadeInformada: z.coerce.number().positive("Quantidade deve ser > 0"),
  unidadeInformadaId: z.string().min(1, "Unidade é obrigatória"),
  pontoEstoqueId: z.string().min(1, "Ponto de estoque é obrigatório"),
  pesoBruto: z.coerce.number().optional(),
  pesoLiquido: z.coerce.number().optional(),
  placaVeiculo: z.string().optional(),
  nomeMotorista: z.string().optional(),
  documentoMotorista: z.string().optional(),
  observacoes: z.string().optional(),
});
type EntregaForm = z.infer<typeof entregaSchema>;

const fixacaoSchema = z.object({
  dataFixacao: z.string().min(1, "Data é obrigatória"),
  quantidadeFixada: z.coerce.number().positive("Quantidade deve ser > 0"),
  unidadeFixacaoId: z.string().min(1, "Unidade é obrigatória"),
  precoFixado: z.coerce.number().positive("Preço deve ser > 0"),
  moedaId: z.string().min(1, "Moeda é obrigatória"),
  observacoes: z.string().optional(),
});
type FixacaoForm = z.infer<typeof fixacaoSchema>;

// ---- Status Badge ----
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    ABERTO: { label: "Aberto", variant: "default" },
    PARCIAL: { label: "Parcial", variant: "secondary" },
    FINALIZADO: { label: "Finalizado", variant: "outline" },
    CANCELADO: { label: "Cancelado", variant: "destructive" },
  };
  const s = map[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export default function ContratosPage() {
  const { grupoAtual, empresaAtual, filialAtual } = useOrganization();
  const empresaId = empresaAtual?.id ?? "";
  const filialId = filialAtual?.id ?? "";
  const grupoId = grupoAtual?.id ?? "";

  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContrato, setEditingContrato] = useState<Contrato | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dados");

  // Sub-entities
  const [entregas, setEntregas] = useState<ContratoEntrega[]>([]);
  const [fixacoes, setFixacoes] = useState<ContratoFixacao[]>([]);
  const [pontos, setPontos] = useState<PontoEstoque[]>([]);
  const [moedas, setMoedas] = useState<Moeda[]>([]);

  // Entrega modal
  const [entregaModalOpen, setEntregaModalOpen] = useState(false);
  const [editingEntrega, setEditingEntrega] = useState<ContratoEntrega | null>(null);
  const [savingEntrega, setSavingEntrega] = useState(false);

  // Fixacao modal
  const [fixacaoModalOpen, setFixacaoModalOpen] = useState(false);
  const [editingFixacao, setEditingFixacao] = useState<ContratoFixacao | null>(null);
  const [savingFixacao, setSavingFixacao] = useState(false);

  // Condições financeiras
  const [condicoes, setCondicoes] = useState<ContratoCondicao[]>([]);
  const [modelosCondicao, setModelosCondicao] = useState<CondicaoDescontoModelo[]>([]);
  const [condicaoModalOpen, setCondicaoModalOpen] = useState(false);
  const [editingCondicao, setEditingCondicao] = useState<ContratoCondicao | null>(null);
  const [savingCondicao, setSavingCondicao] = useState(false);
  const [condDescricao, setCondDescricao] = useState("");
  const [condTipo, setCondTipo] = useState<TipoCondicaoDesconto>("PERCENTUAL");
  const [condValor, setCondValor] = useState("");
  const [condOrdem, setCondOrdem] = useState("");
  const [condAutomatico, setCondAutomatico] = useState(false);

  // Classificação de grãos
  const [classificacaoTipos, setClassificacaoTipos] = useState<ClassificacaoTipo[]>([]);
  const [produtoClassificacoes, setProdutoClassificacoes] = useState<ProdutoClassificacao[]>([]);
  const [romaneioClassificacoesMap, setRomaneioClassificacoesMap] = useState<Record<string, RomaneioClassificacao[]>>({});
  const [classEntregaItens, setClassEntregaItens] = useState<{ classificacaoTipoId: string; valorApurado: string }[]>([]);

  // Forms
  const contratoForm = useForm<ContratoForm>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      numeroContrato: "", tipoContrato: "COMPRA", pessoaId: "", produtoId: "",
      unidadeNegociacaoId: "", quantidadeTotal: 0, moedaId: "moeda1",
      precoUnitario: 0, tipoPreco: "FIXO",
      dataContrato: new Date().toISOString().slice(0, 10),
      dataEntregaInicio: "", dataEntregaFim: "", observacoes: "",
    },
  });

  const entregaForm = useForm<EntregaForm>({
    resolver: zodResolver(entregaSchema),
    defaultValues: {
      dataEntrega: new Date().toISOString().slice(0, 16),
      quantidadeInformada: 0, unidadeInformadaId: "", pontoEstoqueId: "",
      pesoBruto: undefined, pesoLiquido: undefined,
      placaVeiculo: "", nomeMotorista: "", documentoMotorista: "", observacoes: "",
    },
  });

  const fixacaoForm = useForm<FixacaoForm>({
    resolver: zodResolver(fixacaoSchema),
    defaultValues: {
      dataFixacao: new Date().toISOString().slice(0, 16),
      quantidadeFixada: 0, unidadeFixacaoId: "", precoFixado: 0,
      moedaId: "moeda1", observacoes: "",
    },
  });

  const tipoPrecoWatch = contratoForm.watch("tipoPreco");

  // Load data
  const loadContratos = async () => {
    if (!empresaId || !filialId) return;
    setLoading(true);
    const list = await contratoService.listar(empresaId, filialId);
    setContratos(list);
    setLoading(false);
  };

  useEffect(() => { loadContratos(); }, [empresaId, filialId]);

  useEffect(() => {
    if (empresaId && filialId) {
      pontoEstoqueService.listar(empresaId, filialId).then(setPontos);
      condicaoDescontoModeloService.listar(empresaId, filialId).then(setModelosCondicao);
    }
    moedaService.listar().then(setMoedas);
    classificacaoTipoService.listarTodos().then(setClassificacaoTipos);
  }, [empresaId, filialId]);

  const pessoasAtivas = useMemo(
    () => mockPessoas.filter((p) => p.deletadoEm === null && p.ativo && p.empresaId === empresaId),
    [empresaId]
  );
  const produtosAtivos = useMemo(
    () => mockProdutos.filter((p) => p.deletadoEm === null && p.ativo && p.empresaId === empresaId),
    [empresaId]
  );
  const unidadesAtivas = useMemo(
    () => mockUnidades.filter((u) => u.deletadoEm === null && u.ativo),
    []
  );

  // Helpers
  const getNomePessoa = (id: string) => mockPessoas.find((p) => p.id === id)?.nomeRazao ?? id;
  const getNomeProduto = (id: string) => mockProdutos.find((p) => p.id === id)?.descricao ?? id;
  const getCodigoUnidade = (id: string) => mockUnidades.find((u) => u.id === id)?.codigo ?? id;
  const getSimboloMoeda = (id: string) => mockMoedas.find((m) => m.id === id)?.simbolo ?? "";
  const getCodigoMoeda = (id: string) => mockMoedas.find((m) => m.id === id)?.codigo ?? id;

  // ---- Contrato CRUD ----
  const openNew = () => {
    setEditingContrato(null);
    setViewOnly(false);
    contratoForm.reset({
      numeroContrato: "", tipoContrato: "COMPRA", pessoaId: "", produtoId: "",
      unidadeNegociacaoId: "", quantidadeTotal: 0, moedaId: "moeda1",
      precoUnitario: 0, tipoPreco: "FIXO",
      dataContrato: new Date().toISOString().slice(0, 10),
      dataEntregaInicio: "", dataEntregaFim: "", observacoes: "",
    });
    setEntregas([]);
    setFixacoes([]);
    setActiveTab("dados");
    setModalOpen(true);
  };

  const openEdit = (c: Contrato) => {
    setEditingContrato(c);
    setViewOnly(false);
    contratoForm.reset({
      numeroContrato: c.numeroContrato,
      tipoContrato: c.tipoContrato,
      pessoaId: c.pessoaId,
      produtoId: c.produtoId,
      unidadeNegociacaoId: c.unidadeNegociacaoId,
      quantidadeTotal: c.quantidadeTotal,
      moedaId: c.moedaId,
      precoUnitario: c.precoUnitario,
      tipoPreco: c.tipoPreco,
      dataContrato: c.dataContrato,
      dataEntregaInicio: c.dataEntregaInicio,
      dataEntregaFim: c.dataEntregaFim,
      observacoes: c.observacoes,
    });
    loadSubEntities(c.id);
    setActiveTab("dados");
    setModalOpen(true);
  };

  const openView = (c: Contrato) => {
    openEdit(c);
    setViewOnly(true);
  };

  const loadSubEntities = async (contratoId: string) => {
    const [e, f, conds] = await Promise.all([
      contratoEntregaService.listarPorContrato(contratoId),
      contratoFixacaoService.listarPorContrato(contratoId),
      contratoCondicaoService.listarPorContrato(contratoId),
    ]);
    setEntregas(e);
    setFixacoes(f);
    setCondicoes(conds);
  };

  const onSaveContrato = contratoForm.handleSubmit(async (data) => {
    if (!grupoId || !empresaId || !filialId) return;
    setSaving(true);
    try {
      await contratoService.salvar(
        { ...data, id: editingContrato?.id },
        { grupoId, empresaId, filialId }
      );
      toast({ title: "Sucesso", description: editingContrato ? "Contrato atualizado." : "Contrato criado." });
      setModalOpen(false);
      loadContratos();
    } catch {
      toast({ title: "Erro", description: "Falha ao salvar contrato.", variant: "destructive" });
    } finally { setSaving(false); }
  });

  const onDeleteContrato = async () => {
    if (!deleteId) return;
    const result = await contratoService.excluir(deleteId);
    if (result.sucesso) {
      toast({ title: "Sucesso", description: result.mensagem });
      loadContratos();
    } else {
      toast({ title: "Erro", description: result.mensagem, variant: "destructive" });
    }
    setDeleteId(null);
  };

  // ---- Entrega CRUD ----
  const openNewEntrega = () => {
    setEditingEntrega(null);
    entregaForm.reset({
      dataEntrega: new Date().toISOString().slice(0, 16),
      quantidadeInformada: 0, unidadeInformadaId: editingContrato?.unidadeNegociacaoId ?? "",
      pontoEstoqueId: "", pesoBruto: undefined, pesoLiquido: undefined,
      placaVeiculo: "", nomeMotorista: "", documentoMotorista: "", observacoes: "",
    });
    // Load product classifications for this contract's product
    if (editingContrato?.produtoId) {
      produtoClassificacaoService.listarPorProduto(editingContrato.produtoId).then((pcs) => {
        setProdutoClassificacoes(pcs);
        setClassEntregaItens(pcs.filter((pc) => pc.ativo).map((pc) => ({
          classificacaoTipoId: pc.classificacaoTipoId,
          valorApurado: String(pc.valorPadrao),
        })));
      });
    }
    setEntregaModalOpen(true);
  };

  const openEditEntrega = (e: ContratoEntrega) => {
    setEditingEntrega(e);
    entregaForm.reset({
      dataEntrega: e.dataEntrega.slice(0, 16),
      quantidadeInformada: e.quantidadeInformada,
      unidadeInformadaId: e.unidadeInformadaId,
      pontoEstoqueId: e.pontoEstoqueId,
      pesoBruto: e.pesoBruto ?? undefined,
      pesoLiquido: e.pesoLiquido ?? undefined,
      placaVeiculo: e.placaVeiculo,
      nomeMotorista: e.nomeMotorista,
      documentoMotorista: e.documentoMotorista,
      observacoes: e.observacoes,
    });
    setEntregaModalOpen(true);
  };

  const onSaveEntrega = entregaForm.handleSubmit(async (data) => {
    if (!editingContrato) return;
    setSavingEntrega(true);
    try {
      const result = await contratoEntregaService.salvar(
        { ...data, contratoId: editingContrato.id, id: editingEntrega?.id },
        { grupoId, empresaId, filialId }
      );
      if (result.sucesso) {
        toast({ title: "Sucesso", description: result.mensagem });
        setEntregaModalOpen(false);
        await loadSubEntities(editingContrato.id);
        await loadContratos();
        // Refresh editing contrato
        const updated = (await contratoService.listar(empresaId, filialId)).find((c) => c.id === editingContrato.id);
        if (updated) setEditingContrato(updated);
      } else {
        toast({ title: "Erro", description: result.mensagem, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro", description: "Falha ao salvar romaneio.", variant: "destructive" });
    } finally { setSavingEntrega(false); }
  });

  const onDeleteEntrega = async (id: string) => {
    if (!editingContrato) return;
    const result = await contratoEntregaService.excluir(id);
    if (result.sucesso) {
      toast({ title: "Sucesso", description: result.mensagem });
      await loadSubEntities(editingContrato.id);
      await loadContratos();
      const updated = (await contratoService.listar(empresaId, filialId)).find((c) => c.id === editingContrato.id);
      if (updated) setEditingContrato(updated);
    } else {
      toast({ title: "Erro", description: result.mensagem, variant: "destructive" });
    }
  };

  // ---- Fixação CRUD ----
  const openNewFixacao = () => {
    setEditingFixacao(null);
    fixacaoForm.reset({
      dataFixacao: new Date().toISOString().slice(0, 16),
      quantidadeFixada: 0, unidadeFixacaoId: editingContrato?.unidadeNegociacaoId ?? "",
      precoFixado: 0, moedaId: editingContrato?.moedaId ?? "moeda1", observacoes: "",
    });
    setFixacaoModalOpen(true);
  };

  const openEditFixacao = (f: ContratoFixacao) => {
    setEditingFixacao(f);
    fixacaoForm.reset({
      dataFixacao: f.dataFixacao.slice(0, 16),
      quantidadeFixada: f.quantidadeFixada,
      unidadeFixacaoId: f.unidadeFixacaoId,
      precoFixado: f.precoFixado,
      moedaId: f.moedaId,
      observacoes: f.observacoes,
    });
    setFixacaoModalOpen(true);
  };

  const onSaveFixacao = fixacaoForm.handleSubmit(async (data) => {
    if (!editingContrato) return;
    setSavingFixacao(true);
    try {
      const result = await contratoFixacaoService.salvar(
        { ...data, contratoId: editingContrato.id, id: editingFixacao?.id },
        { grupoId, empresaId, filialId }
      );
      if (result.sucesso) {
        toast({ title: "Sucesso", description: result.mensagem });
        setFixacaoModalOpen(false);
        await loadSubEntities(editingContrato.id);
      } else {
        toast({ title: "Erro", description: result.mensagem, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro", description: "Falha ao salvar fixação.", variant: "destructive" });
    } finally { setSavingFixacao(false); }
  });

  const onDeleteFixacao = async (id: string) => {
    if (!editingContrato) return;
    await contratoFixacaoService.excluir(id);
    toast({ title: "Sucesso", description: "Fixação excluída." });
    await loadSubEntities(editingContrato.id);
  };

  // ---- Condições CRUD ----
  const onApplyModelo = async (modeloId: string) => {
    if (!editingContrato) return;
    const novas = await contratoCondicaoService.aplicarModelo(
      editingContrato.id, modeloId, { grupoId, empresaId, filialId }
    );
    setCondicoes(novas);
    toast({ title: "Sucesso", description: "Condições do modelo aplicadas ao contrato." });
  };

  const openNewCondicao = () => {
    setEditingCondicao(null);
    setCondDescricao("");
    setCondTipo("PERCENTUAL");
    setCondValor("");
    setCondOrdem(String(condicoes.length + 1));
    setCondAutomatico(false);
    setCondicaoModalOpen(true);
  };

  const openEditCondicao = (c: ContratoCondicao) => {
    setEditingCondicao(c);
    setCondDescricao(c.descricao);
    setCondTipo(c.tipo);
    setCondValor(String(c.valor));
    setCondOrdem(String(c.ordemCalculo));
    setCondAutomatico(c.automatico);
    setCondicaoModalOpen(true);
  };

  const onSaveCondicao = async () => {
    if (!condDescricao.trim()) {
      toast({ title: "Erro", description: "Descrição é obrigatória.", variant: "destructive" });
      return;
    }
    if (!condValor || isNaN(Number(condValor)) || Number(condValor) <= 0) {
      toast({ title: "Erro", description: "Valor deve ser > 0.", variant: "destructive" });
      return;
    }
    if (!editingContrato) return;
    setSavingCondicao(true);
    try {
      await contratoCondicaoService.salvar(
        {
          id: editingCondicao?.id,
          contratoId: editingContrato.id,
          descricao: condDescricao,
          tipo: condTipo,
          valor: Number(condValor),
          ordemCalculo: Number(condOrdem) || 1,
          automatico: condAutomatico,
        },
        { grupoId, empresaId, filialId }
      );
      toast({ title: "Sucesso", description: editingCondicao ? "Condição atualizada." : "Condição adicionada." });
      setCondicaoModalOpen(false);
      const conds = await contratoCondicaoService.listarPorContrato(editingContrato.id);
      setCondicoes(conds);
    } catch {
      toast({ title: "Erro", description: "Falha ao salvar condição.", variant: "destructive" });
    } finally { setSavingCondicao(false); }
  };

  const onDeleteCondicao = async (id: string) => {
    if (!editingContrato) return;
    await contratoCondicaoService.excluir(id);
    toast({ title: "Sucesso", description: "Condição excluída." });
    const conds = await contratoCondicaoService.listarPorContrato(editingContrato.id);
    setCondicoes(conds);
  };

  // ---- Financeiro tab calculations ----
  const valorEstimado = editingContrato
    ? editingContrato.quantidadeTotal * editingContrato.precoUnitario
    : 0;
  const totalFixado = fixacoes.reduce((s, f) => s + f.quantidadeFixada * f.precoFixado, 0);

  // Mock desconto calculations
  const totalDescontosMock = condicoes.reduce((sum, c) => {
    if (c.tipo === "PERCENTUAL") return sum + (valorEstimado * c.valor / 100);
    return sum + c.valor;
  }, 0);
  const valorLiquidoEstimado = valorEstimado - totalDescontosMock;


  if (!grupoId) {
    return (
      <>
        <PageHeader title="Contratos" description="Gestão de contratos comerciais" />
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Selecione um Grupo para visualizar contratos.
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Contratos" description="Gestão de contratos comerciais de compra e venda" />

      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Novo Contrato</Button>
      </div>

      {/* Listagem */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Parceiro</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Qtd. Total</TableHead>
                <TableHead className="text-right">Entregue</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead>Moeda</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contratos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    Nenhum contrato cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                contratos.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.numeroContrato}</TableCell>
                    <TableCell>
                      <Badge variant={c.tipoContrato === "COMPRA" ? "default" : "secondary"}>
                        {c.tipoContrato === "COMPRA" ? "Compra" : "Venda"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getNomePessoa(c.pessoaId)}</TableCell>
                    <TableCell>{getNomeProduto(c.produtoId)}</TableCell>
                    <TableCell className="text-right">{c.quantidadeTotal.toLocaleString("pt-BR")} {getCodigoUnidade(c.unidadeNegociacaoId)}</TableCell>
                    <TableCell className="text-right">{c.quantidadeEntregue.toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="text-right">{c.quantidadeSaldo.toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="text-right">{getSimboloMoeda(c.moedaId)} {c.precoUnitario.toFixed(2)}</TableCell>
                    <TableCell>{getCodigoMoeda(c.moedaId)}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openView(c)} title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)} title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(c.id)} title="Excluir">
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

      {/* Contrato Modal */}
      <CrudModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={viewOnly ? `Contrato ${editingContrato?.numeroContrato}` : editingContrato ? "Editar Contrato" : "Novo Contrato"}
        saving={saving}
        onSave={viewOnly ? undefined : onSaveContrato}
        maxWidth="sm:max-w-5xl"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="dados">Dados do Contrato</TabsTrigger>
              <TabsTrigger value="romaneios" disabled={!editingContrato}>Romaneios</TabsTrigger>
              {(editingContrato?.tipoPreco === "A_FIXAR" || tipoPrecoWatch === "A_FIXAR") && (
                <TabsTrigger value="fixacao" disabled={!editingContrato}>Fixação de Preço</TabsTrigger>
              )}
              <TabsTrigger value="financeiro" disabled={!editingContrato}>Financeiro</TabsTrigger>
              <TabsTrigger value="condicoes" disabled={!editingContrato}>Condições e Descontos</TabsTrigger>
            </TabsList>
            {editingContrato && (
              <StatusBadge status={editingContrato.status} />
            )}
          </div>

          {/* ABA 1 — Dados */}
          <TabsContent value="dados">
            <fieldset disabled={viewOnly} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Número do Contrato <span className="text-destructive">*</span></Label>
                  <Input {...contratoForm.register("numeroContrato")} />
                  {contratoForm.formState.errors.numeroContrato && (
                    <p className="text-xs text-destructive">{contratoForm.formState.errors.numeroContrato.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo <span className="text-destructive">*</span></Label>
                  <Select value={contratoForm.watch("tipoContrato")} onValueChange={(v) => contratoForm.setValue("tipoContrato", v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMPRA">Compra</SelectItem>
                      <SelectItem value="VENDA">Venda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Data do Contrato <span className="text-destructive">*</span></Label>
                  <Input type="date" {...contratoForm.register("dataContrato")} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Parceiro <span className="text-destructive">*</span></Label>
                  <Select value={contratoForm.watch("pessoaId")} onValueChange={(v) => contratoForm.setValue("pessoaId", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {pessoasAtivas.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.nomeRazao}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {contratoForm.formState.errors.pessoaId && (
                    <p className="text-xs text-destructive">{contratoForm.formState.errors.pessoaId.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Produto <span className="text-destructive">*</span></Label>
                  <Select value={contratoForm.watch("produtoId")} onValueChange={(v) => contratoForm.setValue("produtoId", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {produtosAtivos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.descricao}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {contratoForm.formState.errors.produtoId && (
                    <p className="text-xs text-destructive">{contratoForm.formState.errors.produtoId.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Unidade de Negociação <span className="text-destructive">*</span></Label>
                  <Select value={contratoForm.watch("unidadeNegociacaoId")} onValueChange={(v) => contratoForm.setValue("unidadeNegociacaoId", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {unidadesAtivas.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.codigo} — {u.descricao}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Quantidade Total <span className="text-destructive">*</span></Label>
                  <Input type="number" step="0.000001" {...contratoForm.register("quantidadeTotal")} />
                  {contratoForm.formState.errors.quantidadeTotal && (
                    <p className="text-xs text-destructive">{contratoForm.formState.errors.quantidadeTotal.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo de Preço <span className="text-destructive">*</span></Label>
                  <Select value={contratoForm.watch("tipoPreco")} onValueChange={(v) => contratoForm.setValue("tipoPreco", v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIXO">Fixo</SelectItem>
                      <SelectItem value="A_FIXAR">A Fixar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Moeda</Label>
                  <Select value={contratoForm.watch("moedaId")} onValueChange={(v) => contratoForm.setValue("moedaId", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {moedas.filter((m) => m.ativo).map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.codigo} — {m.descricao}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Preço Unitário</Label>
                  <Input type="number" step="0.000001" {...contratoForm.register("precoUnitario")} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Data Entrega Início</Label>
                  <Input type="date" {...contratoForm.register("dataEntregaInicio")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Data Entrega Fim</Label>
                  <Input type="date" {...contratoForm.register("dataEntregaFim")} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Observações</Label>
                <Textarea rows={3} {...contratoForm.register("observacoes")} />
              </div>

              {editingContrato && (
                <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                  <div>Quantidade Entregue: <strong>{editingContrato.quantidadeEntregue.toLocaleString("pt-BR")} {getCodigoUnidade(editingContrato.unidadeNegociacaoId)}</strong></div>
                  <div>Saldo: <strong>{editingContrato.quantidadeSaldo.toLocaleString("pt-BR")} {getCodigoUnidade(editingContrato.unidadeNegociacaoId)}</strong></div>
                </div>
              )}
            </fieldset>
          </TabsContent>

          {/* ABA 2 — Romaneios */}
          <TabsContent value="romaneios">
            <div className="space-y-4">
              {!viewOnly && (
                <div className="flex justify-end">
                  <Button size="sm" onClick={openNewEntrega} disabled={editingContrato?.status === "FINALIZADO" || editingContrato?.status === "CANCELADO"}>
                    <Plus className="mr-2 h-4 w-4" />Novo Romaneio
                  </Button>
                </div>
              )}
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                       <TableHead>Data</TableHead>
                       <TableHead className="text-right">Quantidade</TableHead>
                       <TableHead>Unidade</TableHead>
                       <TableHead className="text-right">Peso Bruto</TableHead>
                       <TableHead className="text-right">Peso Líquido</TableHead>
                       <TableHead className="text-right">Peso Comercial</TableHead>
                       <TableHead className="text-right">Desc. %</TableHead>
                       <TableHead>Motorista</TableHead>
                       <TableHead>Placa</TableHead>
                       {!viewOnly && <TableHead className="text-right">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entregas.length === 0 ? (
                      <TableRow>
                         <TableCell colSpan={viewOnly ? 9 : 10} className="text-center py-8 text-muted-foreground">
                          Nenhum romaneio registrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      entregas.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell>{format(new Date(e.dataEntrega), "dd/MM/yyyy HH:mm")}</TableCell>
                          <TableCell className="text-right">{e.quantidadeInformada.toLocaleString("pt-BR")}</TableCell>
                          <TableCell>{getCodigoUnidade(e.unidadeInformadaId)}</TableCell>
                           <TableCell className="text-right">{e.pesoBruto?.toLocaleString("pt-BR") ?? "—"}</TableCell>
                           <TableCell className="text-right">{e.pesoLiquido?.toLocaleString("pt-BR") ?? "—"}</TableCell>
                           <TableCell className="text-right font-medium">{e.pesoComercial?.toLocaleString("pt-BR") ?? "—"}</TableCell>
                           <TableCell className="text-right">{e.descontoTotalPercentual != null ? `${e.descontoTotalPercentual.toFixed(2)}%` : "—"}</TableCell>
                          <TableCell>{e.nomeMotorista || "—"}</TableCell>
                          <TableCell>{e.placaVeiculo || "—"}</TableCell>
                          {!viewOnly && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEditEntrega(e)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onDeleteEntrega(e.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* ABA 3 — Fixação */}
          <TabsContent value="fixacao">
            <div className="space-y-4">
              {!viewOnly && (
                <div className="flex justify-end">
                  <Button size="sm" onClick={openNewFixacao}>
                    <Plus className="mr-2 h-4 w-4" />Nova Fixação
                  </Button>
                </div>
              )}
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Quantidade Fixada</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead>Moeda</TableHead>
                      {!viewOnly && <TableHead className="text-right">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fixacoes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={viewOnly ? 4 : 5} className="text-center py-8 text-muted-foreground">
                          Nenhuma fixação registrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      fixacoes.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell>{format(new Date(f.dataFixacao), "dd/MM/yyyy HH:mm")}</TableCell>
                          <TableCell className="text-right">{f.quantidadeFixada.toLocaleString("pt-BR")} {getCodigoUnidade(f.unidadeFixacaoId)}</TableCell>
                          <TableCell className="text-right">{getSimboloMoeda(f.moedaId)} {f.precoFixado.toFixed(2)}</TableCell>
                          <TableCell>{getCodigoMoeda(f.moedaId)}</TableCell>
                          {!viewOnly && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEditFixacao(f)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onDeleteFixacao(f.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* ABA 4 — Financeiro */}
          <TabsContent value="financeiro">
            <div className="space-y-6">
              {/* Resumo existente */}
              <div className="rounded-md bg-muted p-4 space-y-3">
                <h3 className="font-semibold text-foreground">Resumo Financeiro (Simulado)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="rounded-md bg-card p-3 border">
                    <p className="text-muted-foreground">Valor Estimado do Contrato</p>
                    <p className="text-lg font-bold text-foreground">
                      {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")} {valorEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="rounded-md bg-card p-3 border">
                    <p className="text-muted-foreground">Valor Fixado</p>
                    <p className="text-lg font-bold text-foreground">
                      {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")} {totalFixado.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="rounded-md bg-card p-3 border">
                    <p className="text-muted-foreground">Saldo Financeiro</p>
                    <p className="text-lg font-bold text-foreground">
                      {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")} {(valorEstimado - totalFixado).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  * Valores simulados. O módulo financeiro completo será implementado em versão futura.
                </p>
              </div>

            </div>
          </TabsContent>

          {/* ABA 5 — Condições e Descontos */}
          <TabsContent value="condicoes">
            <div className="space-y-6">
              {/* Resumo de Descontos */}
              <div className="rounded-md bg-muted p-4 space-y-3">
                <h3 className="font-semibold text-foreground">Simulação de Descontos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="rounded-md bg-card p-3 border">
                    <p className="text-muted-foreground">Valor Bruto</p>
                    <p className="text-lg font-bold text-foreground">
                      {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")} {valorEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="rounded-md bg-card p-3 border">
                    <p className="text-muted-foreground">Total Descontos</p>
                    <p className="text-lg font-bold text-destructive">
                      - {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")} {totalDescontosMock.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="rounded-md bg-card p-3 border">
                    <p className="text-muted-foreground">Valor Líquido Estimado</p>
                    <p className="text-lg font-bold text-foreground">
                      {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")} {valorLiquidoEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  * Simulação. Cálculo real será implementado em versão futura.
                </p>
              </div>

              {/* Condições do Contrato */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Condições Financeiras</h3>
                  <div className="flex gap-2">
                    {!viewOnly && (
                      <>
                        <Select onValueChange={(v) => onApplyModelo(v)}>
                          <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Aplicar modelo..." />
                          </SelectTrigger>
                          <SelectContent>
                            {modelosCondicao.filter((m) => m.ativo).map((m) => (
                              <SelectItem key={m.id} value={m.id}>{m.descricao}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={openNewCondicao}>
                          <Plus className="mr-2 h-4 w-4" />Adicionar
                        </Button>
                      </>
                    )}
                  </div>
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
                        {!viewOnly && <TableHead className="text-right">Ações</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {condicoes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={viewOnly ? 5 : 6} className="text-center py-8 text-muted-foreground">
                            Nenhuma condição vinculada a este contrato.
                          </TableCell>
                        </TableRow>
                      ) : (
                        condicoes.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell>{c.ordemCalculo}</TableCell>
                            <TableCell className="font-medium">{c.descricao}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {c.tipo === "PERCENTUAL" ? "%" : "R$"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {c.tipo === "PERCENTUAL"
                                ? `${c.valor.toFixed(2)}%`
                                : `R$ ${c.valor.toFixed(2)}`}
                            </TableCell>
                            <TableCell>
                              {c.automatico ? (
                                <Badge variant="default" className="gap-1">
                                  <Lock className="h-3 w-3" /> Sim
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Não</Badge>
                              )}
                            </TableCell>
                            {!viewOnly && (
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => openEditCondicao(c)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => onDeleteCondicao(c.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CrudModal>

      {/* Entrega Modal */}
      <CrudModal
        open={entregaModalOpen}
        onClose={() => setEntregaModalOpen(false)}
        title={editingEntrega ? "Editar Romaneio" : "Novo Romaneio"}
        saving={savingEntrega}
        onSave={onSaveEntrega}
        maxWidth="sm:max-w-2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Data da Entrega <span className="text-destructive">*</span></Label>
              <Input type="datetime-local" {...entregaForm.register("dataEntrega")} />
            </div>
            <div className="space-y-1.5">
              <Label>Ponto de Estoque <span className="text-destructive">*</span></Label>
              <Select value={entregaForm.watch("pontoEstoqueId")} onValueChange={(v) => entregaForm.setValue("pontoEstoqueId", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {pontos.filter((p) => p.ativo).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.descricao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {entregaForm.formState.errors.pontoEstoqueId && (
                <p className="text-xs text-destructive">{entregaForm.formState.errors.pontoEstoqueId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Quantidade <span className="text-destructive">*</span></Label>
              <Input type="number" step="0.000001" {...entregaForm.register("quantidadeInformada")} />
              {entregaForm.formState.errors.quantidadeInformada && (
                <p className="text-xs text-destructive">{entregaForm.formState.errors.quantidadeInformada.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Unidade <span className="text-destructive">*</span></Label>
              <Select value={entregaForm.watch("unidadeInformadaId")} onValueChange={(v) => entregaForm.setValue("unidadeInformadaId", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {unidadesAtivas.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.codigo} — {u.descricao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Peso Bruto</Label>
              <Input type="number" step="0.000001" {...entregaForm.register("pesoBruto")} />
            </div>
            <div className="space-y-1.5">
              <Label>Peso Líquido</Label>
              <Input type="number" step="0.000001" {...entregaForm.register("pesoLiquido")} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Placa do Veículo</Label>
              <Input {...entregaForm.register("placaVeiculo")} maxLength={10} />
            </div>
            <div className="space-y-1.5">
              <Label>Motorista</Label>
              <Input {...entregaForm.register("nomeMotorista")} />
            </div>
            <div className="space-y-1.5">
              <Label>Documento Motorista</Label>
              <Input {...entregaForm.register("documentoMotorista")} maxLength={20} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea rows={2} {...entregaForm.register("observacoes")} />
          </div>
        </div>
      </CrudModal>

      {/* Fixação Modal */}
      <CrudModal
        open={fixacaoModalOpen}
        onClose={() => setFixacaoModalOpen(false)}
        title={editingFixacao ? "Editar Fixação" : "Nova Fixação"}
        saving={savingFixacao}
        onSave={onSaveFixacao}
        maxWidth="sm:max-w-xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Data <span className="text-destructive">*</span></Label>
              <Input type="datetime-local" {...fixacaoForm.register("dataFixacao")} />
            </div>
            <div className="space-y-1.5">
              <Label>Unidade <span className="text-destructive">*</span></Label>
              <Select value={fixacaoForm.watch("unidadeFixacaoId")} onValueChange={(v) => fixacaoForm.setValue("unidadeFixacaoId", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {unidadesAtivas.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.codigo} — {u.descricao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Quantidade <span className="text-destructive">*</span></Label>
              <Input type="number" step="0.000001" {...fixacaoForm.register("quantidadeFixada")} />
            </div>
            <div className="space-y-1.5">
              <Label>Preço <span className="text-destructive">*</span></Label>
              <Input type="number" step="0.000001" {...fixacaoForm.register("precoFixado")} />
            </div>
            <div className="space-y-1.5">
              <Label>Moeda</Label>
              <Select value={fixacaoForm.watch("moedaId")} onValueChange={(v) => fixacaoForm.setValue("moedaId", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {moedas.filter((m) => m.ativo).map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.codigo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea rows={2} {...fixacaoForm.register("observacoes")} />
          </div>
        </div>
      </CrudModal>

      {/* Condição Modal */}
      <CrudModal
        open={condicaoModalOpen}
        onClose={() => setCondicaoModalOpen(false)}
        title={editingCondicao ? "Editar Condição" : "Nova Condição"}
        saving={savingCondicao}
        onSave={onSaveCondicao}
        maxWidth="sm:max-w-xl"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Descrição <span className="text-destructive">*</span></Label>
            <Input
              value={condDescricao}
              onChange={(e) => setCondDescricao(e.target.value)}
              maxLength={150}
              disabled={editingCondicao?.automatico}
              placeholder="Ex: FUNRURAL"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo <span className="text-destructive">*</span></Label>
              <Select value={condTipo} onValueChange={(v) => setCondTipo(v as TipoCondicaoDesconto)} disabled={editingCondicao?.automatico}>
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
                value={condValor}
                onChange={(e) => setCondValor(e.target.value)}
                disabled={editingCondicao?.automatico}
                placeholder={condTipo === "PERCENTUAL" ? "Ex: 1.50" : "Ex: 2.00"}
              />
              {editingCondicao?.automatico && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Valor travado (automático)
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Ordem de Cálculo</Label>
              <Input
                type="number"
                value={condOrdem}
                onChange={(e) => setCondOrdem(e.target.value)}
                disabled={editingCondicao?.automatico}
              />
            </div>
          </div>
        </div>
      </CrudModal>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Contrato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteContrato} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}