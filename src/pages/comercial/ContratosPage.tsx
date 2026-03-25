import { useEffect, useMemo, useState, useCallback } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  contratoService, contratoFixacaoService,
  pontoEstoqueService, moedaService,
  condicaoDescontoModeloService, contratoCondicaoService,
  classificacaoTipoService,
  contratoLiquidacaoService, financeiroContaService,
  financeiroParcelaService, financeiroBaixaService,
  filialService, romaneioService,
} from "@/lib/services";
import {
  pessoas as mockPessoas,
  produtos as mockProdutos,
  unidadesMedida as mockUnidades,
  moedas as mockMoedas,
} from "@/lib/mock-data";
import type {
  Contrato, ContratoFixacao,
  PontoEstoque, Moeda, Filial, Romaneio,
  CondicaoDescontoModelo, ContratoCondicao, TipoCondicaoDesconto,
  ContratoLiquidacao,
  FinanceiroConta, FinanceiroParcela, FinanceiroBaixa,
} from "@/lib/mock-data";
import { Plus, Pencil, Trash2, Eye, Lock, FileCheck, AlertTriangle, ExternalLink, Info } from "lucide-react";
import { SearchableSelect, type SearchableOption } from "@/components/SearchableSelect";

// ---- Currency formatting helpers ----
function formatCurrency(value: number, moedaCodigo: string): string {
  const localeMap: Record<string, { locale: string; currency: string }> = {
    BRL: { locale: "pt-BR", currency: "BRL" },
    USD: { locale: "en-US", currency: "USD" },
    EUR: { locale: "de-DE", currency: "EUR" },
  };
  const cfg = localeMap[moedaCodigo] ?? localeMap.BRL;
  return new Intl.NumberFormat(cfg.locale, {
    style: "currency",
    currency: cfg.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ---- Schemas ----
const contratoSchema = z.object({
  numeroContrato: z.string().optional(),
  tipoContrato: z.enum(["COMPRA", "VENDA"]),
  pessoaId: z.string().min(1, "Pessoa responsável é obrigatória"),
  produtoId: z.string().min(1, "Produto é obrigatório"),
  unidadeNegociacaoId: z.string().min(1, "Unidade é obrigatória"),
  quantidadeTotal: z.coerce.number().positive("Quantidade deve ser > 0"),
  moedaId: z.string().min(1, "Moeda é obrigatória"),
  precoUnitario: z.coerce.number().min(0, "Preço deve ser >= 0"),
  tipoPreco: z.enum(["FIXO", "A_FIXAR"]),
  dataContrato: z.string().min(1, "Data é obrigatória"),
  dataEntregaInicio: z.string().optional(),
  dataEntregaFim: z.string().optional(),
  filialOperacaoId: z.string().optional(),
  filialOrigemId: z.string().optional(),
  filialDestinoId: z.string().optional(),
  observacoes: z.string().optional(),
type ContratoForm = z.infer<typeof contratoSchema>;


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
    LIQUIDADO: { label: "Liquidado", variant: "outline" },
  };
  const s = map[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export default function ContratosPage() {
  const { grupoAtual, empresaAtual, filiais: orgFiliais } = useOrganization();
  const empresaId = empresaAtual?.id ?? "";
  const grupoId = grupoAtual?.id ?? "";

  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(false);
  const [filiaisEmpresa, setFiliaisEmpresa] = useState<Filial[]>([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContrato, setEditingContrato] = useState<Contrato | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dados");

  // Sub-entities
  const [romaneiosContrato, setRomaneiosContrato] = useState<Romaneio[]>([]);
  const [fixacoes, setFixacoes] = useState<ContratoFixacao[]>([]);
  const [pontos, setPontos] = useState<PontoEstoque[]>([]);
  const [moedas, setMoedas] = useState<Moeda[]>([]);

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

  // Liquidação
  const [liquidacao, setLiquidacao] = useState<ContratoLiquidacao | null>(null);
  const [liquidacaoLoading, setLiquidacaoLoading] = useState(false);
  const [opcaoEncerrar, setOpcaoEncerrar] = useState(true);
  const [opcaoTitulos, setOpcaoTitulos] = useState<"ATUALIZAR" | "COMPLEMENTAR">("ATUALIZAR");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Financeiro real
  const [finContas, setFinContas] = useState<FinanceiroConta[]>([]);
  const [finParcelas, setFinParcelas] = useState<FinanceiroParcela[]>([]);
  const [finBaixas, setFinBaixas] = useState<FinanceiroBaixa[]>([]);

  // Forms
  const contratoForm = useForm<ContratoForm>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      numeroContrato: "", tipoContrato: "COMPRA", pessoaId: "", produtoId: "",
      unidadeNegociacaoId: "", quantidadeTotal: 0, moedaId: "moeda1",
      precoUnitario: 0, tipoPreco: "FIXO",
      dataContrato: new Date().toISOString().slice(0, 10),
      dataEntregaInicio: "", dataEntregaFim: "",
      filialOperacaoId: "", filialOrigemId: "", filialDestinoId: "",
      observacoes: "",
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
  const filialOperacaoWatch = contratoForm.watch("filialOperacaoId");
  const produtoIdWatch = contratoForm.watch("produtoId");
  const tipoContratoWatch = contratoForm.watch("tipoContrato");

  // FURO 4: Pre-preencher unidadeNegociacaoId ao selecionar produto/tipo
  useEffect(() => {
    if (!produtoIdWatch || editingContrato) return; // Só pré-preenche em criação
    const produto = mockProdutos.find((p) => p.id === produtoIdWatch && p.deletadoEm === null);
    if (!produto) return;
    const unidadeId = tipoContratoWatch === "COMPRA" ? produto.unidadeEntradaId : produto.unidadeSaidaId;
    if (unidadeId) {
      contratoForm.setValue("unidadeNegociacaoId", unidadeId);
    }
  }, [produtoIdWatch, tipoContratoWatch, editingContrato]);

  const loadContratos = async () => {
    if (!empresaId) return;
    setLoading(true);
    const list = await contratoService.listarPorEmpresa(empresaId);
    setContratos(list);
    setLoading(false);
  };

  useEffect(() => { loadContratos(); }, [empresaId]);

  useEffect(() => {
    if (empresaId) {
      condicaoDescontoModeloService.listarPorEmpresa(empresaId).then(setModelosCondicao);
      filialService.listarPorEmpresa(empresaId).then(setFiliaisEmpresa);
    }
    moedaService.listar().then(setMoedas);
    classificacaoTipoService.listarTodos().then(() => {});
  }, [empresaId]);

  useEffect(() => {
    if (empresaId && filialOperacaoWatch) {
      pontoEstoqueService.listar(empresaId, filialOperacaoWatch).then(setPontos);
    } else {
      setPontos([]);
    }
  }, [empresaId, filialOperacaoWatch]);

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
  const getNomeFilial = (id: string | null) => filiaisEmpresa.find((f) => f.id === id)?.nomeRazao ?? "—";

  // ---- Fixação computed values ----
  const totalEntregue = useMemo(() => {
    return romaneiosContrato.filter(r => r.status === "FINALIZADO").reduce((s, r) => s + r.pesoLiquido, 0);
  }, [romaneiosContrato]);

  const totalFixado = useMemo(() => {
    return fixacoes.reduce((s, f) => s + f.quantidadeFixada, 0);
  }, [fixacoes]);

  const saldoAFixar = useMemo(() => {
    return Math.max(0, (editingContrato?.quantidadeEntregue ?? 0) - totalFixado);
  }, [editingContrato, totalFixado]);

  const precoMedioFixado = useMemo(() => {
    if (totalFixado <= 0) return 0;
    const somaPonderada = fixacoes.reduce((s, f) => s + f.precoFixado * f.quantidadeFixada, 0);
    return somaPonderada / totalFixado;
  }, [fixacoes, totalFixado]);

  // ---- Contrato CRUD ----
  const openNew = () => {
    setEditingContrato(null);
    setViewOnly(false);
    contratoForm.reset({
      numeroContrato: "", tipoContrato: "COMPRA", pessoaId: "", produtoId: "",
      unidadeNegociacaoId: "", quantidadeTotal: 0, moedaId: "moeda1",
      precoUnitario: 0, tipoPreco: "FIXO",
      dataContrato: new Date().toISOString().slice(0, 10),
      dataEntregaInicio: "", dataEntregaFim: "",
      filialOperacaoId: "", filialOrigemId: "", filialDestinoId: "",
      observacoes: "",
    });
    setRomaneiosContrato([]);
    setFixacoes([]);
    setCondicoes([]);
    setFinContas([]);
    setFinParcelas([]);
    setFinBaixas([]);
    setLiquidacao(null);
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
      filialOperacaoId: c.filialOperacaoId ?? "",
      filialOrigemId: c.filialOrigemId ?? "",
      filialDestinoId: c.filialDestinoId ?? "",
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
    const [roms, f, conds, liqs] = await Promise.all([
      romaneioService.listarPorContrato(contratoId),
      contratoFixacaoService.listarPorContrato(contratoId),
      contratoCondicaoService.listarPorContrato(contratoId),
      contratoLiquidacaoService.listarPorContrato(contratoId),
    ]);
    setRomaneiosContrato(roms);
    setFixacoes(f);
    setCondicoes(conds);
    const activeLiq = liqs.find((l) => l.status === "PREVIA" || l.status === "CONFIRMADA");
    setLiquidacao(activeLiq || null);

    // Load financeiro REAL
    const contas = await financeiroContaService.listarPorContrato(contratoId);
    setFinContas(contas);
    if (contas.length > 0) {
      const contaIds = contas.map((c) => c.id);
      const [parcelas, baixas] = await Promise.all([
        financeiroParcelaService.listarPorContas(contaIds),
        Promise.all(contaIds.map((id) => financeiroBaixaService.listarPorConta(id))).then((arr) => arr.flat()),
      ]);
      setFinParcelas(parcelas);
      setFinBaixas(baixas);
    } else {
      setFinParcelas([]);
      setFinBaixas([]);
    }
  };

  const onSaveContrato = contratoForm.handleSubmit(async (data) => {
    if (!grupoId || !empresaId) return;
    setSaving(true);
    try {
      await contratoService.salvar(
        {
          ...data,
          id: editingContrato?.id,
          filialOperacaoId: data.filialOperacaoId || null,
          filialOrigemId: data.filialOrigemId || null,
          filialDestinoId: data.filialDestinoId || null,
        },
        { grupoId, empresaId, filialId: data.filialOperacaoId || empresaId }
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
        { grupoId, empresaId, filialId: "" }
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
      editingContrato.id, modeloId, { grupoId, empresaId, filialId: editingContrato.filialId }
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
        { grupoId, empresaId, filialId: editingContrato.filialId }
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

  // ---- Financeiro real ----
  const totalParcelasPendentes = finParcelas.filter((p) => p.status === "PENDENTE" || p.status === "PARCIAL").reduce((s, p) => s + p.saldoParcela, 0);
  const totalBaixas = finBaixas.reduce((s, b) => s + b.valorPago, 0);

  // ---- Liquidação handlers ----
  const canLiquidate = useMemo(() => {
    if (!editingContrato) return false;
    if (editingContrato.tipoPreco === "A_FIXAR" && saldoAFixar > 0) return false;
    if (editingContrato.status === "CANCELADO" || editingContrato.status === "LIQUIDADO") return false;
    return true;
  }, [editingContrato, saldoAFixar]);

  const onGerarPrevia = async () => {
    if (!editingContrato) return;
    if (editingContrato.tipoPreco === "A_FIXAR" && saldoAFixar > 0) {
      toast({
        title: "Bloqueado",
        description: "Defina fixações para todo o volume entregue antes de liquidar.",
        variant: "destructive",
      });
      return;
    }
    setLiquidacaoLoading(true);
    try {
      const result = await contratoLiquidacaoService.gerarPrevia(
        editingContrato.id, opcaoEncerrar, { grupoId, empresaId, filialId: editingContrato.filialId }
      );
      if (result.sucesso && result.liquidacao) {
        setLiquidacao(result.liquidacao);
        toast({ title: "Sucesso", description: result.mensagem });
      } else {
        toast({ title: "Erro", description: result.mensagem, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro", description: "Falha ao gerar prévia.", variant: "destructive" });
    } finally { setLiquidacaoLoading(false); }
  };

  const onConfirmarLiquidacao = async () => {
    if (!liquidacao || !editingContrato) return;
    setLiquidacaoLoading(true);
    setConfirmDialogOpen(false);
    try {
      const result = await contratoLiquidacaoService.confirmar(
        liquidacao.id, opcaoTitulos, { grupoId, empresaId, filialId: editingContrato.filialId }
      );
      if (result.sucesso) {
        toast({ title: "Sucesso", description: result.mensagem });
        await loadSubEntities(editingContrato.id);
        await loadContratos();
        const updated = (await contratoService.listarPorEmpresa(empresaId)).find((c) => c.id === editingContrato.id);
        if (updated) setEditingContrato(updated);
      } else {
        toast({ title: "Erro", description: result.mensagem, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro", description: "Falha ao confirmar liquidação.", variant: "destructive" });
    } finally { setLiquidacaoLoading(false); }
  };

  const onCancelarLiquidacao = async () => {
    if (!liquidacao || !editingContrato) return;
    setLiquidacaoLoading(true);
    try {
      const result = await contratoLiquidacaoService.cancelar(liquidacao.id);
      if (result.sucesso) {
        setLiquidacao(null);
        toast({ title: "Sucesso", description: result.mensagem });
      } else {
        toast({ title: "Erro", description: result.mensagem, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro", description: "Falha ao cancelar.", variant: "destructive" });
    } finally { setLiquidacaoLoading(false); }
  };


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

  if (!empresaId) {
    return (
      <>
        <PageHeader title="Contratos" description="Gestão de contratos comerciais" />
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Selecione uma Empresa para visualizar contratos.
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
              <TabsTrigger value="liquidacao" disabled={!editingContrato}>Liquidação</TabsTrigger>
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
                  <Label>Quantidade <span className="text-destructive">*</span></Label>
                  <Input type="number" step="0.000001" {...contratoForm.register("quantidadeTotal")} />
                  {contratoForm.formState.errors.quantidadeTotal && (
                    <p className="text-xs text-destructive">{contratoForm.formState.errors.quantidadeTotal.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Unidade <span className="text-destructive">*</span></Label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Filiais logísticas */}
              <div className="rounded-md border p-4 space-y-4">
                <h4 className="font-semibold text-sm text-foreground">Filiais Logísticas</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Filial de Operação</Label>
                    <Select value={contratoForm.watch("filialOperacaoId") || ""} onValueChange={(v) => contratoForm.setValue("filialOperacaoId", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {filiaisEmpresa.filter((f) => f.ativo).map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.nomeRazao}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Filial de Origem</Label>
                    <Select value={contratoForm.watch("filialOrigemId") || ""} onValueChange={(v) => contratoForm.setValue("filialOrigemId", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {filiaisEmpresa.filter((f) => f.ativo).map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.nomeRazao}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Filial de Destino</Label>
                    <Select value={contratoForm.watch("filialDestinoId") || ""} onValueChange={(v) => contratoForm.setValue("filialDestinoId", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {filiaisEmpresa.filter((f) => f.ativo).map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.nomeRazao}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                  {editingContrato.filialOperacaoId && <div>Filial Operação: <strong>{getNomeFilial(editingContrato.filialOperacaoId)}</strong></div>}
                  {editingContrato.filialOrigemId && <div>Filial Origem: <strong>{getNomeFilial(editingContrato.filialOrigemId)}</strong></div>}
                  {editingContrato.filialDestinoId && <div>Filial Destino: <strong>{getNomeFilial(editingContrato.filialDestinoId)}</strong></div>}
                </div>
              )}
            </fieldset>
          </TabsContent>

          {/* ABA 2 — Romaneios Vinculados (READ-ONLY) */}
          <TabsContent value="romaneios">
            <div className="space-y-4">
              {/* Painel de Fixação para A_FIXAR */}
              {editingContrato?.tipoPreco === "A_FIXAR" && (
                <Card className="border-2 border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Resumo de Fixação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Entregue</p>
                        <p className="text-lg font-bold">{editingContrato.quantidadeEntregue.toLocaleString("pt-BR")} {getCodigoUnidade(editingContrato.unidadeNegociacaoId)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Fixado</p>
                        <p className="text-lg font-bold">{totalFixado.toLocaleString("pt-BR")} {getCodigoUnidade(editingContrato.unidadeNegociacaoId)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Saldo a Fixar</p>
                        <p className={`text-lg font-bold ${saldoAFixar > 0 ? "text-amber-600" : "text-primary"}`}>
                          {saldoAFixar.toLocaleString("pt-BR")} {getCodigoUnidade(editingContrato.unidadeNegociacaoId)}
                          {saldoAFixar > 0 && <span className="ml-1">⚠️</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Preço Médio Atual</p>
                        <p className="text-lg font-bold">
                          {getSimboloMoeda(editingContrato.moedaId)} {precoMedioFixado.toFixed(2)}/{getCodigoUnidade(editingContrato.unidadeNegociacaoId)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("fixacao")}>
                        Gerenciar Fixações →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Romaneios Vinculados</h3>
                <p className="text-xs text-muted-foreground">Somente leitura — romaneios são criados no módulo Romaneios</p>
              </div>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Peso Bruto</TableHead>
                      <TableHead className="text-right">Peso Tara</TableHead>
                      <TableHead className="text-right">Peso Líquido</TableHead>
                      <TableHead>Motorista</TableHead>
                      <TableHead>Placa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {romaneiosContrato.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Nenhum romaneio vinculado a este contrato.
                          <br />
                          <span className="text-xs">Crie romaneios pelo menu Romaneios e vincule a este contrato.</span>
                        </TableCell>
                      </TableRow>
                    ) : (
                      romaneiosContrato.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-mono text-xs">{r.id.substring(0, 8)}</TableCell>
                          <TableCell>{format(new Date(r.criadoEm), "dd/MM/yyyy HH:mm")}</TableCell>
                          <TableCell className="text-right">{r.pesoBruto > 0 ? r.pesoBruto.toFixed(3) : "—"}</TableCell>
                          <TableCell className="text-right">{r.pesoTara > 0 ? r.pesoTara.toFixed(3) : "—"}</TableCell>
                          <TableCell className="text-right font-medium">{r.pesoLiquido > 0 ? r.pesoLiquido.toFixed(3) : "—"}</TableCell>
                          <TableCell>{r.motoristaNome || "—"}</TableCell>
                          <TableCell>{r.placaVeiculo || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={r.status === "FINALIZADO" ? "outline" : r.status === "ABERTO" ? "default" : "secondary"}>
                              {r.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" asChild title="Ver no módulo Romaneios">
                              <a href="/romaneios">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </TableCell>
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
              {/* Painel resumo */}
              {editingContrato && (
                <Card className="border-2 border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Entregue</p>
                        <p className="text-lg font-bold">{editingContrato.quantidadeEntregue.toLocaleString("pt-BR")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Fixado</p>
                        <p className="text-lg font-bold">{totalFixado.toLocaleString("pt-BR")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Saldo a Fixar</p>
                        <p className={`text-lg font-bold ${saldoAFixar > 0 ? "text-amber-600" : "text-primary"}`}>
                          {saldoAFixar.toLocaleString("pt-BR")}
                          {saldoAFixar > 0 && <span className="ml-1">⚠️</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Preço Médio</p>
                        <p className="text-lg font-bold">{getSimboloMoeda(editingContrato.moedaId)} {precoMedioFixado.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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

          {/* ABA 4 — Financeiro REAL */}
          <TabsContent value="financeiro">
            <div className="space-y-6">
              <div className="rounded-md bg-muted p-4 space-y-3">
                <h3 className="font-semibold text-foreground">Resumo Financeiro</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="rounded-md bg-card p-3 border">
                    <p className="text-muted-foreground">Total Contas</p>
                    <p className="text-lg font-bold text-foreground">{finContas.length}</p>
                  </div>
                  <div className="rounded-md bg-card p-3 border">
                    <p className="text-muted-foreground">Valor Total</p>
                    <p className="text-lg font-bold text-foreground">
                      {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")} {finContas.reduce((s, c) => s + c.valorTotal, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="rounded-md bg-card p-3 border">
                    <p className="text-muted-foreground">Total Pago</p>
                    <p className="text-lg font-bold text-primary">
                      {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")} {totalBaixas.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="rounded-md bg-card p-3 border">
                    <p className="text-muted-foreground">Saldo Pendente</p>
                    <p className="text-lg font-bold text-destructive">
                      {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")} {totalParcelasPendentes.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              {finParcelas.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-sm">Parcelas</h4>
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Conta</TableHead>
                          <TableHead>Nº</TableHead>
                          <TableHead>Vencimento</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="text-right">Pago</TableHead>
                          <TableHead className="text-right">Saldo</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {finParcelas.map((p) => {
                          const conta = finContas.find((c) => c.id === p.contaId);
                          return (
                            <TableRow key={p.id}>
                              <TableCell className="text-xs">{conta?.descricao ?? p.contaId}</TableCell>
                              <TableCell>{p.numeroParcela}</TableCell>
                              <TableCell>{format(new Date(p.dataVencimento), "dd/MM/yyyy")}</TableCell>
                              <TableCell className="text-right">{p.valorParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                              <TableCell className="text-right">{p.valorPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                              <TableCell className="text-right">{p.saldoParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                              <TableCell>
                                <Badge variant={p.status === "PAGO" ? "default" : p.status === "PARCIAL" ? "secondary" : "outline"}>
                                  {p.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {finBaixas.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-sm">Histórico de Baixas</h4>
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data Pagamento</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead>Forma</TableHead>
                          <TableHead>Observações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {finBaixas.map((b) => (
                          <TableRow key={b.id}>
                            <TableCell>{format(new Date(b.dataPagamento), "dd/MM/yyyy HH:mm")}</TableCell>
                            <TableCell className="text-right">{b.valorPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell>{b.formaPagamento}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{b.observacoes || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {finContas.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-6">
                  Nenhuma conta financeira vinculada a este contrato.
                </p>
              )}
            </div>
          </TabsContent>

          {/* ABA 5 — Condições e Descontos */}
          <TabsContent value="condicoes">
            <div className="space-y-6">
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

          {/* ABA 6 — Liquidação */}
          <TabsContent value="liquidacao">
            <div className="space-y-6">
              {/* Bloqueio A_FIXAR */}
              {editingContrato?.tipoPreco === "A_FIXAR" && saldoAFixar > 0 && (
                <Card className="border-2 border-destructive/30 bg-destructive/5">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                      <div>
                        <p className="font-semibold text-destructive">Liquidação Bloqueada</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Defina fixações para todo o volume entregue antes de liquidar.
                          Saldo a fixar: <strong>{saldoAFixar.toLocaleString("pt-BR")} {getCodigoUnidade(editingContrato.unidadeNegociacaoId)}</strong>
                        </p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => setActiveTab("fixacao")}>
                          Gerenciar Fixações →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {editingContrato?.status === "LIQUIDADO" && liquidacao?.status === "CONFIRMADA" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <FileCheck className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">Contrato Liquidado</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-md bg-card p-4 border space-y-1">
                      <p className="text-sm text-muted-foreground">Qtd. Contratada</p>
                      <p className="text-lg font-bold">{liquidacao.quantidadeContratada.toLocaleString("pt-BR")} {getCodigoUnidade(editingContrato.unidadeNegociacaoId)}</p>
                    </div>
                    <div className="rounded-md bg-card p-4 border space-y-1">
                      <p className="text-sm text-muted-foreground">Qtd. Entregue</p>
                      <p className="text-lg font-bold">{liquidacao.quantidadeEntregue.toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="rounded-md bg-card p-4 border space-y-1">
                      <p className="text-sm text-muted-foreground">Qtd. Liquidada</p>
                      <p className="text-lg font-bold">{liquidacao.quantidadeLiquidada.toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="rounded-md bg-card p-4 border space-y-1">
                      <p className="text-sm text-muted-foreground">Preço Unitário</p>
                      <p className="text-lg font-bold">
                        {getSimboloMoeda(editingContrato.moedaId)} {liquidacao.precoUnitario.toFixed(2)}
                        {editingContrato.tipoPreco === "A_FIXAR" && (
                          <span className="text-xs text-muted-foreground ml-1">(média ponderada)</span>
                        )}
                      </p>
                    </div>
                    <div className="rounded-md bg-card p-4 border space-y-1">
                      <p className="text-sm text-muted-foreground">Valor Bruto</p>
                      <p className="text-lg font-bold">
                        {getSimboloMoeda(editingContrato.moedaId)} {liquidacao.valorBruto.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="rounded-md bg-card p-4 border space-y-1">
                      <p className="text-sm text-muted-foreground">Descontos</p>
                      <p className="text-lg font-bold text-destructive">
                        - {getSimboloMoeda(editingContrato.moedaId)} {liquidacao.valorDescontos.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="rounded-md bg-card p-4 border space-y-1">
                      <p className="text-sm text-muted-foreground">Valor Líquido</p>
                      <p className="text-lg font-bold text-primary">
                        {getSimboloMoeda(editingContrato.moedaId)} {liquidacao.valorLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Romaneios usados na liquidação */}
                  {romaneiosContrato.filter(r => r.status === "FINALIZADO").length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground text-sm">Volume Físico Entregue (Romaneios Finalizados)</h4>
                      <div className="overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead className="text-right">Peso Líquido</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {romaneiosContrato.filter(r => r.status === "FINALIZADO").map((r) => (
                              <TableRow key={r.id}>
                                <TableCell className="font-mono text-xs">{r.id.substring(0, 8)}</TableCell>
                                <TableCell>{format(new Date(r.criadoEm), "dd/MM/yyyy")}</TableCell>
                                <TableCell className="text-right font-medium">{r.pesoLiquido.toFixed(3)}</TableCell>
                                <TableCell><Badge variant="outline">FINALIZADO</Badge></TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="font-bold bg-muted/50">
                              <TableCell colSpan={2}>TOTAL ENTREGUE</TableCell>
                              <TableCell className="text-right">
                                {romaneiosContrato.filter(r => r.status === "FINALIZADO").reduce((s, r) => s + r.pesoLiquido, 0).toFixed(3)}
                              </TableCell>
                              <TableCell />
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {liquidacao && liquidacao.status === "PREVIA" ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-amber-500">
                        <AlertTriangle className="h-5 w-5" />
                        <h3 className="font-semibold text-lg text-foreground">Simulação de Liquidação</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-md bg-card p-4 border space-y-1">
                          <p className="text-sm text-muted-foreground">Qtd. Contratada</p>
                          <p className="text-lg font-bold">{liquidacao.quantidadeContratada.toLocaleString("pt-BR")} {editingContrato ? getCodigoUnidade(editingContrato.unidadeNegociacaoId) : ""}</p>
                        </div>
                        <div className="rounded-md bg-card p-4 border space-y-1">
                          <p className="text-sm text-muted-foreground">Qtd. Entregue</p>
                          <p className="text-lg font-bold">{liquidacao.quantidadeEntregue.toLocaleString("pt-BR")}</p>
                        </div>
                        <div className="rounded-md bg-card p-4 border space-y-1">
                          <p className="text-sm text-muted-foreground">Qtd. Liquidada</p>
                          <p className="text-lg font-bold">{liquidacao.quantidadeLiquidada.toLocaleString("pt-BR")}</p>
                        </div>
                        <div className="rounded-md bg-card p-4 border space-y-1">
                          <p className="text-sm text-muted-foreground">Preço Unitário</p>
                          <p className="text-lg font-bold">
                            {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")} {liquidacao.precoUnitario.toFixed(2)}
                            {editingContrato?.tipoPreco === "A_FIXAR" && (
                              <span className="text-xs text-muted-foreground ml-1">(média ponderada)</span>
                            )}
                          </p>
                        </div>
                        <div className="rounded-md bg-card p-4 border space-y-1">
                          <p className="text-sm text-muted-foreground">Valor Bruto</p>
                          <p className="text-lg font-bold">
                            {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")} {liquidacao.valorBruto.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="rounded-md bg-card p-4 border space-y-1">
                          <p className="text-sm text-muted-foreground">Descontos</p>
                          <p className="text-lg font-bold text-destructive">
                            - {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")} {liquidacao.valorDescontos.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="rounded-md bg-card p-4 border space-y-1">
                          <p className="text-sm text-muted-foreground">Valor Líquido</p>
                          <p className="text-lg font-bold text-primary">
                            {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")} {liquidacao.valorLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>

                      {/* Fixações usadas (para A_FIXAR) */}
                      {editingContrato?.tipoPreco === "A_FIXAR" && fixacoes.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Fixações Utilizadas</h4>
                          <div className="overflow-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Data</TableHead>
                                  <TableHead className="text-right">Quantidade</TableHead>
                                  <TableHead className="text-right">Preço</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {fixacoes.map((f) => (
                                  <TableRow key={f.id}>
                                    <TableCell>{format(new Date(f.dataFixacao), "dd/MM/yyyy")}</TableCell>
                                    <TableCell className="text-right">{f.quantidadeFixada.toLocaleString("pt-BR")}</TableCell>
                                    <TableCell className="text-right">{getSimboloMoeda(f.moedaId)} {f.precoFixado.toFixed(2)}</TableCell>
                                  </TableRow>
                                ))}
                                <TableRow className="font-bold bg-muted/50">
                                  <TableCell>PREÇO MÉDIO PONDERADO</TableCell>
                                  <TableCell className="text-right">{totalFixado.toLocaleString("pt-BR")}</TableCell>
                                  <TableCell className="text-right">{getSimboloMoeda(editingContrato.moedaId)} {precoMedioFixado.toFixed(2)}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}

                      <div className="rounded-md border p-4 space-y-3">
                        <h4 className="text-sm font-semibold">Opções de Confirmação</h4>
                        <div className="space-y-2">
                          <Label className="text-sm">Tratamento de Títulos Financeiros</Label>
                          <Select value={opcaoTitulos} onValueChange={(v) => setOpcaoTitulos(v as any)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ATUALIZAR">Atualizar parcelas pendentes</SelectItem>
                              <SelectItem value="COMPLEMENTAR">Criar título complementar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button onClick={() => setConfirmDialogOpen(true)} disabled={liquidacaoLoading}>
                          <FileCheck className="mr-2 h-4 w-4" />Confirmar e Efetivar
                        </Button>
                        <Button variant="outline" onClick={onGerarPrevia} disabled={liquidacaoLoading}>
                          Recalcular Simulação
                        </Button>
                        <Button variant="destructive" onClick={onCancelarLiquidacao} disabled={liquidacaoLoading}>
                          Cancelar Simulação
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 py-6">
                      <p className="text-sm text-muted-foreground">Nenhuma liquidação gerada para este contrato.</p>
                      <Button
                        onClick={onGerarPrevia}
                        disabled={liquidacaoLoading || !canLiquidate}
                      >
                        <FileCheck className="mr-2 h-4 w-4" />Gerar Simulação de Liquidação
                      </Button>
                      {editingContrato?.tipoPreco === "A_FIXAR" && saldoAFixar > 0 && (
                        <p className="text-xs text-destructive">Fixe todo o volume entregue antes de liquidar.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
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

      {/* Liquidação Confirm Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar e Efetivar Liquidação</AlertDialogTitle>
            <AlertDialogDescription>
              Ao confirmar, o contrato será encerrado (LIQUIDADO) e os títulos financeiros serão atualizados.
              Estoque NÃO será alterado (já foi movimentado pelos romaneios).
              Esta ação não pode ser desfeita facilmente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmarLiquidacao}>
              Confirmar e Efetivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
