import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { CrudModal } from "@/components/CrudModal";
import { FormRow } from "@/components/FormRow";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  contratoService,
  contratoFixacaoService,
  pontoEstoqueService,
  moedaService,
  condicaoDescontoModeloService,
  contratoCondicaoService,
  classificacaoTipoService,
  contratoLiquidacaoService,
  financeiroContaService,
  financeiroParcelaService,
  financeiroBaixaService,
  financeiroMovimentacaoService,
  filialService,
  romaneioService,
  produtoService,
  empresaService,
  descontoTipoService,
} from "@/lib/services";
import {
  pessoas as mockPessoas,
  produtos as mockProdutos,
  unidadesMedida as mockUnidades,
  moedas as mockMoedas,
  empresas as mockEmpresas,
  financeiroFormasPagto as mockFormasPagto,
  getUnidadeBaseParaTipo,
} from "@/lib/mock-data";
import type {
  Contrato,
  ContratoFixacao,
  PontoEstoque,
  Moeda,
  Filial,
  Romaneio,
  Empresa,
  CondicaoDescontoModelo,
  ContratoCondicao,
  TipoCondicaoDesconto,
  ContratoLiquidacao,
  FinanceiroConta,
  FinanceiroParcela,
  FinanceiroBaixa,
  FinanceiroMovimentacao,
  DescontoTipo,
  DescontoEmpresaConfig,
} from "@/lib/mock-data";
import { Plus, Pencil, Trash2, Eye, Lock, FileCheck, AlertTriangle, ExternalLink, Info, Clock, Building2, GitBranch, RefreshCw, DollarSign, ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown, Filter, CheckCircle2, XCircle, AlertCircle, MinusCircle } from "lucide-react";

// TODO: tornar configurável por contrato (campos tolerancia_percentual_menos / _mais)
const TOLERANCIA_FISICA_PADRAO = 0.02; // 2%
import { SearchableSelect, type SearchableOption } from "@/components/SearchableSelect";
import { formatMoeda, formatDateBR } from "@/lib/format";

const TODAS_EMPRESAS = "__TODAS__";
const TODAS_FILIAIS = "__TODAS__";

// ---- Currency formatting helpers ----
// Uses the dynamic symbol-based formatter so any moeda (R$, $, €, £, …)
// is rendered with locale-correct separators. Kept signature backward-compatible:
// the second argument may be the moeda código (BRL/USD/EUR/GBP) — we map it to símbolo.
function formatCurrency(value: number, moedaCodigoOuSimbolo: string): string {
  const codigoToSimbolo: Record<string, string> = {
    BRL: "R$", USD: "$", EUR: "€", GBP: "£",
  };
  const simbolo = codigoToSimbolo[moedaCodigoOuSimbolo] ?? moedaCodigoOuSimbolo ?? "R$";
  return formatMoeda(value || 0, simbolo);
}

// ---- Schemas ----
const contratoSchema = z.object({
  empresaId: z.string().min(1, "Empresa é obrigatória"),
  filialId: z.string().optional(),
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
});
type ContratoForm = z.infer<typeof contratoSchema>;

const fixacaoSchema = z.object({
  dataFixacao: z.string().min(1, "Data é obrigatória"),
  quantidadeFixada: z.coerce.number().positive("Quantidade deve ser > 0"),
  unidadeFixacaoId: z.string().min(1, "Unidade é obrigatória"),
  precoFixado: z.coerce.number().positive("Preço deve ser > 0"),
  moedaId: z.string().min(1, "Moeda é obrigatória"),
  observacoes: z.string().min(1, "Observações são obrigatórias (motivo da fixação)"),
});
type FixacaoForm = z.infer<typeof fixacaoSchema>;

// ---- Status Badge (delegates to global StatusBadge) ----
import { StatusBadge } from "@/components/StatusBadge";

export default function ContratosPage() {
  const { grupoAtual, empresaAtual, empresas: orgEmpresas, filiais: orgFiliais } = useOrganization();
  const empresaIdGlobal = empresaAtual?.id ?? "";
  const grupoId = grupoAtual?.id ?? "";

  // ---- LOCAL CONTEXT (Parte 1 & 5) ----
  const [localEmpresaId, setLocalEmpresaId] = useState<string>(empresaIdGlobal || TODAS_EMPRESAS);
  const [localFilialId, setLocalFilialId] = useState<string>(TODAS_FILIAIS);
  const [isSyncedWithGlobal, setIsSyncedWithGlobal] = useState(true);
  const [globalChangedWarning, setGlobalChangedWarning] = useState(false);
  const prevGlobalEmpresaRef = useRef(empresaIdGlobal);
  const [localFiliais, setLocalFiliais] = useState<Filial[]>([]);

  // Initialize local context from global on first load (when empresa becomes available)
  const didInitRef = useRef(false);
  useEffect(() => {
    if (!didInitRef.current && empresaIdGlobal) {
      didInitRef.current = true;
      setLocalEmpresaId(empresaIdGlobal);
      setIsSyncedWithGlobal(true);
    }
  }, [empresaIdGlobal]);

  // Load filiais for local empresa selection
  useEffect(() => {
    if (localEmpresaId && localEmpresaId !== TODAS_EMPRESAS) {
      filialService.listarPorEmpresa(localEmpresaId).then(setLocalFiliais);
    } else {
      setLocalFiliais([]);
    }
  }, [localEmpresaId]);

  // Detect global context changes (Parte 5)
  useEffect(() => {
    const prevGlobal = prevGlobalEmpresaRef.current;
    prevGlobalEmpresaRef.current = empresaIdGlobal;
    if (prevGlobal && prevGlobal !== empresaIdGlobal) {
      if (isSyncedWithGlobal) {
        // Still synced - follow global
        setLocalEmpresaId(empresaIdGlobal);
        setLocalFilialId(TODAS_FILIAIS);
      } else {
        // Desynced - show warning
        setGlobalChangedWarning(true);
      }
    }
  }, [empresaIdGlobal, isSyncedWithGlobal]);

  const handleLocalEmpresaChange = useCallback((value: string) => {
    setLocalEmpresaId(value);
    setLocalFilialId(TODAS_FILIAIS);
    setIsSyncedWithGlobal(false);
    setGlobalChangedWarning(false);
  }, []);

  const handleLocalFilialChange = useCallback((value: string) => {
    setLocalFilialId(value);
    setIsSyncedWithGlobal(false);
    setGlobalChangedWarning(false);
  }, []);

  const handleUsarContextoGlobal = useCallback(() => {
    setLocalEmpresaId(empresaIdGlobal || TODAS_EMPRESAS);
    setLocalFilialId(TODAS_FILIAIS);
    setIsSyncedWithGlobal(true);
    setGlobalChangedWarning(false);
  }, [empresaIdGlobal]);

  // Effective empresa for loading (backwards compat)
  const empresaId = localEmpresaId === TODAS_EMPRESAS ? "" : localEmpresaId;

  // Context label
  const contextLabel = useMemo(() => {
    const empNome = localEmpresaId === TODAS_EMPRESAS
      ? "Todas as Empresas"
      : orgEmpresas.find(e => e.id === localEmpresaId)?.nome ?? "";
    const filNome = localFilialId === TODAS_FILIAIS
      ? "Todas as Filiais"
      : localFiliais.find(f => f.id === localFilialId)?.nomeRazao ?? "";
    if (localEmpresaId === TODAS_EMPRESAS) return `Exibindo contratos consolidados — ${empNome}`;
    return `Exibindo contratos da ${empNome} / ${filNome}`;
  }, [localEmpresaId, localFilialId, orgEmpresas, localFiliais]);

  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(false);
  const [filiaisEmpresa, setFiliaisEmpresa] = useState<Filial[]>([]);

  // Filtro Status (somente status reais de contrato)
  const TODOS_STATUS = "__TODOS__";
  const [statusFiltro, setStatusFiltro] = useState<string>(TODOS_STATUS);

  // Filtro por período (Data do Contrato)
  const [dataInicioFiltro, setDataInicioFiltro] = useState<string>("");
  const [dataFimFiltro, setDataFimFiltro] = useState<string>("");

  // Ordenação manual da tabela (clique no cabeçalho).
  // Quando null → usa ordenação padrão Empresa ASC → Filial ASC → dataContrato DESC.
  type SortKey =
    | "empresa" | "filial" | "status" | "numero" | "data" | "pessoa" | "produto"
    | "tipo" | "volTotal" | "volPendente" | "preco";
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const clearSort = () => {
    setSortKey(null);
    setSortDir("asc");
  };

  // Filiais for the empresa selected in the contract form (may differ from session empresa)
  const [contratoFiliaisEmpresa, setContratoFiliaisEmpresa] = useState<Filial[]>([]);

  // Official discount types for contract
  const [officialDescontos, setOfficialDescontos] = useState<
    (DescontoEmpresaConfig & { descontoTipo: DescontoTipo })[]
  >([]);

  // Filter only descontos applicable to contracts (contrato or ambos)
  const officialDescontosContrato = useMemo(
    () =>
      officialDescontos.filter((d) => d.descontoTipo.aplicacao === "contrato" || d.descontoTipo.aplicacao === "ambos"),
    [officialDescontos],
  );

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
  const [finMovs, setFinMovs] = useState<FinanceiroMovimentacao[]>([]);

  // Gerar contas modal
  const [gerarContasOpen, setGerarContasOpen] = useState(false);
  const [gcNumParcelas, setGcNumParcelas] = useState("1");
  const [gcFrequencia, setGcFrequencia] = useState<"MENSAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL" | "PERSONALIZADO">("MENSAL");
  const [gcDiasPersonalizado, setGcDiasPersonalizado] = useState("30");
  const [gcDataPrimeiraParcela, setGcDataPrimeiraParcela] = useState(new Date().toISOString().slice(0, 10));
  const [gcParcelasEditaveis, setGcParcelasEditaveis] = useState<{ numeroParcela: number; dataVencimento: string; valorParcela: number }[]>([]);
  const [gcParcelasGeradas, setGcParcelasGeradas] = useState(false);
  const [gcSaving, setGcSaving] = useState(false);
  const [autoGerarDuplicatasContrato, setAutoGerarDuplicatasContrato] = useState<Contrato | null>(null);
  const [fixacaoParaDuplicata, setFixacaoParaDuplicata] = useState<ContratoFixacao | null>(null);
  const [expandedParcelaId, setExpandedParcelaId] = useState<string | null>(null);

  // Forms
  const contratoForm = useForm<ContratoForm>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      empresaId: empresaId,
      filialId: "",
      tipoContrato: "COMPRA",
      pessoaId: "",
      produtoId: "",
      unidadeNegociacaoId: "",
      quantidadeTotal: 0,
      moedaId: "moeda1",
      precoUnitario: 0,
      tipoPreco: "FIXO",
      dataContrato: new Date().toISOString().slice(0, 10),
      dataEntregaInicio: "",
      dataEntregaFim: "",
      filialOperacaoId: "",
      filialOrigemId: "",
      filialDestinoId: "",
      observacoes: "",
    },
  });

  const fixacaoForm = useForm<FixacaoForm>({
    resolver: zodResolver(fixacaoSchema),
    defaultValues: {
      dataFixacao: new Date().toISOString().slice(0, 16),
      quantidadeFixada: 0,
      unidadeFixacaoId: "",
      precoFixado: 0,
      moedaId: "moeda1",
      observacoes: "",
    },
  });

  const tipoPrecoWatch = contratoForm.watch("tipoPreco");
  const filialOperacaoWatch = contratoForm.watch("filialOperacaoId");
  const produtoIdWatch = contratoForm.watch("produtoId");
  const tipoContratoWatch = contratoForm.watch("tipoContrato");
  const empresaIdWatch = contratoForm.watch("empresaId");

  // Movement detection - determines if empresa/filial can be edited
  const hasMovements = useMemo(() => {
    if (!editingContrato) return false;
    return (
      romaneiosContrato.length > 0 ||
      fixacoes.length > 0 ||
      finContas.length > 0 ||
      liquidacao !== null ||
      editingContrato.status === "PARCIAL" ||
      editingContrato.status === "FINALIZADO" ||
      editingContrato.status === "CANCELADO" ||
      editingContrato.status === "LIQUIDADO"
    );
  }, [editingContrato, romaneiosContrato, fixacoes, finContas, liquidacao]);

  const canEditEmpresaFilial = !editingContrato || !hasMovements;

  // Price suggestion state
  const [precoSugestao, setPrecoSugestao] = useState<{
    valor: number;
    origem: string;
    breakdown: { tipo: string; percentual: number; valor: number }[];
  } | null>(null);
  const [precoSugestaoLoading, setPrecoSugestaoLoading] = useState(false);

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

  // Auto-fill price when product or type changes
  useEffect(() => {
    if (!produtoIdWatch || !empresaId) {
      setPrecoSugestao(null);
      return;
    }
    let cancelled = false;
    setPrecoSugestaoLoading(true);
    produtoService.getPrecoProduto(produtoIdWatch, tipoContratoWatch, empresaId).then((result) => {
      if (cancelled) return;
      setPrecoSugestao(result);
      // Only auto-fill price for new contracts with FIXO type
      if (!editingContrato && tipoPrecoWatch !== "A_FIXAR" && result && result.valor > 0) {
        contratoForm.setValue("precoUnitario", result.valor);
        setPrecoDisplay(formatCurrency(result.valor, moedaCodigo));
      }
      // Force price to 0 for A_FIXAR
      if (tipoPrecoWatch === "A_FIXAR") {
        contratoForm.setValue("precoUnitario", 0);
        setPrecoDisplay("");
      }
      setPrecoSugestaoLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [produtoIdWatch, tipoContratoWatch, empresaId, editingContrato, tipoPrecoWatch]);

  const loadContratos = async () => {
    if (!grupoId) return;
    setLoading(true);
    let list: Contrato[];
    if (localEmpresaId === TODAS_EMPRESAS) {
      list = await contratoService.listarTodos(grupoId);
    } else if (localFilialId === TODAS_FILIAIS) {
      list = await contratoService.listarPorEmpresa(localEmpresaId);
    } else {
      list = await contratoService.listar(localEmpresaId, localFilialId);
    }
    setContratos(list);
    setLoading(false);
  };

  useEffect(() => {
    loadContratos();
  }, [localEmpresaId, localFilialId, grupoId]);

  useEffect(() => {
    if (empresaId) {
      condicaoDescontoModeloService.listarPorEmpresa(empresaId).then(setModelosCondicao);
      filialService.listarPorEmpresa(empresaId).then(setFiliaisEmpresa);
    }
    moedaService.listar().then(setMoedas);
    classificacaoTipoService.listarTodos().then(() => {});
  }, [empresaId]);

  // Load filiais + descontos for the empresa selected in the contract form
  useEffect(() => {
    if (empresaIdWatch) {
      filialService.listarPorEmpresa(empresaIdWatch).then(setContratoFiliaisEmpresa);
      condicaoDescontoModeloService.listarPorEmpresa(empresaIdWatch).then(setModelosCondicao);
      descontoTipoService.listarConfigsPorEmpresa(empresaIdWatch).then(setOfficialDescontos);
    } else {
      setContratoFiliaisEmpresa([]);
      setOfficialDescontos([]);
    }
  }, [empresaIdWatch]);

  useEffect(() => {
    if (empresaId && filialOperacaoWatch) {
      pontoEstoqueService.listar(empresaId, filialOperacaoWatch).then(setPontos);
    } else {
      setPontos([]);
    }
  }, [empresaId, filialOperacaoWatch]);

  // Pessoas are GLOBAL - not filtered by empresa
  const pessoasAtivas = useMemo(() => mockPessoas.filter((p) => p.deletadoEm === null && p.ativo), []);
  const produtosAtivos = useMemo(
    () => mockProdutos.filter((p) => p.deletadoEm === null && p.ativo && p.empresaId === (empresaIdWatch || empresaId)),
    [empresaIdWatch, empresaId],
  );
  const unidadesAtivas = useMemo(() => mockUnidades.filter((u) => u.deletadoEm === null && u.ativo), []);

  // Searchable options for Pessoa
  const pessoaOptions: SearchableOption[] = useMemo(
    () =>
      pessoasAtivas.map((p) => ({
        id: p.id,
        label: p.nomeRazao,
        sublabel: p.cpfCnpj,
        meta: p.relacaoComercial.join(", "),
      })),
    [pessoasAtivas],
  );

  // Searchable options for Produto
  const produtoOptions: SearchableOption[] = useMemo(
    () =>
      produtosAtivos.map((p) => {
        const unBase = mockUnidades.find((u) => u.id === getUnidadeBaseParaTipo(p.tipoUnidade));
        return {
          id: p.id,
          label: p.descricao,
          sublabel: p.codigoBarras || undefined,
          meta: unBase?.codigo ?? "",
        };
      }),
    [produtosAtivos],
  );

  // Currency watch
  const moedaIdWatch = contratoForm.watch("moedaId");
  const precoWatch = contratoForm.watch("precoUnitario");
  const moedaCodigo = useMemo(() => mockMoedas.find((m) => m.id === moedaIdWatch)?.codigo ?? "BRL", [moedaIdWatch]);
  const [precoDisplay, setPrecoDisplay] = useState("");

  // Sync price display on blur
  const handlePrecoBlur = useCallback(() => {
    const val = contratoForm.getValues("precoUnitario");
    if (val && val > 0) {
      setPrecoDisplay(formatCurrency(val, moedaCodigo));
    } else {
      setPrecoDisplay("");
    }
  }, [moedaCodigo]);

  // Update display when moeda changes
  useEffect(() => {
    const val = contratoForm.getValues("precoUnitario");
    if (val && val > 0) {
      setPrecoDisplay(formatCurrency(val, moedaCodigo));
    }
  }, [moedaCodigo]);

  const handlePrecoFocus = useCallback(() => {
    setPrecoDisplay("");
  }, []);

  // Helpers
  const getNomePessoa = (id: string) => mockPessoas.find((p) => p.id === id)?.nomeRazao ?? id;
  const getNomeProduto = (id: string) => mockProdutos.find((p) => p.id === id)?.descricao ?? id;
  const getCodigoUnidade = (id: string) => mockUnidades.find((u) => u.id === id)?.codigo ?? id;
  const getSimboloMoeda = (id: string) => mockMoedas.find((m) => m.id === id)?.simbolo ?? "";
  const getCodigoMoeda = (id: string) => mockMoedas.find((m) => m.id === id)?.codigo ?? id;
  const getNomeFilial = (id: string | null) => {
    if (!id) return "—";
    // Search across all known filiais
    const fromLocal = localFiliais.find((f) => f.id === id);
    if (fromLocal) return fromLocal.nomeRazao;
    const fromEmpresa = filiaisEmpresa.find((f) => f.id === id);
    if (fromEmpresa) return fromEmpresa.nomeRazao;
    return id;
  };
  const getNomeEmpresa = (id: string) => orgEmpresas.find((e) => e.id === id)?.nome ?? mockEmpresas.find((e) => e.id === id)?.nome ?? id;

  // ---- Lista filtrada + ordenada para a tabela ----
  // Filtro por status + ordenação padrão (Empresa ASC → Filial ASC → dataContrato DESC)
  // ou ordenação manual quando o usuário clica num cabeçalho.
  const contratosOrdenados = useMemo(() => {
    let filtered = statusFiltro === TODOS_STATUS
      ? contratos
      : contratos.filter((c) => c.status === statusFiltro);

    // Filtro por período da data do contrato
    if (dataInicioFiltro) {
      filtered = filtered.filter((c) => c.dataContrato >= dataInicioFiltro);
    }
    if (dataFimFiltro) {
      filtered = filtered.filter((c) => c.dataContrato <= dataFimFiltro);
    }

    const arr = [...filtered];

    if (!sortKey) {
      // Ordenação padrão
      arr.sort((a, b) => {
        const empA = getNomeEmpresa(a.empresaId).toLowerCase();
        const empB = getNomeEmpresa(b.empresaId).toLowerCase();
        if (empA !== empB) return empA.localeCompare(empB);
        const filA = getNomeFilial(a.filialId).toLowerCase();
        const filB = getNomeFilial(b.filialId).toLowerCase();
        if (filA !== filB) return filA.localeCompare(filB);
        const dA = new Date(a.dataContrato).getTime();
        const dB = new Date(b.dataContrato).getTime();
        return dB - dA; // mais recentes primeiro
      });
      return arr;
    }

    // Ordenação manual
    const dirMul = sortDir === "asc" ? 1 : -1;
    const valueOf = (c: Contrato): string | number => {
      switch (sortKey) {
        case "empresa": return getNomeEmpresa(c.empresaId).toLowerCase();
        case "filial": return getNomeFilial(c.filialId).toLowerCase();
        case "status": return c.status;
        case "numero": return c.numeroContrato;
        case "data": return new Date(c.dataContrato).getTime();
        case "pessoa": return getNomePessoa(c.pessoaId).toLowerCase();
        case "produto": return getNomeProduto(c.produtoId).toLowerCase();
        case "tipo": return c.tipoContrato;
        case "volTotal": return c.quantidadeTotal;
        case "volPendente": return c.quantidadeSaldo;
        case "preco": return c.precoUnitario;
      }
    };
    arr.sort((a, b) => {
      const va = valueOf(a);
      const vb = valueOf(b);
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dirMul;
      return String(va).localeCompare(String(vb)) * dirMul;
    });
    return arr;
  }, [contratos, statusFiltro, dataInicioFiltro, dataFimFiltro, sortKey, sortDir, orgEmpresas, localFiliais, filiaisEmpresa]);

  // Status disponíveis no filtro (apenas os reais de Contrato)
  const STATUS_CONTRATO_OPCOES: { value: string; label: string }[] = [
    { value: "ABERTO", label: "Aberto" },
    { value: "PARCIAL", label: "Parcial" },
    { value: "FATURADO", label: "Faturado" },
    { value: "LIQUIDADO", label: "Liquidado" },
    { value: "CANCELADO", label: "Cancelado" },
  ];

  // Helper: ícone de ordenação para o cabeçalho
  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    return sortDir === "asc"
      ? <ArrowUp className="h-3 w-3" />
      : <ArrowDown className="h-3 w-3" />;
  };

  // ---- Fixação computed values ----
  const totalEntregue = useMemo(() => {
    return romaneiosContrato.filter((r) => r.status === "FINALIZADO").reduce((s, r) => s + r.pesoLiquido, 0);
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
    // Parte 4: Inherit listing context
    const newEmpresaId = localEmpresaId === TODAS_EMPRESAS ? "" : localEmpresaId;
    const newFilialId = localFilialId === TODAS_FILIAIS ? "" : localFilialId;
    contratoForm.reset({
      empresaId: newEmpresaId,
      filialId: newFilialId,
      tipoContrato: "COMPRA",
      pessoaId: "",
      produtoId: "",
      unidadeNegociacaoId: "",
      quantidadeTotal: 0,
      moedaId: "moeda1",
      precoUnitario: 0,
      tipoPreco: "FIXO",
      dataContrato: new Date().toISOString().slice(0, 10),
      dataEntregaInicio: "",
      dataEntregaFim: "",
      filialOperacaoId: "",
      filialOrigemId: "",
      filialDestinoId: "",
      observacoes: "",
    });
    setRomaneiosContrato([]);
    setFixacoes([]);
    setCondicoes([]);
    setFinContas([]);
    setFinParcelas([]);
    setFinBaixas([]);
    setFinMovs([]);
    setLiquidacao(null);
    setJustificativaDivergencia("");
    setActiveTab("dados");
    setModalOpen(true);
  };

  const openEdit = (c: Contrato) => {
    setEditingContrato(c);
    setViewOnly(false);
    contratoForm.reset({
      empresaId: c.empresaId,
      filialId: c.filialId ?? "",
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

  // Handle empresa change in contract form
  const handleContratoEmpresaChange = useCallback(
    (newEmpresaId: string) => {
      contratoForm.setValue("empresaId", newEmpresaId, { shouldValidate: true });
      // Clear dependent fields
      contratoForm.setValue("filialId", "");
      contratoForm.setValue("produtoId", "");
      contratoForm.setValue("filialOperacaoId", "");
      contratoForm.setValue("filialOrigemId", "");
      contratoForm.setValue("filialDestinoId", "");
      // Clear conditions
      setCondicoes([]);
    },
    [contratoForm],
  );

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
      const [parcelas, baixas, movs] = await Promise.all([
        financeiroParcelaService.listarPorContas(contaIds),
        Promise.all(contaIds.map((id) => financeiroBaixaService.listarPorConta(id))).then((arr) => arr.flat()),
        Promise.all(contaIds.map((id) => financeiroMovimentacaoService.listarPorConta(id))).then((arr) => arr.flat()),
      ]);
      setFinParcelas(parcelas);
      setFinBaixas(baixas);
      setFinMovs(movs);
    } else {
      setFinParcelas([]);
      setFinBaixas([]);
      setFinMovs([]);
    }
  };

  const onSaveContrato = contratoForm.handleSubmit(async (data) => {
    if (!grupoId) return;
    const contractEmpresaId = data.empresaId || empresaId;
    if (!contractEmpresaId) return;

    // Validate mandatory descontos are applied (only for editing, when tab is available)
    if (editingContrato) {
      const obrigatoriosContrato = officialDescontosContrato.filter((d) => d.descontoTipo.obrigatorio && d.ativo);
      const naoAplicados = obrigatoriosContrato.filter(
        (cfg) => !condicoes.some((c) => c.descricao.toUpperCase().includes(cfg.descontoTipo.nome.toUpperCase())),
      );
      if (naoAplicados.length > 0) {
        toast({
          title: "Descontos obrigatórios pendentes",
          description: `Aplique os descontos obrigatórios antes de salvar: ${naoAplicados.map((d) => d.descontoTipo.nome).join(", ")}`,
          variant: "destructive",
        });
        setActiveTab("condicoes");
        return;
      }
    }

    // Detect if contract will move out of current filter
    const willMoveOut = editingContrato && (
      (localEmpresaId !== TODAS_EMPRESAS && contractEmpresaId !== localEmpresaId) ||
      (localFilialId !== TODAS_FILIAIS && data.filialId && data.filialId !== localFilialId)
    );

    const isNewContract = !editingContrato;
    setSaving(true);
    try {
      const saved = await contratoService.salvar(
        {
          ...data,
          id: editingContrato?.id,
          empresaId: contractEmpresaId,
          filialId: data.filialId || "",
          filialOperacaoId: data.filialOperacaoId || null,
          filialOrigemId: data.filialOrigemId || null,
          filialDestinoId: data.filialDestinoId || null,
        },
        {
          grupoId,
          empresaId: contractEmpresaId,
          filialId: data.filialId || data.filialOperacaoId || contractEmpresaId,
        },
      );
      if (willMoveOut) {
        toast({
          title: "Contrato movido",
          description: "O contrato foi movido para outro contexto organizacional e pode não aparecer nos filtros atuais.",
        });
      } else {
        toast({ title: "Sucesso", description: editingContrato ? "Contrato atualizado." : "Contrato criado." });
      }
      setModalOpen(false);
      loadContratos();

      // Auto-open duplicatas modal for new FIXO contracts
      if (isNewContract && data.tipoPreco === "FIXO" && saved) {
        setAutoGerarDuplicatasContrato(saved);
        setEditingContrato(saved);
        setGcNumParcelas("1");
        setGcFrequencia("MENSAL");
        setGcDiasPersonalizado("30");
        setGcDataPrimeiraParcela(new Date().toISOString().slice(0, 10));
        setGcParcelasEditaveis([]);
        setGcParcelasGeradas(false);
        setGerarContasOpen(true);
      } else if (isNewContract && data.tipoPreco === "A_FIXAR" && saved) {
        toast({
          title: "Contrato A Fixar criado",
          description: "Registre fixações de preço para gerar as duplicatas correspondentes.",
        });
      }
    } catch {
      toast({ title: "Erro", description: "Falha ao salvar contrato.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
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
      quantidadeFixada: saldoAFixar > 0 ? saldoAFixar : 0,
      unidadeFixacaoId: editingContrato?.unidadeNegociacaoId ?? "",
      precoFixado: precoSugestao?.valor ?? 0,
      moedaId: editingContrato?.moedaId ?? "moeda1",
      observacoes: "",
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
        { grupoId, empresaId, filialId: "" },
      );
      if (result.sucesso) {
        toast({ title: "Sucesso", description: result.mensagem });
        setFixacaoModalOpen(false);
        await loadSubEntities(editingContrato.id);
        // Após nova fixação (não edição), abrir modal de duplicatas com valor pré-calculado
        if (!editingFixacao && result.fixacao) {
          setFixacaoParaDuplicata(result.fixacao);
          setAutoGerarDuplicatasContrato(editingContrato);
          setGcNumParcelas("1");
          setGcFrequencia("MENSAL");
          setGcDiasPersonalizado("30");
          setGcDataPrimeiraParcela(new Date().toISOString().slice(0, 10));
          setGcParcelasEditaveis([]);
          setGcParcelasGeradas(false);
          setGerarContasOpen(true);
        }
      } else {
        toast({ title: "Erro", description: result.mensagem, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro", description: "Falha ao salvar fixação.", variant: "destructive" });
    } finally {
      setSavingFixacao(false);
    }
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
    const novas = await contratoCondicaoService.aplicarModelo(editingContrato.id, modeloId, {
      grupoId,
      empresaId,
      filialId: editingContrato.filialId,
    });
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
        { grupoId, empresaId, filialId: editingContrato.filialId },
      );
      toast({ title: "Sucesso", description: editingCondicao ? "Condição atualizada." : "Condição adicionada." });
      setCondicaoModalOpen(false);
      const conds = await contratoCondicaoService.listarPorContrato(editingContrato.id);
      setCondicoes(conds);
    } catch {
      toast({ title: "Erro", description: "Falha ao salvar condição.", variant: "destructive" });
    } finally {
      setSavingCondicao(false);
    }
  };

  const onDeleteCondicao = async (id: string) => {
    if (!editingContrato) return;
    await contratoCondicaoService.excluir(id);
    toast({ title: "Sucesso", description: "Condição excluída." });
    const conds = await contratoCondicaoService.listarPorContrato(editingContrato.id);
    setCondicoes(conds);
  };

  // ---- Financeiro real ----
  const totalParcelasPendentes = finParcelas
    .filter((p) => p.status === "PENDENTE" || p.status === "PARCIAL")
    .reduce((s, p) => s + p.saldoParcela, 0);
  const totalBaixas = finBaixas.reduce((s, b) => s + b.valorPago, 0);

  // ---- Liquidação handlers ----
  const [justificativaDivergencia, setJustificativaDivergencia] = useState("");

  const canLiquidate = useMemo(() => {
    if (!editingContrato) return false;
    if (editingContrato.tipoPreco === "A_FIXAR" && saldoAFixar > 0) return false;
    if (editingContrato.status === "CANCELADO" || editingContrato.status === "LIQUIDADO") return false;
    return true;
  }, [editingContrato, saldoAFixar]);

  // Painel de validações de liquidação (5 checagens)
  type StatusValidacao = "ok" | "alerta" | "bloqueio" | "na";
  const validacoesLiquidacao = useMemo(() => {
    if (!editingContrato) {
      return { itens: [] as Array<{ id: string; label: string; status: StatusValidacao; detalhe: string; mensagem?: string }>, podeAvancar: false, bloqueios: [] as string[], alertas: [] as string[], requerJustificativa: false };
    }
    const unCod = getCodigoUnidade(editingContrato.unidadeNegociacaoId);
    const romFinal = romaneiosContrato.filter((r) => r.status === "FINALIZADO");
    const romNaoFinal = romaneiosContrato.filter((r) => r.status !== "FINALIZADO");
    const qtdContratada = editingContrato.quantidadeTotal ?? 0;
    const qtdEntregueLiquida = romFinal.reduce((s, r) => s + r.pesoLiquido, 0);
    const qtdEntregueBruta = romFinal.reduce((s, r) => s + ((r as any).pesoBruto ?? r.pesoLiquido), 0);
    const diferencaFisica = Math.abs(qtdContratada - qtdEntregueBruta);
    const percDif = qtdContratada > 0 ? diferencaFisica / qtdContratada : 0;
    const dentroTolerancia = percDif <= TOLERANCIA_FISICA_PADRAO;
    const toleranciaQtd = qtdContratada * TOLERANCIA_FISICA_PADRAO;

    const itens: Array<{ id: string; label: string; status: StatusValidacao; detalhe: string; mensagem?: string }> = [];

    itens.push({
      id: "romaneios_finalizados",
      label: "Romaneios Finalizados",
      status: romFinal.length >= 1 ? "ok" : "bloqueio",
      detalhe: `${romFinal.length} / ${romaneiosContrato.length} finalizados`,
      mensagem: romFinal.length === 0 ? "Contrato sem romaneios vinculados. Pelo menos 1 romaneio finalizado é obrigatório." : undefined,
    });

    itens.push({
      id: "cumprimento_fisico",
      label: "Cumprimento Físico",
      status: qtdEntregueBruta === 0 ? "bloqueio" : dentroTolerancia ? "ok" : "alerta",
      detalhe: `${qtdEntregueBruta.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} / ${qtdContratada.toLocaleString("pt-BR")} ${unCod} • Diferença ${diferencaFisica.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${unCod} (${(percDif * 100).toFixed(2)}%) • Tolerância ${(TOLERANCIA_FISICA_PADRAO * 100).toFixed(0)}% (${toleranciaQtd.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${unCod})`,
      mensagem: !dentroTolerancia && qtdEntregueBruta > 0
        ? `Cumprimento físico fora da tolerância. Diferença: ${diferencaFisica.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${unCod} (${(percDif * 100).toFixed(2)}%). Digite uma justificativa abaixo para prosseguir.`
        : undefined,
    });

    if (editingContrato.tipoPreco === "A_FIXAR") {
      itens.push({
        id: "preco_fixado",
        label: "Preço Fixado (A_FIXAR)",
        status: saldoAFixar <= 0 ? "ok" : "bloqueio",
        detalhe: `Saldo a Fixar: ${saldoAFixar.toLocaleString("pt-BR")} ${unCod}`,
        mensagem: saldoAFixar > 0 ? `Contrato A_FIXAR com saldo a fixar pendente (${saldoAFixar.toLocaleString("pt-BR")} ${unCod}). Fixe todos os preços antes de liquidar.` : undefined,
      });
    } else {
      itens.push({
        id: "preco_fixado",
        label: "Preço Fixado",
        status: "na",
        detalhe: "Contrato FIXO — não aplicável",
      });
    }

    itens.push({
      id: "qtd_liquida",
      label: "Quantidade Líquida Apurada",
      status: qtdEntregueLiquida > 0 ? "ok" : "bloqueio",
      detalhe: `${qtdEntregueLiquida.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${unCod} (após descontos)`,
      mensagem: qtdEntregueLiquida <= 0 ? "Nenhuma quantidade líquida apurada após descontos. Verifique romaneios." : undefined,
    });

    itens.push({
      id: "status_romaneios",
      label: "Romaneios com Status Válido",
      status: romNaoFinal.length === 0 ? "ok" : "bloqueio",
      detalhe: romNaoFinal.length === 0 ? "Todos finalizados" : `${romNaoFinal.length} pendentes`,
      mensagem: romNaoFinal.length > 0 ? `Existem ${romNaoFinal.length} romaneios não finalizados. Finalize todos antes de liquidar.` : undefined,
    });

    const bloqueios = itens.filter((i) => i.status === "bloqueio" && i.mensagem).map((i) => i.mensagem!);
    const alertas = itens.filter((i) => i.status === "alerta" && i.mensagem).map((i) => i.mensagem!);
    const requerJustificativa = itens.some((i) => i.status === "alerta");
    const justificativaOk = !requerJustificativa || justificativaDivergencia.trim().length >= 20;
    const podeAvancar = bloqueios.length === 0 && justificativaOk;

    return { itens, podeAvancar, bloqueios, alertas, requerJustificativa };
  }, [editingContrato, romaneiosContrato, saldoAFixar, justificativaDivergencia]);

  const onGerarPrevia = async () => {
    if (!editingContrato) return;
    if (!validacoesLiquidacao.podeAvancar) {
      const msg = validacoesLiquidacao.bloqueios[0]
        ?? (validacoesLiquidacao.requerJustificativa && justificativaDivergencia.trim().length < 20
          ? "Preencha a justificativa (mínimo 20 caracteres) para prosseguir."
          : "Validações da liquidação não atendidas.");
      toast({ title: "Bloqueado", description: msg, variant: "destructive" });
      return;
    }
    setLiquidacaoLoading(true);
    try {
      const result = await contratoLiquidacaoService.gerarPrevia(editingContrato.id, opcaoEncerrar, {
        grupoId,
        empresaId,
        filialId: editingContrato.filialId,
      });
      if (result.sucesso && result.liquidacao) {
        setLiquidacao(result.liquidacao);
        toast({ title: "Sucesso", description: result.mensagem });
      } else {
        toast({ title: "Erro", description: result.mensagem, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro", description: "Falha ao gerar prévia.", variant: "destructive" });
    } finally {
      setLiquidacaoLoading(false);
    }
  };

  const onConfirmarLiquidacao = async () => {
    if (!liquidacao || !editingContrato) return;
    if (!validacoesLiquidacao.podeAvancar) {
      const msg = validacoesLiquidacao.bloqueios[0]
        ?? (validacoesLiquidacao.requerJustificativa && justificativaDivergencia.trim().length < 20
          ? "Preencha a justificativa (mínimo 20 caracteres) para prosseguir."
          : "Validações da liquidação não atendidas.");
      toast({ title: "Bloqueado", description: msg, variant: "destructive" });
      setConfirmDialogOpen(false);
      return;
    }
    setLiquidacaoLoading(true);
    setConfirmDialogOpen(false);
    try {
      const result = await contratoLiquidacaoService.confirmar(liquidacao.id, opcaoTitulos, {
        grupoId,
        empresaId,
        filialId: editingContrato.filialId,
      });
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
    } finally {
      setLiquidacaoLoading(false);
    }
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
    } finally {
      setLiquidacaoLoading(false);
    }
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

  return (
    <>
      <PageHeader title="Contratos" description="Gestão de contratos comerciais de compra e venda" />

      {/* PARTE 1 — Faixa de contexto organizacional */}
      <div className="mb-4 rounded-lg border bg-card p-4 space-y-3">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5 min-w-[200px]">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Empresa
            </Label>
            <Select value={localEmpresaId} onValueChange={handleLocalEmpresaChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODAS_EMPRESAS}>Todas as Empresas</SelectItem>
                {orgEmpresas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 min-w-[200px]">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5" /> Filial
            </Label>
            <Select
              value={localFilialId}
              onValueChange={handleLocalFilialChange}
              disabled={localEmpresaId === TODAS_EMPRESAS}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODAS_FILIAIS}>Todas as Filiais</SelectItem>
                {localFiliais.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.nomeRazao}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 min-w-[200px]">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5" /> Status
            </Label>
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS_STATUS}>Todos</SelectItem>
                {STATUS_CONTRATO_OPCOES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 min-w-[150px]">
            <Label className="text-xs font-medium">Data Inicial</Label>
            <Input
              type="date"
              value={dataInicioFiltro}
              onChange={(e) => setDataInicioFiltro(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5 min-w-[150px]">
            <Label className="text-xs font-medium">Data Final</Label>
            <Input
              type="date"
              value={dataFimFiltro}
              onChange={(e) => setDataFimFiltro(e.target.value)}
              className="h-9"
            />
          </div>
          {(dataInicioFiltro || dataFimFiltro) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9"
              onClick={() => { setDataInicioFiltro(""); setDataFimFiltro(""); }}
            >
              Limpar datas
            </Button>
          )}
          <div className="flex-1" />
          <Button onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Contrato
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground italic">{contextLabel}</p>
          {globalChangedWarning && (
            <div className="flex items-center gap-2 rounded-md border border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20 px-3 py-1.5 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-amber-700 dark:text-amber-400">
                O contexto global da sessão foi alterado. A listagem continua usando o filtro próprio desta página.
              </span>
              <Button variant="outline" size="sm" className="h-6 text-xs ml-2" onClick={handleUsarContextoGlobal}>
                <RefreshCw className="mr-1 h-3 w-3" />
                Usar contexto da sessão
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Listagem */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("empresa")}>
                    Empresa <SortIcon k="empresa" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("filial")}>
                    Filial <SortIcon k="filial" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("tipo")}>
                    Tipo <SortIcon k="tipo" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("status")}>
                    Status <SortIcon k="status" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("numero")}>
                    Número <SortIcon k="numero" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("data")}>
                    Data <SortIcon k="data" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("pessoa")}>
                    Pessoa <SortIcon k="pessoa" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("produto")}>
                    Produto <SortIcon k="produto" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button className="flex items-center gap-1 hover:text-foreground ml-auto" onClick={() => toggleSort("volTotal")}>
                    Qtde Total <SortIcon k="volTotal" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button className="flex items-center gap-1 hover:text-foreground ml-auto" onClick={() => toggleSort("volPendente")}>
                    Qtde Pendente <SortIcon k="volPendente" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button className="flex items-center gap-1 hover:text-foreground ml-auto" onClick={() => toggleSort("preco")}>
                    Preço Unit <SortIcon k="preco" />
                  </button>
                </TableHead>
                <TableHead className="text-center">Duplic.</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contratosOrdenados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                    {contratos.length === 0
                      ? "Nenhum contrato cadastrado."
                      : "Nenhum contrato corresponde aos filtros aplicados."}
                  </TableCell>
                </TableRow>
              ) : (
                contratosOrdenados.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-xs">{getNomeEmpresa(c.empresaId)}</TableCell>
                    <TableCell className="text-xs">{getNomeFilial(c.filialId)}</TableCell>
                    <TableCell>
                      <Badge variant={c.tipoContrato === "COMPRA" ? "default" : "secondary"}>
                        {c.tipoContrato === "COMPRA" ? "Compra" : "Venda"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell className="font-medium">{c.numeroContrato}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{formatDateBR(c.dataContrato)}</TableCell>
                    <TableCell>{getNomePessoa(c.pessoaId)}</TableCell>
                    <TableCell>{getNomeProduto(c.produtoId)}</TableCell>
                    <TableCell className="text-right">
                      {c.quantidadeTotal.toLocaleString("pt-BR")} {getCodigoUnidade(c.unidadeNegociacaoId)}
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round(c.quantidadeSaldo).toLocaleString("pt-BR")} {getCodigoUnidade(c.unidadeNegociacaoId)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(c.precoUnitario, mockMoedas.find((m) => m.id === c.moedaId)?.codigo ?? "BRL")}
                    </TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger>
                            {c.duplicatasGeradas || c.status === "FATURADO" || c.status === "LIQUIDADO" ? (
                              <div className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground font-bold text-xs mx-auto">$</div>
                            ) : (
                              <div className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-muted text-muted-foreground/50 font-bold text-xs mx-auto">$</div>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {c.duplicatasGeradas || c.status === "FATURADO" || c.status === "LIQUIDADO" ? "Duplicatas geradas" : "Sem duplicatas"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
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
        title={
          viewOnly
            ? `Contrato ${editingContrato?.numeroContrato}`
            : editingContrato
              ? "Editar Contrato"
              : "Novo Contrato"
        }
        saving={saving}
        onSave={viewOnly ? undefined : onSaveContrato}
        maxWidth="sm:max-w-5xl"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="dados">Dados do Contrato</TabsTrigger>
              <TabsTrigger value="romaneios" disabled={!editingContrato}>
                Romaneios
              </TabsTrigger>
              {(editingContrato?.tipoPreco === "A_FIXAR" || tipoPrecoWatch === "A_FIXAR") && (
                <TabsTrigger value="fixacao" disabled={!editingContrato}>
                  Fixação de Preço
                </TabsTrigger>
              )}
              <TabsTrigger value="financeiro" disabled={!editingContrato}>
                Financeiro
              </TabsTrigger>
              <TabsTrigger value="condicoes" disabled={!editingContrato}>
                Condições e Descontos
              </TabsTrigger>
              <TabsTrigger value="liquidacao" disabled={!editingContrato}>
                Liquidação
              </TabsTrigger>
            </TabsList>
            {editingContrato && <StatusBadge status={editingContrato.status} />}
          </div>

          {/* ABA 1 — Dados */}
          <TabsContent value="dados">
            <TooltipProvider delayDuration={200}>
              <fieldset disabled={viewOnly} className="space-y-5">
                {/* Row 0: Empresa + Filial (2 cols) */}
                <FormRow columns={2}>
                  <div className="w-full">
                    <Label>
                      Empresa <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={contratoForm.watch("empresaId")}
                      onValueChange={handleContratoEmpresaChange}
                      disabled={viewOnly || !canEditEmpresaFilial}
                    >
                      <SelectTrigger className={!canEditEmpresaFilial ? "bg-muted/50 cursor-not-allowed" : ""}>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {orgEmpresas
                          .filter((e) => e.ativo)
                          .map((e) => (
                            <SelectItem key={e.id} value={e.id}>
                              {e.nome}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {contratoForm.formState.errors.empresaId && (
                      <p className="text-xs text-destructive">{contratoForm.formState.errors.empresaId.message}</p>
                    )}
                  </div>
                  <div className="w-full">
                    <Label>Filial</Label>
                    <Select
                      value={contratoForm.watch("filialId") || ""}
                      onValueChange={(v) => contratoForm.setValue("filialId", v)}
                      disabled={viewOnly || !canEditEmpresaFilial}
                    >
                      <SelectTrigger className={!canEditEmpresaFilial ? "bg-muted/50 cursor-not-allowed" : ""}>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {contratoFiliaisEmpresa
                          .filter((f) => f.ativo)
                          .map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.nomeRazao}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </FormRow>
                {/* Movement lock warning */}
                {editingContrato && hasMovements && (
                  <div className="rounded-md border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>
                      Empresa e filial não podem ser alteradas porque este contrato já possui movimentações vinculadas.
                    </span>
                  </div>
                )}

                {/* Row 1: Tipo + Número + Data (3 cols) */}
                <FormRow columns={3}>
                  <div className="w-full">
                    <Label>
                      Tipo <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={contratoForm.watch("tipoContrato")}
                      onValueChange={(v) => contratoForm.setValue("tipoContrato", v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMPRA">Compra</SelectItem>
                        <SelectItem value="VENDA">Venda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full">
                    <Label>Número do Contrato</Label>
                    <Tooltip>
                      <TooltipTrigger type="button" className="ml-[6px]">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[220px] text-xs">
                          Número sequencial gerado pelo sistema (CTR-AAAAMM-NNNN). Não editável.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    <Input
                      value={editingContrato?.numeroContrato ?? ""}
                      placeholder="Gerado automaticamente"
                      disabled
                      className="bg-muted/50 cursor-not-allowed"
                    />
                  </div>
                  <div className="w-full">
                    <Label>
                      Data do Contrato <span className="text-destructive">*</span>
                    </Label>
                    <Input type="date" {...contratoForm.register("dataContrato")} />
                    {contratoForm.formState.errors.dataContrato && (
                      <p className="text-xs text-destructive">{contratoForm.formState.errors.dataContrato.message}</p>
                    )}
                  </div>
                </FormRow>

                {/* Row 2: Pessoa + Produto (2 cols) */}
                <FormRow columns={2}>
                  <div className="w-full">
                    <Label>
                      Pessoa Responsável <span className="text-destructive">*</span>
                    </Label>
                    <SearchableSelect
                      options={pessoaOptions}
                      value={contratoForm.watch("pessoaId")}
                      onChange={(v) => contratoForm.setValue("pessoaId", v, { shouldValidate: true })}
                      placeholder="Buscar por nome, CPF/CNPJ..."
                      disabled={viewOnly}
                    />
                    {contratoForm.formState.errors.pessoaId && (
                      <p className="text-xs text-destructive">{contratoForm.formState.errors.pessoaId.message}</p>
                    )}
                  </div>
                  <div className="w-full">
                    <Label>
                      Produto <span className="text-destructive">*</span>
                    </Label>
                    <SearchableSelect
                      options={produtoOptions}
                      value={contratoForm.watch("produtoId")}
                      onChange={(v) => contratoForm.setValue("produtoId", v, { shouldValidate: true })}
                      placeholder="Buscar por nome, código..."
                      disabled={viewOnly}
                    />
                    {contratoForm.formState.errors.produtoId && (
                      <p className="text-xs text-destructive">{contratoForm.formState.errors.produtoId.message}</p>
                    )}
                  </div>
                </FormRow>

                {/* Row 3: Quantidade + Unidade + Tipo Preço (3 cols) */}
                <FormRow columns={3}>
                  <div className="w-full">
                    <Label>
                      Quantidade <span className="text-destructive">*</span>
                    </Label>
                    <Input type="number" step="0.000001" {...contratoForm.register("quantidadeTotal")} />
                    {contratoForm.formState.errors.quantidadeTotal && (
                      <p className="text-xs text-destructive">
                        {contratoForm.formState.errors.quantidadeTotal.message}
                      </p>
                    )}
                  </div>
                  <div className="w-full">
                    <Label>
                      Unidade <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={contratoForm.watch("unidadeNegociacaoId")}
                      onValueChange={(v) => contratoForm.setValue("unidadeNegociacaoId", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {unidadesAtivas.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.codigo} — {u.descricao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full">
                    <Label>
                      Tipo de Preço <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={contratoForm.watch("tipoPreco")}
                      onValueChange={(v) => {
                        contratoForm.setValue("tipoPreco", v as any);
                        if (v === "A_FIXAR") {
                          contratoForm.setValue("precoUnitario", 0);
                          setPrecoDisplay("");
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIXO">Fixo</SelectItem>
                        <SelectItem value="A_FIXAR">A Fixar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </FormRow>

                {/* Row 4: Moeda + Preço Unitário (2 cols) */}
                <FormRow columns={2}>
                  <div className="w-full pr-0">
                    <Label>
                      Moeda <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={contratoForm.watch("moedaId")}
                      onValueChange={(v) => contratoForm.setValue("moedaId", v)}
                      disabled={!!editingContrato}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {moedas
                          .filter((m) => m.ativo)
                          .map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.codigo} — {m.descricao}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {editingContrato && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Moeda não pode ser alterada após criação do contrato.
                      </p>
                    )}
                  </div>
                  <div className="w-full">
                    <Label>
                      Preço Unitário {tipoPrecoWatch !== "A_FIXAR" && <span className="text-destructive">*</span>}
                    </Label>
                    {tipoPrecoWatch === "A_FIXAR" && (
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          <p className="text-xs">
                            Tipo A FIXAR: Preço pendente para hedge de volume. Após entregas (romaneios), acesse Fixação
                            de Preço para definir valor real. Bloqueia liquidação; gera provisões estimadas.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {tipoPrecoWatch === "A_FIXAR" ? (
                      <Input
                        value="R$ 0,00"
                        placeholder="Preço provisório (R$ 0,00) — Fixe após entregas"
                        disabled
                        className="bg-muted/50 cursor-not-allowed"
                      />
                    ) : (
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          {...contratoForm.register("precoUnitario")}
                          onFocus={handlePrecoFocus}
                          onBlur={(e) => {
                            contratoForm.register("precoUnitario").onBlur(e);
                            handlePrecoBlur();
                          }}
                          className={precoDisplay ? "opacity-0 absolute inset-0" : ""}
                        />
                        {precoDisplay && (
                          <div
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-text"
                            onClick={() => {
                              handlePrecoFocus();
                              const input = document.querySelector<HTMLInputElement>('input[name="precoUnitario"]');
                              input?.focus();
                            }}
                          >
                            {precoDisplay}
                          </div>
                        )}
                      </div>
                    )}
                    {contratoForm.formState.errors.precoUnitario && tipoPrecoWatch !== "A_FIXAR" && (
                      <p className="text-xs text-destructive">{contratoForm.formState.errors.precoUnitario.message}</p>
                    )}
                    {/* A_FIXAR badge */}
                    {tipoPrecoWatch === "A_FIXAR" && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1.5 text-xs cursor-help">
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                            <span className="text-amber-700 dark:text-amber-400 font-medium">A FIXAR — Pendente</span>
                            {precoSugestao && (
                              <span className="text-muted-foreground ml-1">
                                | Estimado {formatCurrency(precoSugestao.valor, moedaCodigo)}/
                                {getCodigoUnidade(contratoForm.watch("unidadeNegociacaoId"))}
                              </span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[340px]">
                          <div className="space-y-1.5 text-xs">
                            <p className="font-semibold">Contrato A Fixar</p>
                            <p>Liquidação bloqueada até fixar. Saldo a fixar atualizado com romaneios.</p>
                            {precoSugestao && (
                              <>
                                <p className="text-muted-foreground">
                                  Estimativa baseada no coeficiente/tabela do produto:
                                </p>
                                {precoSugestao.breakdown.map((b, i) => (
                                  <div key={i} className="flex justify-between gap-4">
                                    <span>
                                      {b.tipo}
                                      {b.percentual > 0 ? ` (${b.percentual}%)` : ""}
                                    </span>
                                    <span className="font-mono">{formatCurrency(b.valor, moedaCodigo)}</span>
                                  </div>
                                ))}
                                <div className="border-t border-border pt-1 flex justify-between font-semibold">
                                  <span>
                                    Total Provisório ({formatCurrency(precoSugestao.valor, moedaCodigo)} ×{" "}
                                    {contratoForm.watch("quantidadeTotal") || 0})
                                  </span>
                                  <span className="font-mono">
                                    {formatCurrency(
                                      precoSugestao.valor * (contratoForm.watch("quantidadeTotal") || 0),
                                      moedaCodigo,
                                    )}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {/* Price suggestion badge for FIXO */}
                    {precoSugestao && !editingContrato && tipoPrecoWatch !== "A_FIXAR" && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="mt-1 inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-1 text-xs text-muted-foreground cursor-help">
                            <Info className="h-3 w-3" />
                            <span>
                              Sugerido:{" "}
                              <strong className="text-foreground">
                                {formatCurrency(precoSugestao.valor, moedaCodigo)}
                              </strong>{" "}
                              — {precoSugestao.origem}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[320px]">
                          <div className="space-y-1 text-xs">
                            <p className="font-semibold">Composição do Preço</p>
                            {precoSugestao.breakdown.map((b, i) => (
                              <div key={i} className="flex justify-between gap-4">
                                <span>
                                  {b.tipo}
                                  {b.percentual > 0 ? ` (${b.percentual}%)` : ""}
                                </span>
                                <span className="font-mono">{formatCurrency(b.valor, moedaCodigo)}</span>
                              </div>
                            ))}
                            <div className="border-t border-border pt-1 flex justify-between gap-4 font-semibold">
                              <span>Total</span>
                              <span className="font-mono">{formatCurrency(precoSugestao.valor, moedaCodigo)}</span>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {precoSugestaoLoading && (
                      <p className="text-xs text-muted-foreground mt-1">Calculando preço sugerido...</p>
                    )}
                    {!precoSugestao &&
                      !precoSugestaoLoading &&
                      produtoIdWatch &&
                      !editingContrato &&
                      tipoPrecoWatch !== "A_FIXAR" && (
                        <p className="text-xs text-amber-600 mt-1">
                          Configure coeficiente/tabela no produto para sugestão de preço.
                        </p>
                      )}
                  </div>
                </FormRow>

                {/* Row 5: Datas de entrega (2 cols) */}
                <FormRow columns={2}>
                  <div className="w-full">
                    <Label>Data Entrega Início</Label>
                    <Input type="date" {...contratoForm.register("dataEntregaInicio")} />
                  </div>
                  <div className="w-full">
                    <Label>Data Entrega Fim</Label>
                    <Input type="date" {...contratoForm.register("dataEntregaFim")} />
                  </div>
                </FormRow>

                {/* Row 6: Filiais logísticas (3 cols) with tooltips */}
                <div className="rounded-md border p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-foreground">Filiais Logísticas</h4>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p className="max-w-[280px] text-xs">
                          Defina a origem, operação e destino para rastrear o fluxo físico do contrato.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Label>
                          Filial de Operação <span className="text-destructive">*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger type="button">
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-[240px] text-xs">
                              Filial responsável pela execução do contrato (emite NF-e, gerencia logística) — sempre
                              obrigatória.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={contratoForm.watch("filialOperacaoId") || ""}
                        onValueChange={(v) => contratoForm.setValue("filialOperacaoId", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {contratoFiliaisEmpresa
                            .filter((f) => f.ativo)
                            .map((f) => (
                              <SelectItem key={f.id} value={f.id}>
                                {f.nomeRazao}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Label>
                          Filial de Origem
                          {tipoContratoWatch === "VENDA" && <span className="text-destructive ml-0.5">*</span>}
                        </Label>
                        <Tooltip>
                          <TooltipTrigger type="button">
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-[240px] text-xs">
                              Local físico onde o produto está armazenado antes da entrega (armazém de saída) —
                              obrigatória para VENDAS.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={contratoForm.watch("filialOrigemId") || ""}
                        onValueChange={(v) => contratoForm.setValue("filialOrigemId", v)}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={tipoContratoWatch === "COMPRA" ? "Não aplicável" : "Selecione..."}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {contratoFiliaisEmpresa
                            .filter((f) => f.ativo)
                            .map((f) => (
                              <SelectItem key={f.id} value={f.id}>
                                {f.nomeRazao}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Label>
                          Filial de Destino
                          {tipoContratoWatch === "COMPRA" && <span className="text-destructive ml-0.5">*</span>}
                        </Label>
                        <Tooltip>
                          <TooltipTrigger type="button">
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-[240px] text-xs">
                              Local físico onde o produto será entregue (armazém de chegada) — obrigatória para COMPRAS.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={contratoForm.watch("filialDestinoId") || ""}
                        onValueChange={(v) => contratoForm.setValue("filialDestinoId", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={tipoContratoWatch === "VENDA" ? "Não aplicável" : "Selecione..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {contratoFiliaisEmpresa
                            .filter((f) => f.ativo)
                            .map((f) => (
                              <SelectItem key={f.id} value={f.id}>
                                {f.nomeRazao}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Row 7: Observações */}
                <div className="space-y-1.5">
                  <Label>Observações</Label>
                  <Textarea rows={3} {...contratoForm.register("observacoes")} />
                </div>

                {/* Info panel for existing contract */}
                {editingContrato && (
                  <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                    <div>
                      Quantidade Entregue:{" "}
                       <strong>
                         {Math.round(editingContrato.quantidadeEntregue).toLocaleString("pt-BR")}{" "}
                         {getCodigoUnidade(editingContrato.unidadeNegociacaoId)}
                       </strong>
                    </div>
                    <div>
                      Saldo:{" "}
                       <strong>
                         {Math.round(editingContrato.quantidadeSaldo).toLocaleString("pt-BR")}{" "}
                         {getCodigoUnidade(editingContrato.unidadeNegociacaoId)}
                       </strong>
                    </div>
                    {editingContrato.filialOperacaoId && (
                      <div>
                        Filial Operação: <strong>{getNomeFilial(editingContrato.filialOperacaoId)}</strong>
                      </div>
                    )}
                    {editingContrato.filialOrigemId && (
                      <div>
                        Filial Origem: <strong>{getNomeFilial(editingContrato.filialOrigemId)}</strong>
                      </div>
                    )}
                    {editingContrato.filialDestinoId && (
                      <div>
                        Filial Destino: <strong>{getNomeFilial(editingContrato.filialDestinoId)}</strong>
                      </div>
                    )}
                  </div>
                )}
              </fieldset>
            </TooltipProvider>
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
                         <p className="text-lg font-bold">
                           {Math.round(editingContrato.quantidadeEntregue).toLocaleString("pt-BR")}{" "}
                           {getCodigoUnidade(editingContrato.unidadeNegociacaoId)}
                         </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Fixado</p>
                        <p className="text-lg font-bold">
                          {totalFixado.toLocaleString("pt-BR")} {getCodigoUnidade(editingContrato.unidadeNegociacaoId)}
                        </p>
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
                          {getSimboloMoeda(editingContrato.moedaId)} {precoMedioFixado.toFixed(2)}/
                          {getCodigoUnidade(editingContrato.unidadeNegociacaoId)}
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
                <p className="text-xs text-muted-foreground">
                  Somente leitura — romaneios são criados no módulo Romaneios
                </p>
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
                          <TableCell className="text-right font-medium">
                            {r.pesoLiquido > 0 ? r.pesoLiquido.toFixed(3) : "—"}
                          </TableCell>
                          <TableCell>{r.motoristaNome || "—"}</TableCell>
                          <TableCell>{r.placaVeiculo || "—"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                r.status === "FINALIZADO" ? "outline" : r.status === "ABERTO" ? "default" : "secondary"
                              }
                            >
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
              {/* Painel resumo com progress bar */}
              {editingContrato &&
                (() => {
                  const entregue = editingContrato.quantidadeEntregue;
                  const fixadoPerc = entregue > 0 ? Math.min(100, (totalFixado / entregue) * 100) : 0;
                  const unCod = getCodigoUnidade(editingContrato.unidadeNegociacaoId);
                  const simbolo = getSimboloMoeda(editingContrato.moedaId);
                  const moedaCod = getCodigoMoeda(editingContrato.moedaId);
                  return (
                    <Card className="border-2 border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10">
                      <CardContent className="pt-4 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Entregue</p>
                            <p className="text-lg font-bold">
                              {entregue.toLocaleString("pt-BR")} {unCod}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Fixado</p>
                            <p className="text-lg font-bold">
                              {totalFixado.toLocaleString("pt-BR")} {unCod}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Saldo a Fixar</p>
                            <p className={`text-lg font-bold ${saldoAFixar > 0 ? "text-amber-600" : "text-primary"}`}>
                              {saldoAFixar.toLocaleString("pt-BR")} {unCod}
                              {saldoAFixar > 0 && <span className="ml-1">⚠️</span>}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Preço Médio</p>
                            <p className="text-lg font-bold">
                              {simbolo} {precoMedioFixado.toFixed(2)}/{unCod}
                            </p>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              Fixado {fixadoPerc.toFixed(0)}% ({totalFixado.toLocaleString("pt-BR")}/
                              {entregue.toLocaleString("pt-BR")} {unCod})
                            </span>
                            <span>
                              Pendente {(100 - fixadoPerc).toFixed(0)}% ({saldoAFixar.toLocaleString("pt-BR")} {unCod})
                            </span>
                          </div>
                          <Progress
                            value={fixadoPerc}
                            className={`h-3 ${fixadoPerc >= 100 ? "[&>div]:bg-primary" : fixadoPerc > 0 ? "[&>div]:bg-amber-500" : "[&>div]:bg-muted"}`}
                          />
                        </div>
                        {/* Provisões inline summary */}
                        {precoMedioFixado > 0 && (
                          <div className="text-xs text-muted-foreground border-t border-border pt-2">
                            Provisões: <strong>{formatCurrency(precoMedioFixado * totalFixado, moedaCod)}</strong>{" "}
                            (fixado)
                            {saldoAFixar > 0 && (
                              <>
                                {" "}
                                | Saldo estimado:{" "}
                                <strong>{formatCurrency(precoMedioFixado * saldoAFixar, moedaCod)}</strong> (pendente ×
                                preço médio)
                              </>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })()}

              {!viewOnly && saldoAFixar > 0 && (
                <div className="flex justify-end">
                  <Button size="sm" onClick={openNewFixacao}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Fixação
                  </Button>
                </div>
              )}
              {!viewOnly && saldoAFixar <= 0 && editingContrato && editingContrato.quantidadeEntregue > 0 && (
                <div className="flex justify-end">
                  <p className="text-xs text-primary font-medium flex items-center gap-1">
                    <FileCheck className="h-3.5 w-3.5" /> Todo volume fixado — pronto para liquidação
                  </p>
                </div>
              )}
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Volume Fixado</TableHead>
                      <TableHead className="text-right">Preço Unitário</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead>Observações</TableHead>
                      {!viewOnly && <TableHead className="text-right">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fixacoes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={viewOnly ? 5 : 6} className="text-center py-8 text-muted-foreground">
                          Nenhuma fixação registrada.
                          {saldoAFixar > 0 && (
                            <>
                              <br />
                              <span className="text-xs">Clique em "Nova Fixação" para definir preço.</span>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      fixacoes.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell>{format(new Date(f.dataFixacao), "dd/MM/yyyy HH:mm")}</TableCell>
                          <TableCell className="text-right">
                            {f.quantidadeFixada.toLocaleString("pt-BR")} {getCodigoUnidade(f.unidadeFixacaoId)}
                          </TableCell>
                          <TableCell className="text-right">
                            {getSimboloMoeda(f.moedaId)} {f.precoFixado.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(f.quantidadeFixada * f.precoFixado, getCodigoMoeda(f.moedaId))}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs max-w-[150px] truncate">
                            {f.observacoes || "—"}
                          </TableCell>
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
              {/* Cenário 1: ABERTO ou PARCIAL */}
              {editingContrato && (editingContrato.status === "ABERTO" || editingContrato.status === "PARCIAL") && (
                <>
                  {(() => {
                    const isAFixar = editingContrato.tipoPreco === "A_FIXAR";
                    const labelDuplicatas = isAFixar ? "Duplicatas (Fixação)" : "Duplicatas Provisórias";
                    return (
                      <div className="rounded-md bg-muted p-6 text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                          ℹ️ {labelDuplicatas}: <strong>{editingContrato.duplicatasGeradas ? "✅ Geradas" : "❌ Não geradas"}</strong>
                        </p>
                        {!editingContrato.duplicatasGeradas && (
                          <p className="text-sm text-muted-foreground">
                            Status Atual: <StatusBadge status={editingContrato.status} /> — {isAFixar ? "Aguardando fixação de preço para gerar duplicatas" : "Aguardando geração de duplicatas provisórias"}
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Listar parcelas (PREVISTO para FIXO; PENDENTE/PREVISTO para A_FIXAR via fixação) */}
                  {editingContrato.duplicatasGeradas && finParcelas.filter(p => p.status === "PREVISTO" || (editingContrato.tipoPreco === "A_FIXAR" && p.status === "PENDENTE")).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground text-sm">
                        {editingContrato.tipoPreco === "A_FIXAR" ? "Parcelas (Geradas via Fixação)" : "Parcelas Previstas (Provisórias)"}
                      </h4>
                      <div className="overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-8"></TableHead>
                              <TableHead>#</TableHead>
                              <TableHead>Vencimento</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                              <TableHead className="text-right">Saldo</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {finParcelas.filter(p => p.status === "PREVISTO" || (editingContrato.tipoPreco === "A_FIXAR" && p.status === "PENDENTE")).map((p) => {
                              const parcelaMovs = finMovs.filter((m) => m.parcelaId === p.id);
                              const isExpanded = expandedParcelaId === p.id;
                              return (
                                <>
                                  <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setExpandedParcelaId(isExpanded ? null : p.id)}>
                                    <TableCell className="p-2">
                                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </TableCell>
                                    <TableCell>{p.numeroParcela}/{p.totalParcelas}</TableCell>
                                    <TableCell>{formatDateBR(p.dataVencimento)}</TableCell>
                                    <TableCell className="text-right">
                                      {p.valorParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {p.saldoParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell>
                                      <StatusBadge status={p.status} />
                                    </TableCell>
                                  </TableRow>
                                  {isExpanded && (
                                    <TableRow key={`${p.id}-detail`}>
                                      <TableCell colSpan={6} className="bg-muted/30 p-4">
                                        <div className="space-y-2">
                                          <h5 className="text-xs font-semibold text-muted-foreground">Movimentações da Parcela {p.numeroParcela}</h5>
                                          {parcelaMovs.length > 0 ? (
                                            <Table>
                                              <TableHeader>
                                                <TableRow>
                                                  <TableHead className="text-xs">Data</TableHead>
                                                  <TableHead className="text-xs">Tipo</TableHead>
                                                  <TableHead className="text-xs text-right">Valor</TableHead>
                                                  <TableHead className="text-xs">Forma</TableHead>
                                                  <TableHead className="text-xs">Histórico</TableHead>
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                {parcelaMovs.map((m) => {
                                                  const formaLabel = mockFormasPagto.find((f) => f.id === m.formaPagamentoId)?.descricao ?? "—";
                                                  return (
                                                    <TableRow key={m.id}>
                                                      <TableCell className="text-xs">{format(new Date(m.dataMovimento), "dd/MM/yyyy")}</TableCell>
                                                      <TableCell className="text-xs">
                                                        <Badge variant="outline" className="text-xs">{m.tipoMovimento === "ENTRADA" ? "ADT" : m.tipoMovimento}</Badge>
                                                      </TableCell>
                                                      <TableCell className="text-xs text-right">
                                                        {m.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                      </TableCell>
                                                      <TableCell className="text-xs">{formaLabel}</TableCell>
                                                      <TableCell className="text-xs text-muted-foreground">{m.historico || "—"}</TableCell>
                                                    </TableRow>
                                                  );
                                                })}
                                              </TableBody>
                                            </Table>
                                          ) : (
                                            <p className="text-xs text-muted-foreground">Nenhuma movimentação registrada (adiantamentos podem ser recebidos)</p>
                                          )}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Painel Saldo a Fixar para A_FIXAR */}
                  {editingContrato.tipoPreco === "A_FIXAR" && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">🎯 Saldo a Fixar</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Total Contratado</p>
                            <p className="text-lg font-bold">
                              {editingContrato.quantidadeTotal.toLocaleString("pt-BR")} {getCodigoUnidade(editingContrato.unidadeNegociacaoId)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Total Entregue</p>
                            <p className="text-lg font-bold">
                              {Math.round(editingContrato.quantidadeEntregue).toLocaleString("pt-BR")} {getCodigoUnidade(editingContrato.unidadeNegociacaoId)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Total Fixado</p>
                            <p className="text-lg font-bold">
                              {totalFixado.toLocaleString("pt-BR")} {getCodigoUnidade(editingContrato.unidadeNegociacaoId)}
                              {precoMedioFixado > 0 && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (PM: {formatCurrency(precoMedioFixado, getCodigoMoeda(editingContrato.moedaId))})
                                </span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Saldo a Fixar</p>
                            <p className="text-lg font-bold text-destructive">
                              {saldoAFixar.toLocaleString("pt-BR")} {getCodigoUnidade(editingContrato.unidadeNegociacaoId)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 mt-4">
                          {saldoAFixar > 0 && !viewOnly && (
                            <Button variant="outline" size="sm" className="w-fit" onClick={() => { setActiveTab("fixacoes"); openNewFixacao(); }}>
                              Fixar Preço
                            </Button>
                          )}
                          <p className="text-xs text-muted-foreground italic">
                            ℹ️ Para contratos A Fixar, as duplicatas são geradas automaticamente ao registrar cada fixação de preço (uma duplicata por fixação, status ABERTO).
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Botão para FIXO - Gerar Duplicatas de Previsão */}
                  {editingContrato.tipoPreco === "FIXO" && !editingContrato.duplicatasGeradas && !viewOnly && (
                    <div className="text-center">
                      <Button onClick={() => {
                        setGcNumParcelas("1");
                        setGcFrequencia("MENSAL");
                        setGcDiasPersonalizado("30");
                        setGcDataPrimeiraParcela(new Date().toISOString().slice(0, 10));
                        setGcParcelasEditaveis([]);
                        setGcParcelasGeradas(false);
                        setGerarContasOpen(true);
                      }}>
                        Gerar Duplicatas de Previsão
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Cenário 2: FINALIZADO */}
              {editingContrato && editingContrato.status === "FINALIZADO" && (
                <div className="space-y-4">
                  {/* Se tem duplicatas PREVISTO → oferecer efetivação */}
                  {editingContrato.duplicatasGeradas && finParcelas.some(p => p.status === "PREVISTO") ? (
                    <>
                      <div className="rounded-md border border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10 p-6 space-y-4">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-5 w-5 text-amber-600" />
                          <h3 className="font-semibold text-foreground">Efetivar Duplicatas</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          O contrato está finalizado. As duplicatas provisórias podem agora ser efetivadas para se tornarem contas reais.
                        </p>
                        {(() => {
                          const valorPrevisto = finParcelas.filter(p => p.status === "PREVISTO").reduce((s, p) => s + p.valorParcela, 0);
                          const valorReal = editingContrato.quantidadeEntregue * editingContrato.precoUnitario;
                          const diferenca = Math.abs(valorPrevisto - valorReal);
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="rounded-md bg-card p-3 border">
                                <p className="text-muted-foreground text-xs">Valor Previsto</p>
                                <p className="text-lg font-bold">{valorPrevisto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                              </div>
                              <div className="rounded-md bg-card p-3 border">
                                <p className="text-muted-foreground text-xs">Valor Real (Qtd. Entregue × Preço)</p>
                                <p className="text-lg font-bold">{valorReal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                              </div>
                              <div className="rounded-md bg-card p-3 border">
                                <p className="text-muted-foreground text-xs">Diferença</p>
                                <p className={`text-lg font-bold ${diferenca > 0.01 ? "text-amber-600" : "text-primary"}`}>
                                  {diferenca > 0.01 ? diferenca.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Sem diferença"}
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button onClick={async () => {
                            // Efetivar com valor previsto (manter parcelas como estão)
                            try {
                              await financeiroContaService.efetivarDuplicatas(editingContrato.id, "previsto");
                              editingContrato.status = "FATURADO";
                              const contasReload = await financeiroContaService.listarPorContrato(editingContrato.id);
                              setFinContas(contasReload);
                              const parcelasReload = await financeiroParcelaService.listarPorContas(contasReload.map(c => c.id));
                              setFinParcelas(parcelasReload);
                              toast({ title: "Duplicatas efetivadas com valor previsto!" });
                              loadContratos();
                            } catch (err: any) {
                              toast({ title: err.message || "Erro ao efetivar", variant: "destructive" });
                            }
                          }}>
                            Efetivar com Valor Previsto
                          </Button>
                          <Button variant="outline" onClick={async () => {
                            // Efetivar com valor real (ajusta proporcionalmente)
                            try {
                              await financeiroContaService.efetivarDuplicatas(editingContrato.id, "real");
                              editingContrato.status = "FATURADO";
                              const contasReload = await financeiroContaService.listarPorContrato(editingContrato.id);
                              setFinContas(contasReload);
                              const parcelasReload = await financeiroParcelaService.listarPorContas(contasReload.map(c => c.id));
                              setFinParcelas(parcelasReload);
                              toast({ title: "Duplicatas efetivadas com valor real!" });
                              loadContratos();
                            } catch (err: any) {
                              toast({ title: err.message || "Erro ao efetivar", variant: "destructive" });
                            }
                          }}>
                            Efetivar com Valor Real
                          </Button>
                          <Button variant="secondary" onClick={() => {
                            // Reconfigurar — abre modal de geração
                            setGcNumParcelas("1");
                            setGcFrequencia("MENSAL");
                            setGcDiasPersonalizado("30");
                            setGcDataPrimeiraParcela(new Date().toISOString().slice(0, 10));
                            setGcParcelasEditaveis([]);
                            setGcParcelasGeradas(false);
                            setGerarContasOpen(true);
                          }}>
                            Reconfigurar Parcelas
                          </Button>
                        </div>
                      </div>

                      {/* Listar parcelas previstas */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground text-sm">Parcelas Previstas (Aguardando Efetivação)</h4>
                        <div className="overflow-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Vencimento</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                <TableHead className="text-right">Saldo</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {finParcelas.filter(p => p.status === "PREVISTO").map((p) => (
                                <TableRow key={p.id}>
                                  <TableCell>{p.numeroParcela}/{p.totalParcelas}</TableCell>
                                  <TableCell>{formatDateBR(p.dataVencimento)}</TableCell>
                                  <TableCell className="text-right">{p.valorParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                                  <TableCell className="text-right">{p.saldoParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                                  <TableCell><StatusBadge status={p.status} /></TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Se NÃO tem duplicatas previstas → gerar contas definitivas */
                    <div className="rounded-md border p-6 text-center space-y-4">
                      <p className="text-sm text-muted-foreground">
                        O contrato está finalizado. Gere as contas a pagar/receber para iniciar o controle financeiro.
                      </p>
                      <Button onClick={() => {
                        setGcNumParcelas("1");
                        setGcFrequencia("MENSAL");
                        setGcDiasPersonalizado("30");
                        setGcDataPrimeiraParcela(new Date().toISOString().slice(0, 10));
                        setGcParcelasEditaveis([]);
                        setGcParcelasGeradas(false);
                        setGerarContasOpen(true);
                      }}>
                        Gerar Contas a {editingContrato.tipoContrato === "COMPRA" ? "Pagar" : "Receber"}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Cenário 3: FATURADO, LIQUIDADO ou CANCELADO — exibe parcelas */}
              {editingContrato && (editingContrato.status === "FATURADO" || editingContrato.status === "LIQUIDADO" || editingContrato.status === "CANCELADO") && (
                <>
                  {/* Resumo */}
                  <div className="rounded-md bg-muted p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">Resumo Financeiro</h3>
                      {editingContrato.status === "FATURADO" && (
                        <Badge variant="outline" className="text-muted-foreground">Contas já geradas</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="rounded-md bg-card p-3 border">
                        <p className="text-muted-foreground">Total Contas</p>
                        <p className="text-lg font-bold text-foreground">{finContas.length}</p>
                      </div>
                      <div className="rounded-md bg-card p-3 border">
                        <p className="text-muted-foreground">Valor Total</p>
                        <p className="text-lg font-bold text-foreground">
                          {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")}{" "}
                          {finContas
                            .reduce((s, c) => s + c.valorTotal, 0)
                            .toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="rounded-md bg-card p-3 border">
                        <p className="text-muted-foreground">Total Pago</p>
                        <p className="text-lg font-bold text-primary">
                          {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")}{" "}
                          {totalBaixas.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="rounded-md bg-card p-3 border">
                        <p className="text-muted-foreground">Saldo Pendente</p>
                        <p className="text-lg font-bold text-destructive">
                          {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")}{" "}
                          {totalParcelasPendentes.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Parcelas com expansão */}
                  {finParcelas.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground text-sm">Parcelas Vinculadas</h4>
                      {editingContrato.tipoPreco === "A_FIXAR" && finParcelas.some((p) => (p as any).origem === "FIXACAO") && (
                        <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-foreground">
                          ℹ️ Duplicatas geradas via <strong>Fixação de Preço</strong>. As parcelas refletem o preço definitivo de cada fixação e não podem ser editadas.
                        </div>
                      )}
                      <div className="overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-8"></TableHead>
                              <TableHead>#</TableHead>
                              <TableHead>Vencimento</TableHead>
                              <TableHead className="text-right">Valor Original</TableHead>
                              <TableHead className="text-right">Valor Real</TableHead>
                              <TableHead className="text-right">Pago</TableHead>
                              <TableHead className="text-right">Saldo</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {finParcelas.map((p) => {
                              const parcelaMovs = finMovs.filter((m) => m.parcelaId === p.id);
                              const isExpanded = expandedParcelaId === p.id;
                              return (
                                <>
                                  <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setExpandedParcelaId(isExpanded ? null : p.id)}>
                                    <TableCell className="p-2">
                                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </TableCell>
                                    <TableCell>{p.numeroParcela}/{p.totalParcelas}</TableCell>
                                    <TableCell>{formatDateBR(p.dataVencimento)}</TableCell>
                                    <TableCell className="text-right">
                                      {p.valorParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {p.valorReal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {p.valorPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {p.saldoParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell>
                                      <StatusBadge status={p.status} />
                                    </TableCell>
                                  </TableRow>
                                  {isExpanded && (
                                    <TableRow key={`${p.id}-detail`}>
                                      <TableCell colSpan={8} className="bg-muted/30 p-4">
                                        <div className="space-y-2">
                                          <h5 className="text-xs font-semibold text-muted-foreground">Movimentações da Parcela {p.numeroParcela}</h5>
                                          {parcelaMovs.length > 0 ? (
                                            <Table>
                                              <TableHeader>
                                                <TableRow>
                                                  <TableHead className="text-xs">Data</TableHead>
                                                  <TableHead className="text-xs">Tipo</TableHead>
                                                  <TableHead className="text-xs text-right">Valor</TableHead>
                                                  <TableHead className="text-xs">Forma</TableHead>
                                                  <TableHead className="text-xs">Histórico</TableHead>
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                {parcelaMovs.map((m) => {
                                                  const formaLabel = mockFormasPagto.find((f) => f.id === m.formaPagamentoId)?.descricao ?? "—";
                                                  return (
                                                    <TableRow key={m.id}>
                                                      <TableCell className="text-xs">{format(new Date(m.dataMovimento), "dd/MM/yyyy")}</TableCell>
                                                      <TableCell className="text-xs">
                                                        <Badge variant="outline" className="text-xs">{m.tipoMovimento === "ENTRADA" ? "PAGT" : m.tipoMovimento}</Badge>
                                                      </TableCell>
                                                      <TableCell className="text-xs text-right">
                                                        {m.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                      </TableCell>
                                                      <TableCell className="text-xs">{formaLabel}</TableCell>
                                                      <TableCell className="text-xs text-muted-foreground">{m.historico || "—"}</TableCell>
                                                    </TableRow>
                                                  );
                                                })}
                                              </TableBody>
                                            </Table>
                                          ) : (
                                            <p className="text-xs text-muted-foreground">Nenhuma movimentação registrada</p>
                                          )}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Link to Financeiro */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.location.href = "/financeiro/contas"}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Ir para Contas a Pagar/Receber
                    </Button>
                  </div>

                  {finContas.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-6">
                      Nenhuma conta financeira vinculada a este contrato.
                    </p>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* ABA 5 — Condições e Descontos (Cadastro Oficial) */}
          <TabsContent value="condicoes">
            <TooltipProvider delayDuration={200}>
              <div className="space-y-6">
                {/* Official Descontos from the registry */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">Descontos Oficiais</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Descontos cadastrados no módulo Condições e Descontos para a empresa{" "}
                        {mockEmpresas.find((e) => e.id === (empresaIdWatch || empresaId))?.nome ?? "selecionada"}
                      </p>
                    </div>
                    <div className="flex gap-2"></div>
                  </div>

                  {/* Official descontos from empresa registry */}
                  {officialDescontosContrato.length > 0 && (
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Valor Padrão</TableHead>
                            <TableHead>Obrigatório</TableHead>
                            <TableHead>Status</TableHead>
                            {!viewOnly && <TableHead className="text-right">Ação</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {officialDescontosContrato.map((cfg) => {
                            const dt = cfg.descontoTipo;
                            const isApplied = condicoes.some((c) =>
                              c.descricao.toUpperCase().includes(dt.nome.toUpperCase()),
                            );
                            return (
                              <TableRow key={cfg.id} className={isApplied ? "bg-primary/5" : ""}>
                                <TableCell className="font-medium">{dt.nome}</TableCell>
                                <TableCell className="text-muted-foreground text-xs max-w-[200px]">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="line-clamp-2 cursor-help">{dt.descricao}</span>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="max-w-[400px]">
                                      <p className="text-xs whitespace-pre-wrap">{dt.descricao}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{dt.tipo === "percentual" ? "%" : "R$/ton"}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  {dt.tipo === "percentual"
                                    ? `${cfg.valorPadrao.toFixed(2)}%`
                                    : `R$ ${cfg.valorPadrao.toFixed(2)}`}
                                </TableCell>
                                <TableCell>
                                  {dt.obrigatorio ? (
                                    <Badge variant="default" className="gap-1">
                                      <Lock className="h-3 w-3" /> Sim
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">Não</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isApplied ? (
                                    <Badge variant="default">Aplicado</Badge>
                                  ) : (
                                    <Badge variant="outline">Disponível</Badge>
                                  )}
                                </TableCell>
                                {!viewOnly && (
                                  <TableCell className="text-right">
                                    {!isApplied ? (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={async () => {
                                          if (!editingContrato) return;
                                          await contratoCondicaoService.salvar(
                                            {
                                              contratoId: editingContrato.id,
                                              descricao: dt.nome,
                                              tipo: dt.tipo === "percentual" ? "PERCENTUAL" : "VALOR_FIXO",
                                              valor: cfg.valorPadrao,
                                              ordemCalculo: dt.ordemAplicacao,
                                              automatico: dt.obrigatorio,
                                            },
                                            {
                                              grupoId,
                                              empresaId: empresaIdWatch || empresaId,
                                              filialId: editingContrato.filialId,
                                            },
                                          );
                                          const conds = await contratoCondicaoService.listarPorContrato(
                                            editingContrato.id,
                                          );
                                          setCondicoes(conds);
                                          toast({ title: "Sucesso", description: `${dt.nome} aplicado ao contrato.` });
                                        }}
                                      >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Aplicar
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive"
                                        onClick={async () => {
                                          if (!editingContrato) return;
                                          const cond = condicoes.find((c) =>
                                            c.descricao.toUpperCase().includes(dt.nome.toUpperCase()),
                                          );
                                          if (cond) {
                                            await contratoCondicaoService.excluir(cond.id);
                                            const conds = await contratoCondicaoService.listarPorContrato(
                                              editingContrato.id,
                                            );
                                            setCondicoes(conds);
                                            toast({
                                              title: "Sucesso",
                                              description: `${dt.nome} removido do contrato.`,
                                            });
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Remover
                                      </Button>
                                    )}
                                  </TableCell>
                                )}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {officialDescontosContrato.length === 0 && (
                    <div className="text-center py-4 text-sm text-muted-foreground border rounded-md">
                      Nenhum desconto aplicável a contratos cadastrado para esta empresa. Configure no módulo Condições
                      e Descontos.
                    </div>
                  )}

                  {/* Applied conditions (includes both official and manual) */}
                  {condicoes.length > 0 && (
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-semibold text-sm text-foreground">Condições Aplicadas ao Contrato</h4>
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
                            {condicoes.map((c) => (
                              <TableRow key={c.id}>
                                <TableCell>{c.ordemCalculo}</TableCell>
                                <TableCell className="font-medium">{c.descricao}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{c.tipo === "PERCENTUAL" ? "%" : "R$"}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  {c.tipo === "PERCENTUAL" ? `${c.valor.toFixed(2)}%` : `R$ ${c.valor.toFixed(2)}`}
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
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TooltipProvider>
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
                          Defina fixações para todo o volume entregue antes de liquidar. Saldo a fixar:{" "}
                          <strong>
                            {saldoAFixar.toLocaleString("pt-BR")}{" "}
                            {getCodigoUnidade(editingContrato.unidadeNegociacaoId)}
                          </strong>
                        </p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => setActiveTab("fixacao")}>
                          Gerenciar Fixações →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Painel de Validações de Liquidação (não exibido se contrato já liquidado) */}
              {editingContrato && editingContrato.status !== "LIQUIDADO" && editingContrato.status !== "CANCELADO" && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      Status de Validações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {validacoesLiquidacao.itens.map((it) => {
                      const Icon =
                        it.status === "ok" ? CheckCircle2
                        : it.status === "alerta" ? AlertCircle
                        : it.status === "bloqueio" ? XCircle
                        : MinusCircle;
                      const colorCls =
                        it.status === "ok" ? "text-primary"
                        : it.status === "alerta" ? "text-amber-500"
                        : it.status === "bloqueio" ? "text-destructive"
                        : "text-muted-foreground";
                      return (
                        <div key={it.id} className="flex items-start gap-3 text-sm">
                          <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${colorCls}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="font-medium text-foreground">{it.label}</span>
                              <span className={`text-xs ${colorCls}`}>
                                {it.status === "ok" ? "OK" : it.status === "alerta" ? "ATENÇÃO" : it.status === "bloqueio" ? "BLOQUEADO" : "N/A"}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{it.detalhe}</p>
                            {it.mensagem && (
                              <p className={`text-xs mt-1 ${it.status === "alerta" ? "text-amber-600" : "text-destructive"}`}>
                                {it.mensagem}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Justificativa obrigatória quando há divergência fora da tolerância */}
                    {validacoesLiquidacao.requerJustificativa && (
                      <div className="space-y-2 pt-3 border-t">
                        <Label htmlFor="justificativa-divergencia" className="text-sm">
                          Justificativa para Divergência (Obrigatória — mín. 20 caracteres)
                        </Label>
                        <Textarea
                          id="justificativa-divergencia"
                          value={justificativaDivergencia}
                          onChange={(e) => setJustificativaDivergencia(e.target.value)}
                          minLength={20}
                          rows={3}
                          placeholder="Ex: Quebra em transporte. Carregamento saiu de Londrina e chegou em Maringá com X SC a menos. Motorista atestou."
                          disabled={viewOnly}
                        />
                        <p className="text-xs text-muted-foreground">
                          {justificativaDivergencia.trim().length} / 20 caracteres mínimos
                        </p>
                      </div>
                    )}

                    {/* Atalhos de resolução */}
                    {validacoesLiquidacao.bloqueios.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-3 border-t">
                        {validacoesLiquidacao.itens.find((i) => i.id === "preco_fixado" && i.status === "bloqueio") && (
                          <Button variant="outline" size="sm" onClick={() => setActiveTab("fixacao")}>
                            Ir para Fixações →
                          </Button>
                        )}
                        {(validacoesLiquidacao.itens.find((i) => i.id === "romaneios_finalizados" && i.status === "bloqueio")
                          || validacoesLiquidacao.itens.find((i) => i.id === "status_romaneios" && i.status === "bloqueio")) && (
                          <Button variant="outline" size="sm" onClick={() => setActiveTab("romaneios")}>
                            Ir para Romaneios →
                          </Button>
                        )}
                      </div>
                    )}
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
                      <p className="text-lg font-bold">
                        {liquidacao.quantidadeContratada.toLocaleString("pt-BR")}{" "}
                        {getCodigoUnidade(editingContrato.unidadeNegociacaoId)}
                      </p>
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
                        {getSimboloMoeda(editingContrato.moedaId)}{" "}
                        {liquidacao.valorBruto.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div className="rounded-md bg-card p-4 border space-y-1">
                      <p className="text-sm text-muted-foreground">Descontos</p>
                      <p className="text-lg font-bold text-destructive">
                        - {getSimboloMoeda(editingContrato.moedaId)}{" "}
                        {liquidacao.valorDescontos.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div className="rounded-md bg-card p-4 border space-y-1">
                      <p className="text-sm text-muted-foreground">Valor Líquido</p>
                      <p className="text-lg font-bold text-primary">
                        {getSimboloMoeda(editingContrato.moedaId)}{" "}
                        {liquidacao.valorLiquido.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Romaneios usados na liquidação */}
                  {romaneiosContrato.filter((r) => r.status === "FINALIZADO").length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground text-sm">
                        Volume Físico Entregue (Romaneios Finalizados)
                      </h4>
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
                            {romaneiosContrato
                              .filter((r) => r.status === "FINALIZADO")
                              .map((r) => (
                                <TableRow key={r.id}>
                                  <TableCell className="font-mono text-xs">{r.id.substring(0, 8)}</TableCell>
                                  <TableCell>{format(new Date(r.criadoEm), "dd/MM/yyyy")}</TableCell>
                                  <TableCell className="text-right font-medium">{r.pesoLiquido.toFixed(3)}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">FINALIZADO</Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            <TableRow className="font-bold bg-muted/50">
                              <TableCell colSpan={2}>TOTAL ENTREGUE</TableCell>
                              <TableCell className="text-right">
                                {romaneiosContrato
                                  .filter((r) => r.status === "FINALIZADO")
                                  .reduce((s, r) => s + r.pesoLiquido, 0)
                                  .toFixed(3)}
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
                          <p className="text-lg font-bold">
                            {liquidacao.quantidadeContratada.toLocaleString("pt-BR")}{" "}
                            {editingContrato ? getCodigoUnidade(editingContrato.unidadeNegociacaoId) : ""}
                          </p>
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
                            {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")}{" "}
                            {liquidacao.precoUnitario.toFixed(2)}
                            {editingContrato?.tipoPreco === "A_FIXAR" && (
                              <span className="text-xs text-muted-foreground ml-1">(média ponderada)</span>
                            )}
                          </p>
                        </div>
                        <div className="rounded-md bg-card p-4 border space-y-1">
                          <p className="text-sm text-muted-foreground">Valor Bruto</p>
                          <p className="text-lg font-bold">
                            {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")}{" "}
                            {liquidacao.valorBruto.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div className="rounded-md bg-card p-4 border space-y-1">
                          <p className="text-sm text-muted-foreground">Descontos</p>
                          <p className="text-lg font-bold text-destructive">
                            - {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")}{" "}
                            {liquidacao.valorDescontos.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div className="rounded-md bg-card p-4 border space-y-1">
                          <p className="text-sm text-muted-foreground">Valor Líquido</p>
                          <p className="text-lg font-bold text-primary">
                            {getSimboloMoeda(editingContrato?.moedaId ?? "moeda1")}{" "}
                            {liquidacao.valorLiquido.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
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
                                    <TableCell className="text-right">
                                      {f.quantidadeFixada.toLocaleString("pt-BR")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {getSimboloMoeda(f.moedaId)} {f.precoFixado.toFixed(2)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                                <TableRow className="font-bold bg-muted/50">
                                  <TableCell>PREÇO MÉDIO PONDERADO</TableCell>
                                  <TableCell className="text-right">{totalFixado.toLocaleString("pt-BR")}</TableCell>
                                  <TableCell className="text-right">
                                    {getSimboloMoeda(editingContrato.moedaId)} {precoMedioFixado.toFixed(2)}
                                  </TableCell>
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
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ATUALIZAR">Atualizar parcelas pendentes</SelectItem>
                              <SelectItem value="COMPLEMENTAR">Criar título complementar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button onClick={() => setConfirmDialogOpen(true)} disabled={liquidacaoLoading}>
                          <FileCheck className="mr-2 h-4 w-4" />
                          Confirmar e Efetivar
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
                      <Button onClick={onGerarPrevia} disabled={liquidacaoLoading || !canLiquidate}>
                        <FileCheck className="mr-2 h-4 w-4" />
                        Gerar Simulação de Liquidação
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

      {/* Fixação Modal — com preview dinâmico e validação de saldo */}
      <CrudModal
        open={fixacaoModalOpen}
        onClose={() => setFixacaoModalOpen(false)}
        title={editingFixacao ? "Editar Fixação" : "Nova Fixação"}
        saving={savingFixacao}
        onSave={onSaveFixacao}
        maxWidth="sm:max-w-2xl"
      >
        <div className="space-y-4">
          {/* Painel Saldo a Fixar — Múltiplas Fixações */}
          {editingContrato && (() => {
            const unidadeCod = getCodigoUnidade(editingContrato.unidadeNegociacaoId);
            const totalRomaneios = editingContrato.quantidadeEntregue ?? 0;
            const jaFixadoAnterior = editingFixacao
              ? totalFixado - editingFixacao.quantidadeFixada
              : totalFixado;
            const saldoAgora = Math.max(0, totalRomaneios - jaFixadoAnterior);
            const volAtual = Number(fixacaoForm.watch("quantidadeFixada")) || 0;
            const precoAtual = Number(fixacaoForm.watch("precoFixado")) || 0;
            const fixMoedaSimbolo = mockMoedas.find((m) => m.id === fixacaoForm.watch("moedaId"))?.simbolo ?? "R$";
            const valorFixacao = volAtual * precoAtual;
            return (
              <div className="rounded-md border border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10 p-3 text-sm space-y-1">
                <div className="flex justify-between"><span>Total Contratado:</span><strong>{editingContrato.quantidadeTotal.toLocaleString("pt-BR")} {unidadeCod}</strong></div>
                <div className="flex justify-between"><span>Romaneios Finalizados:</span><strong>{totalRomaneios.toLocaleString("pt-BR")} {unidadeCod}</strong></div>
                <div className="flex justify-between"><span>Total já Fixado (anterior):</span><strong>{jaFixadoAnterior.toLocaleString("pt-BR")} {unidadeCod}</strong></div>
                <div className="flex justify-between border-t pt-1"><span>Saldo a Fixar AGORA:</span><strong className={saldoAgora > 0 ? "text-amber-600" : "text-primary"}>{saldoAgora.toLocaleString("pt-BR")} {unidadeCod}</strong></div>
                <div className="flex justify-between border-t pt-1"><span>Valor desta Fixação:</span><strong className="text-primary">{formatMoeda(valorFixacao, fixMoedaSimbolo)}</strong></div>
              </div>
            );
          })()}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>
                Data <span className="text-destructive">*</span>
              </Label>
              <Input type="datetime-local" {...fixacaoForm.register("dataFixacao")} />
            </div>
            <div className="space-y-1.5">
              <Label>
                Unidade <span className="text-destructive">*</span>
              </Label>
              <Select
                value={fixacaoForm.watch("unidadeFixacaoId")}
                onValueChange={(v) => fixacaoForm.setValue("unidadeFixacaoId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {unidadesAtivas.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.codigo} — {u.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>
                Volume a Fixar <span className="text-destructive">*</span>
              </Label>
              <Input type="number" step="0.000001" {...fixacaoForm.register("quantidadeFixada")} />
              {(() => {
                const vol = fixacaoForm.watch("quantidadeFixada") || 0;
                if (vol > saldoAFixar * 1.05) {
                  return (
                    <p className="text-xs text-destructive">
                      Volume excede saldo disponível (máx {(saldoAFixar * 1.05).toFixed(2)})
                    </p>
                  );
                }
                if (vol > saldoAFixar) {
                  return <p className="text-xs text-amber-600">Over 5% tolerância agro — confirme manual</p>;
                }
                return null;
              })()}
            </div>
            <div className="space-y-1.5">
              <Label>
                Preço Unitário <span className="text-destructive">*</span>
              </Label>
              <Input type="number" step="0.01" {...fixacaoForm.register("precoFixado")} />
              {precoSugestao && (
                <p className="text-xs text-muted-foreground">
                  Sugerido: {formatCurrency(precoSugestao.valor, moedaCodigo)}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Moeda</Label>
              <Select value={fixacaoForm.watch("moedaId")} onValueChange={(v) => fixacaoForm.setValue("moedaId", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {moedas
                    .filter((m) => m.ativo)
                    .map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.codigo}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Dynamic Preview */}
          {(() => {
            const vol = fixacaoForm.watch("quantidadeFixada") || 0;
            const preco = fixacaoForm.watch("precoFixado") || 0;
            const fixMoedaId = fixacaoForm.watch("moedaId");
            const fixMoedaCod = mockMoedas.find((m) => m.id === fixMoedaId)?.codigo ?? "BRL";
            const total = vol * preco;
            const custoBase =
              precoSugestao?.breakdown?.find((b) => b.tipo.includes("Custo") || b.tipo.includes("Pago"))?.valor ??
              precoSugestao?.valor ??
              0;
            const margem = custoBase > 0 ? ((preco - custoBase) / custoBase) * 100 : 0;
            if (vol > 0 && preco > 0) {
              return (
                <div className="rounded-md border bg-muted/50 p-3 text-sm space-y-1">
                  <p className="font-semibold text-xs text-muted-foreground">Preview</p>
                  <div className="flex justify-between">
                    <span>
                      {vol.toLocaleString("pt-BR")} × {formatCurrency(preco, fixMoedaCod)}
                    </span>
                    <strong>{formatCurrency(total, fixMoedaCod)}</strong>
                  </div>
                  {custoBase > 0 && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Margem sobre custo base ({formatCurrency(custoBase, fixMoedaCod)})</span>
                      <span className={margem >= 0 ? "text-primary" : "text-destructive"}>{margem.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })()}
          <div className="space-y-1.5">
            <Label>
              Observações (motivo da fixação) <span className="text-destructive">*</span>
            </Label>
            <Textarea
              rows={2}
              {...fixacaoForm.register("observacoes")}
              placeholder="Ex: Fixação com base no mercado B3 do dia..."
            />
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
            <Label>
              Descrição <span className="text-destructive">*</span>
            </Label>
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
              <Label>
                Tipo <span className="text-destructive">*</span>
              </Label>
              <Select
                value={condTipo}
                onValueChange={(v) => setCondTipo(v as TipoCondicaoDesconto)}
                disabled={editingCondicao?.automatico}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTUAL">Percentual (%)</SelectItem>
                  <SelectItem value="VALOR_FIXO">Valor Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                Valor <span className="text-destructive">*</span>
              </Label>
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
            <AlertDialogAction
              onClick={onDeleteContrato}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
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
              Ao confirmar, o contrato será encerrado (LIQUIDADO) e os títulos financeiros serão atualizados. Estoque
              NÃO será alterado (já foi movimentado pelos romaneios). Esta ação não pode ser desfeita facilmente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmarLiquidacao}>Confirmar e Efetivar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Modal Gerar Contas de Contrato */}
      {(editingContrato || autoGerarDuplicatasContrato) && (
        <CrudModal
          open={gerarContasOpen}
          onClose={() => { setGerarContasOpen(false); setAutoGerarDuplicatasContrato(null); setFixacaoParaDuplicata(null); }}
          title={`Gerar Duplicatas ${fixacaoParaDuplicata ? "(Fixação)" : autoGerarDuplicatasContrato ? "Provisórias" : ""} — ${(editingContrato || autoGerarDuplicatasContrato)!.tipoContrato === "COMPRA" ? "A Pagar" : "A Receber"}`}
          saving={gcSaving}
          onSave={gcParcelasGeradas ? async () => {
            const ctr = (editingContrato || autoGerarDuplicatasContrato)!;
            const valorEsperado = fixacaoParaDuplicata
              ? fixacaoParaDuplicata.quantidadeFixada * fixacaoParaDuplicata.precoFixado
              : ctr.quantidadeTotal * ctr.precoUnitario;
            const soma = gcParcelasEditaveis.reduce((s, p) => s + p.valorParcela, 0);
            if (Math.abs(soma - valorEsperado) > 0.01) {
              toast({ title: "Soma das parcelas difere do valor esperado", variant: "destructive" });
              return;
            }
            setGcSaving(true);
            try {
              // A_FIXAR via fixação: definitivo (ABERTO/PENDENTE). FIXO recém-criado: provisório (PREVISTO).
              const isProvisorio = !!autoGerarDuplicatasContrato && !fixacaoParaDuplicata;
              const result = await financeiroContaService.gerarContasDeContrato(
                ctr.id,
                gcParcelasEditaveis,
                { grupoId: grupoAtual?.id ?? "", empresaId: ctr.empresaId, filialId: ctr.filialId },
                isProvisorio,
                { fixacaoId: fixacaoParaDuplicata?.id ?? null }
              );
              setFinContas([result.conta]);
              setFinParcelas(result.parcelas);
              // Para fixação (A_FIXAR), NÃO promover a FATURADO — contrato segue PARCIAL
              // até que todas as entregas estejam finalizadas e todo o saldo esteja fixado.
              if (!isProvisorio && !fixacaoParaDuplicata) {
                ctr.status = "FATURADO";
              }
              ctr.duplicatasGeradas = true;
              toast({ title: `Duplicatas geradas com sucesso! ${result.parcelas.length} parcela(s) criadas.` });
              setGerarContasOpen(false);
              setAutoGerarDuplicatasContrato(null);
              setFixacaoParaDuplicata(null);
              loadContratos();
            } catch (err: any) {
              toast({ title: err.message || "Erro ao gerar contas", variant: "destructive" });
            } finally { setGcSaving(false); }
          } : undefined}
          maxWidth="sm:max-w-2xl"
        >
          {(() => {
            const ctr = (editingContrato || autoGerarDuplicatasContrato)!;
            const ctrMoedaSimbolo = mockMoedas.find((m) => m.id === ctr.moedaId)?.simbolo ?? "R$";
            const valorEsperado = fixacaoParaDuplicata
              ? fixacaoParaDuplicata.quantidadeFixada * fixacaoParaDuplicata.precoFixado
              : ctr.quantidadeTotal * ctr.precoUnitario;
            return (
              <div className="space-y-4">
                {autoGerarDuplicatasContrato && !fixacaoParaDuplicata && (
                  <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                    ℹ️ Contrato <strong>{ctr.numeroContrato}</strong> criado com sucesso. Deseja gerar as duplicatas provisórias agora?
                  </div>
                )}
                {fixacaoParaDuplicata && (
                  <div className="rounded-md bg-primary/10 border border-primary/20 p-3 text-sm">
                    ✅ Fixação registrada: <strong>{fixacaoParaDuplicata.quantidadeFixada.toLocaleString("pt-BR")}</strong> × {formatMoeda(fixacaoParaDuplicata.precoFixado, ctrMoedaSimbolo)} = <strong>{formatMoeda(valorEsperado, ctrMoedaSimbolo)}</strong>. As duplicatas desta fixação serão geradas com status <strong>ABERTO</strong> (preço definitivo).
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Pessoa</Label>
                    <Input value={getNomePessoa(ctr.pessoaId)} disabled />
                  </div>
                  <div>
                    <Label>{fixacaoParaDuplicata ? "Valor desta Fixação" : "Valor Total do Contrato"}</Label>
                    <Input value={formatMoeda(valorEsperado, ctrMoedaSimbolo)} disabled />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantidade de Parcelas</Label>
                    <Input type="number" min="1" value={gcNumParcelas} onChange={(e) => { setGcNumParcelas(e.target.value); setGcParcelasGeradas(false); }} />
                  </div>
                  <div>
                    <Label>{parseInt(gcNumParcelas) === 1 ? "Data de Vencimento" : "Data da Primeira Parcela"}</Label>
                    <Input type="date" value={gcDataPrimeiraParcela} onChange={(e) => { setGcDataPrimeiraParcela(e.target.value); setGcParcelasGeradas(false); }} />
                  </div>
                </div>
                {parseInt(gcNumParcelas) >= 2 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Frequência</Label>
                      <Select value={gcFrequencia} onValueChange={(v) => { setGcFrequencia(v as any); setGcParcelasGeradas(false); }}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MENSAL">Mensal (30 dias)</SelectItem>
                          <SelectItem value="TRIMESTRAL">Trimestral (90 dias)</SelectItem>
                          <SelectItem value="SEMESTRAL">Semestral (180 dias)</SelectItem>
                          <SelectItem value="ANUAL">Anual (365 dias)</SelectItem>
                          <SelectItem value="PERSONALIZADO">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {gcFrequencia === "PERSONALIZADO" && (
                      <div>
                        <Label>Intervalo (dias)</Label>
                        <Input type="number" min="1" value={gcDiasPersonalizado} onChange={(e) => { setGcDiasPersonalizado(e.target.value); setGcParcelasGeradas(false); }} />
                      </div>
                    )}
                  </div>
                )}
                {parseInt(gcNumParcelas) === 1 && (
                  <p className="text-xs text-muted-foreground">Parcela única com vencimento em {new Date(gcDataPrimeiraParcela).toLocaleDateString("pt-BR")}.</p>
                )}

                <Button variant="outline" className="w-full" onClick={() => {
                  const n = parseInt(gcNumParcelas);
                  const vt = valorEsperado;
                  if (!n || n < 1) return;
                  const dias = gcFrequencia === "PERSONALIZADO" ? parseInt(gcDiasPersonalizado) || 30 : ({ MENSAL: 30, TRIMESTRAL: 90, SEMESTRAL: 180, ANUAL: 365 } as any)[gcFrequencia];
                  const valorBase = Math.round((vt / n) * 100) / 100;
                  const novas = [];
                  for (let i = 0; i < n; i++) {
                    const d = new Date(gcDataPrimeiraParcela);
                    d.setDate(d.getDate() + dias * i);
                    const val = i === n - 1 ? vt - valorBase * (n - 1) : valorBase;
                    novas.push({ numeroParcela: i + 1, dataVencimento: d.toISOString().slice(0, 10), valorParcela: Math.round(val * 100) / 100 });
                  }
                  setGcParcelasEditaveis(novas);
                  setGcParcelasGeradas(true);
                }}>
                  Gerar Pré-visualização
                </Button>

                {gcParcelasGeradas && gcParcelasEditaveis.length > 0 && (
                  <>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-20">Parcela</TableHead>
                            <TableHead>Data Vencimento</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {gcParcelasEditaveis.map((p, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-mono">{p.numeroParcela}</TableCell>
                              <TableCell>
                                <Input type="date" value={p.dataVencimento} onChange={(e) => {
                                  setGcParcelasEditaveis((prev) => prev.map((pp, i) => i === idx ? { ...pp, dataVencimento: e.target.value } : pp));
                                }} className="w-40" />
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="text"
                                  inputMode="decimal"
                                  value={(Number(p.valorParcela) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  onChange={(e) => {
                                  const raw = e.target.value.replace(/\./g, "").replace(",", ".").replace(/[^0-9.]/g, "");
                                  const novoValor = parseFloat(raw) || 0;
                                  const vt = valorEsperado;
                                  setGcParcelasEditaveis((prev) => {
                                    const updated = prev.map((pp, i) => i === idx ? { ...pp, valorParcela: novoValor } : pp);
                                    if (updated.length > 1 && idx !== updated.length - 1) {
                                      const somaOutras = updated.reduce((s, pp, i) => i !== updated.length - 1 ? s + pp.valorParcela : s, 0);
                                      updated[updated.length - 1] = { ...updated[updated.length - 1], valorParcela: Math.round((vt - somaOutras) * 100) / 100 };
                                    }
                                    return updated;
                                  });
                                }} className="w-32 text-right ml-auto" />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {(() => {
                      const soma = gcParcelasEditaveis.reduce((s, p) => s + p.valorParcela, 0);
                      const vt = valorEsperado;
                      const ok = Math.abs(soma - vt) < 0.01;
                      return (
                        <div className={`flex items-center justify-between p-3 rounded-md border ${ok ? "border-success/50 bg-success/10" : "border-destructive/50 bg-destructive/10"}`}>
                          <span className="text-sm font-medium">Soma: {formatMoeda(soma, ctrMoedaSimbolo)}</span>
                          <span className="text-sm text-muted-foreground">Valor total: {formatMoeda(vt, ctrMoedaSimbolo)}</span>
                        </div>
                      );
                    })()}
                  </>
                )}

              </div>
            );
          })()}
        </CrudModal>
      )}
    </>
  );
}
