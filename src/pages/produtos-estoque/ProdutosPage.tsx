import { useEffect, useState, useCallback, useMemo } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Plus, Pencil, Trash2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
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
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  produtoService,
  produtoEmpresaService,
  produtoEmpresaTabelaPrecoService,
  empresaService,
  coeficienteEmpresaService,
  tabelaPrecoEmpresaService,
  divisaoProdutoService,
  secaoProdutoService,
  grupoProdutoService,
  subgrupoProdutoService,
  marcaProdutoService,
  unidadeMedidaService,
  tipoProdutoService,
  classificacaoTipoService,
  produtoClassificacaoService,
  classificacaoDescontoService,
} from "@/lib/services";
import {
  tabelasPreco as mockTabelasPrecoData,
  coeficientes as mockCoeficientesData,
  coeficienteEmpresas as mockCoeficienteEmpresasData,
  tabelaPrecoEmpresas as mockTabelaPrecoEmpresasData,
} from "@/lib/mock-data";
import type {
  Produto,
  Empresa,
  CoeficienteEmpresa,
  TabelaPrecoEmpresa,
  DivisaoProduto,
  SecaoProduto,
  GrupoProduto,
  SubgrupoProduto,
  MarcaProduto,
  TipoBaixaEstoque,
  UnidadeMedida,
  TipoProduto,
  ClassificacaoTipo,
  ProdutoClassificacao,
  ClassificacaoDesconto,
} from "@/lib/mock-data";

// ---- Schema ----
const schema = z.object({
  tipoProdutoId: z.string().min(1, "Tipo de Produto é obrigatório"),
  codigoBarras: z.string().max(50).optional().default(""),
  descricao: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(200, "Máximo 200 caracteres")
    .transform((v) => v.trim()),
  aplicacao: z.string().optional().default(""),
  tipoBaixaEstoque: z.enum(["INDIVIDUAL", "AGREGADO"]),
  quantidadeEmbalagemEntrada: z.coerce
    .number()
    .min(0.000001, "Deve ser maior que 0"),
  quantidadeEmbalagemSaida: z.coerce
    .number()
    .min(0.000001, "Deve ser maior que 0"),
  divisaoProdutoId: z.string().min(1, "Divisão é obrigatória"),
  secaoProdutoId: z.string().min(1, "Seção é obrigatória"),
  grupoProdutoId: z.string().min(1, "Grupo é obrigatório"),
  subgrupoProdutoId: z.string().min(1, "Subgrupo é obrigatório"),
  marcaProdutoId: z.string().optional().default(""),
  unidadeBaseId: z.string().min(1, "Unidade base é obrigatória"),
  unidadeEntradaId: z.string().min(1, "Unidade de entrada é obrigatória"),
  unidadeSaidaId: z.string().min(1, "Unidade de saída é obrigatória"),
  ativo: z.boolean(),
});

type FormData = z.infer<typeof schema>;

// ---- Empresa row state ----
interface EmpresaRowState {
  id?: string;
  empresaId: string;
  empresaNome: string;
  coeficienteEmpresaId: string;
  custoBase: number;
  custoCalculado: number;
  ativo: boolean;
  // tabelas de preco
  tabelasPreco: TabelaPrecoRowState[];
}

interface TabelaPrecoRowState {
  id?: string;
  tabelaPrecoEmpresaId: string;
  tabelaPrecoNome: string;
  precoCalculado: number;
  ativo: boolean;
}

export default function ProdutosPage() {
  const {
    grupoAtual,
    empresaAtual,
    filialAtual,
    empresas: empresasCtx,
  } = useOrganization();
  const grupoId = grupoAtual?.id ?? null;

  const [data, setData] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Produto | null>(null);

  // Lookup data
  const [divisoes, setDivisoes] = useState<DivisaoProduto[]>([]);
  const [secoes, setSecoes] = useState<SecaoProduto[]>([]);
  const [gruposProduto, setGruposProduto] = useState<GrupoProduto[]>([]);
  const [subgrupos, setSubgrupos] = useState<SubgrupoProduto[]>([]);
  const [marcas, setMarcas] = useState<MarcaProduto[]>([]);
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([]);
  const [empresasGrupo, setEmpresasGrupo] = useState<Empresa[]>([]);
  const [tiposProdutoList, setTiposProdutoList] = useState<TipoProduto[]>([]);

  // Empresa tab
  const [empresaRows, setEmpresaRows] = useState<EmpresaRowState[]>([]);
  // Coeficientes por empresa {empresaId: CoeficienteEmpresa[]}
  const [coeficientesPorEmpresa, setCoeficientesPorEmpresa] = useState<
    Record<string, CoeficienteEmpresa[]>
  >({});
  // Tabelas preco por empresa {empresaId: TabelaPrecoEmpresa[]}
  const [tabelasPrecoPorEmpresa, setTabelasPrecoPorEmpresa] = useState<
    Record<string, TabelaPrecoEmpresa[]>
  >({});

  const [confirmRecalc, setConfirmRecalc] = useState(false);

  // Classification tab state
  const [classificacaoTipos, setClassificacaoTipos] = useState<ClassificacaoTipo[]>([]);
  const [produtoClassificacoes, setProdutoClassificacoes] = useState<ProdutoClassificacao[]>([]);
  const [classificacaoDescontos, setClassificacaoDescontos] = useState<ClassificacaoDesconto[]>([]);
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ProdutoClassificacao | null>(null);
  const [classForm, setClassForm] = useState({ classificacaoTipoId: "", valorPadrao: "", limiteTolerancia: "", ativo: true });
  const [descModalOpen, setDescModalOpen] = useState(false);
  const [editingDesc, setEditingDesc] = useState<ClassificacaoDesconto | null>(null);
  const [descForm, setDescForm] = useState({ classificacaoTipoId: "", valorMinimo: "", valorMaximo: "", percentualDesconto: "" });
  const [deleteClassTarget, setDeleteClassTarget] = useState<ProdutoClassificacao | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const ativoValue = watch("ativo");
  const secaoSel = watch("secaoProdutoId");
  const grupoSel = watch("grupoProdutoId");
  const unidadeBaseIdSel = watch("unidadeBaseId");
  const unidadeEntradaIdSel = watch("unidadeEntradaId");
  const unidadeSaidaIdSel = watch("unidadeSaidaId");

  // Filtered classification lists
  const gruposFiltrados = useMemo(
    () => gruposProduto.filter((g) => g.secaoProdutoId === secaoSel),
    [gruposProduto, secaoSel]
  );
  const subgruposFiltrados = useMemo(
    () => subgrupos.filter((s) => s.grupoProdutoId === grupoSel),
    [subgrupos, grupoSel]
  );

  // Filtered unidades by type of base unit
  const unidadeBaseSel = useMemo(
    () => unidades.find((u) => u.id === unidadeBaseIdSel),
    [unidades, unidadeBaseIdSel]
  );
  const unidadesEntradaFiltradas = useMemo(
    () => unidadeBaseSel ? unidades.filter((u) => u.tipo === unidadeBaseSel.tipo && u.ativo) : unidades.filter((u) => u.ativo),
    [unidades, unidadeBaseSel]
  );
  const unidadesSaidaFiltradas = useMemo(
    () => unidadeBaseSel ? unidades.filter((u) => u.tipo === unidadeBaseSel.tipo && u.ativo) : unidades.filter((u) => u.ativo),
    [unidades, unidadeBaseSel]
  );

  // Lookup maps for table display
  const divisaoMap = useMemo(
    () => Object.fromEntries(divisoes.map((d) => [d.id, d.descricao])),
    [divisoes]
  );
  const marcaMap = useMemo(
    () => Object.fromEntries(marcas.map((m) => [m.id, m.descricao])),
    [marcas]
  );

  const columns: Column<Produto>[] = [
    { key: "codigoBarras", header: "Código" },
    { key: "descricao", header: "Descrição" },
    {
      key: "divisaoProdutoId",
      header: "Divisão",
      render: (row) => divisaoMap[row.divisaoProdutoId] ?? "-",
    },
    {
      key: "marcaProdutoId",
      header: "Marca",
      render: (row) =>
        row.marcaProdutoId ? (marcaMap[row.marcaProdutoId] ?? "-") : "-",
    },
    {
      key: "ativo",
      header: "Status",
      render: (row) => (
        <Badge variant={row.ativo ? "default" : "secondary"}>
          {row.ativo ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
  ];

  const loadData = useCallback(() => {
    if (!grupoId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    produtoService.listar(grupoId).then((list) => {
      setData(list);
      setLoading(false);
    });
  }, [grupoId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load lookups
  useEffect(() => {
    if (!empresaAtual || !filialAtual) return;
    const eId = empresaAtual.id;
    const fId = filialAtual.id;
    Promise.all([
      divisaoProdutoService.listar(eId, fId),
      secaoProdutoService.listar(eId, fId),
      grupoProdutoService.listar(eId, fId),
      subgrupoProdutoService.listar(eId, fId),
      marcaProdutoService.listar(eId, fId),
      unidadeMedidaService.listar(eId, fId),
      tipoProdutoService.listar(eId, fId),
    ]).then(([d, s, g, sg, m, um, tp]) => {
      setDivisoes(d);
      setSecoes(s);
      setGruposProduto(g);
      setSubgrupos(sg);
      setMarcas(m);
      setUnidades(um);
      setTiposProdutoList(tp);
    });
  }, [empresaAtual, filialAtual]);

  // Load classification types
  useEffect(() => {
    if (!empresaAtual || !filialAtual) return;
    classificacaoTipoService.listar(empresaAtual.id, filialAtual.id).then(setClassificacaoTipos);
  }, [empresaAtual, filialAtual]);

  useEffect(() => {
    if (grupoId) {
      empresaService.listar(grupoId).then(setEmpresasGrupo);
    }
  }, [grupoId]);

  // Load coeficientes and tabelas for all empresas in the group
  const loadEmpresaLookups = useCallback(async () => {
    if (empresasGrupo.length === 0) return;
    const coefMap: Record<string, CoeficienteEmpresa[]> = {};
    const tpMap: Record<string, TabelaPrecoEmpresa[]> = {};
    for (const emp of empresasGrupo) {
      coefMap[emp.id] = mockCoeficienteEmpresasData.filter(
        (ce: CoeficienteEmpresa) =>
          ce.deletadoEm === null && ce.empresaId === emp.id
      );
      tpMap[emp.id] = mockTabelaPrecoEmpresasData.filter(
        (tpe: TabelaPrecoEmpresa) =>
          tpe.deletadoEm === null && tpe.empresaId === emp.id
      );
    }
    setCoeficientesPorEmpresa(coefMap);
    setTabelasPrecoPorEmpresa(tpMap);
  }, [empresasGrupo]);

  useEffect(() => {
    loadEmpresaLookups();
  }, [loadEmpresaLookups]);

  // Mock cost calculation
  const calcularCusto = (
    custoBase: number,
    coefEmpId: string
  ): number => {
    // find the coeficiente empresa
    for (const ces of Object.values(coeficientesPorEmpresa)) {
      const ce = ces.find((c) => c.id === coefEmpId);
      if (ce) {
        const totalPerc =
          ce.percentualCustoVariavel +
          ce.percentualCustoFixo +
          ce.percentualImpostos;
        return Math.round((custoBase * (1 + totalPerc / 100)) * 100) / 100;
      }
    }
    return custoBase;
  };

  const calcularPreco = (
    custoCalculado: number,
    tpeId: string
  ): number => {
    for (const tpes of Object.values(tabelasPrecoPorEmpresa)) {
      const tpe = tpes.find((t) => t.id === tpeId);
      if (tpe) {
        return (
          Math.round(
            custoCalculado * (1 + tpe.margemLucroPercentual / 100) * 100
          ) / 100
        );
      }
    }
    return custoCalculado;
  };

  const openNew = () => {
    setEditingId(null);
    reset({
      tipoProdutoId: "",
      codigoBarras: "",
      descricao: "",
      aplicacao: "",
      tipoBaixaEstoque: "INDIVIDUAL",
      quantidadeEmbalagemEntrada: 1,
      quantidadeEmbalagemSaida: 1,
      divisaoProdutoId: "",
      secaoProdutoId: "",
      grupoProdutoId: "",
      subgrupoProdutoId: "",
      marcaProdutoId: "",
      unidadeBaseId: "",
      unidadeEntradaId: "",
      unidadeSaidaId: "",
      ativo: true,
    });
    // Initialize empresa rows for all empresas, all inactive
    setEmpresaRows(
      empresasGrupo.map((emp) => ({
        empresaId: emp.id,
        empresaNome: emp.nomeFantasia || emp.razaoSocial,
        coeficienteEmpresaId: "",
        custoBase: 0,
        custoCalculado: 0,
        ativo: false,
        tabelasPreco: (tabelasPrecoPorEmpresa[emp.id] ?? []).map((tpe) => ({
          tabelaPrecoEmpresaId: tpe.id,
          tabelaPrecoNome: `Tabela #${tpe.id}`,
          precoCalculado: 0,
          ativo: false,
        })),
      }))
    );
    setProdutoClassificacoes([]);
    setClassificacaoDescontos([]);
    setModalOpen(true);
  };

  const openEdit = async (row: Produto) => {
    setEditingId(row.id);
    reset({
      tipoProdutoId: row.tipoProdutoId ?? "",
      codigoBarras: row.codigoBarras,
      descricao: row.descricao,
      aplicacao: row.aplicacao,
      tipoBaixaEstoque: row.tipoBaixaEstoque,
      quantidadeEmbalagemEntrada: row.quantidadeEmbalagemEntrada,
      quantidadeEmbalagemSaida: row.quantidadeEmbalagemSaida,
      divisaoProdutoId: row.divisaoProdutoId,
      secaoProdutoId: row.secaoProdutoId,
      grupoProdutoId: row.grupoProdutoId,
      subgrupoProdutoId: row.subgrupoProdutoId,
      marcaProdutoId: row.marcaProdutoId ?? "",
      unidadeBaseId: row.unidadeBaseId ?? "",
      unidadeEntradaId: row.unidadeEntradaId ?? "",
      unidadeSaidaId: row.unidadeSaidaId ?? "",
      ativo: row.ativo,
    });

    // Load existing produto_empresas
    const pes = await produtoEmpresaService.listarPorProduto(row.id);
    const rows: EmpresaRowState[] = [];

    for (const emp of empresasGrupo) {
      const pe = pes.find((p) => p.empresaId === emp.id);
      // Load tabelas for this PE
      let tabelasRows: TabelaPrecoRowState[] = [];
      const allTpes = tabelasPrecoPorEmpresa[emp.id] ?? [];

      if (pe) {
        const existingTps =
          await produtoEmpresaTabelaPrecoService.listarPorProdutoEmpresa(
            pe.id
          );
        tabelasRows = allTpes.map((tpe) => {
          const existing = existingTps.find(
            (t) => t.tabelaPrecoEmpresaId === tpe.id
          );
          return {
            id: existing?.id,
            tabelaPrecoEmpresaId: tpe.id,
            tabelaPrecoNome: `Tabela #${tpe.id}`,
            precoCalculado: existing?.precoCalculado ?? 0,
            ativo: existing?.ativo ?? false,
          };
        });
      } else {
        tabelasRows = allTpes.map((tpe) => ({
          tabelaPrecoEmpresaId: tpe.id,
          tabelaPrecoNome: `Tabela #${tpe.id}`,
          precoCalculado: 0,
          ativo: false,
        }));
      }

      rows.push({
        id: pe?.id,
        empresaId: emp.id,
        empresaNome: emp.nomeFantasia || emp.razaoSocial,
        coeficienteEmpresaId: pe?.coeficienteEmpresaId ?? "",
        custoBase: pe?.custoBase ?? 0,
        custoCalculado: pe?.custoCalculado ?? 0,
        ativo: pe?.ativo ?? false,
        tabelasPreco: tabelasRows,
      });
    }
    setEmpresaRows(rows);

    // Load classifications
    const [pcs, cds] = await Promise.all([
      produtoClassificacaoService.listarPorProduto(row.id),
      classificacaoDescontoService.listarPorProduto(row.id),
    ]);
    setProdutoClassificacoes(pcs);
    setClassificacaoDescontos(cds);

    setModalOpen(true);
  };

  const onSave = handleSubmit(async (formData) => {
    if (!grupoId || !empresaAtual || !filialAtual) return;
    const dup = await produtoService.descricaoExiste(
      formData.descricao,
      grupoId,
      editingId ?? undefined
    );
    if (dup) {
      setError("descricao", {
        message: "Já existe produto com esta descrição",
      });
      return;
    }

    // Validate unit types match
    const unBase = unidades.find((u) => u.id === formData.unidadeBaseId);
    const unEntrada = unidades.find((u) => u.id === formData.unidadeEntradaId);
    const unSaida = unidades.find((u) => u.id === formData.unidadeSaidaId);
    if (unBase && unEntrada && unEntrada.tipo !== unBase.tipo) {
      setError("unidadeEntradaId", { message: "Deve ser do mesmo tipo da unidade base" });
      return;
    }
    if (unBase && unSaida && unSaida.tipo !== unBase.tipo) {
      setError("unidadeSaidaId", { message: "Deve ser do mesmo tipo da unidade base" });
      return;
    }

    setSaving(true);
    try {
      const saved = await produtoService.salvar(
        {
          id: editingId ?? undefined,
          ...formData,
          marcaProdutoId: formData.marcaProdutoId || null,
        },
        {
          grupoId,
          empresaId: empresaAtual.id,
          filialId: filialAtual.id,
        }
      );

      // Save empresa rows
      for (const row of empresaRows) {
        if (row.ativo) {
          const savedPe = await produtoEmpresaService.salvar(
            {
              id: row.id,
              empresaId: row.empresaId,
              coeficienteEmpresaId: row.coeficienteEmpresaId,
              custoBase: row.custoBase,
              custoCalculado: row.custoCalculado,
              ativo: row.ativo,
            },
            saved.id
          );
          // Save tabelas
          for (const tp of row.tabelasPreco) {
            if (tp.ativo) {
              await produtoEmpresaTabelaPrecoService.salvar(
                {
                  id: tp.id,
                  tabelaPrecoEmpresaId: tp.tabelaPrecoEmpresaId,
                  precoCalculado: tp.precoCalculado,
                  ativo: tp.ativo,
                },
                savedPe.id
              );
            }
          }
        }
      }

      toast({
        title: editingId ? "Produto atualizado" : "Produto criado",
        description: `"${formData.descricao}" salvo com sucesso.`,
      });
      setModalOpen(false);
      loadData();
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível salvar.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await produtoService.excluir(deleteTarget.id);
    toast({
      title: "Produto excluído",
      description: `"${deleteTarget.descricao}" foi removido.`,
    });
    setDeleteTarget(null);
    loadData();
  };

  const updateEmpresaRow = (
    index: number,
    updates: Partial<EmpresaRowState>
  ) => {
    setEmpresaRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...updates } : r))
    );
  };

  const recalcAll = () => {
    setEmpresaRows((prev) =>
      prev.map((row) => {
        if (!row.ativo) return row;
        const custoCalc = calcularCusto(row.custoBase, row.coeficienteEmpresaId);
        return {
          ...row,
          custoCalculado: custoCalc,
          tabelasPreco: row.tabelasPreco.map((tp) => ({
            ...tp,
            precoCalculado: tp.ativo
              ? calcularPreco(custoCalc, tp.tabelaPrecoEmpresaId)
              : tp.precoCalculado,
          })),
        };
      })
    );
    setConfirmRecalc(false);
    toast({
      title: "Recálculo concluído",
      description: "Custos e preços foram recalculados com sucesso.",
    });
  };

  // Get tabela preco names from mock data
  const getTabelaPrecoNome = (tpeId: string): string => {
    for (const tpes of Object.values(tabelasPrecoPorEmpresa)) {
      const tpe = tpes.find((t) => t.id === tpeId);
      if (tpe) {
        const parent = mockTabelasPrecoData.find(
          (tp) => tp.id === tpe.tabelaPrecoId && tp.deletadoEm === null
        );
        return parent?.descricao ?? tpeId;
      }
    }
    return tpeId;
  };

  // Get coeficiente nome
  const getCoeficienteNome = (ceId: string): string => {
    for (const ces of Object.values(coeficientesPorEmpresa)) {
      const ce = ces.find((c) => c.id === ceId);
      if (ce) {
        const parent = mockCoeficientesData.find(
          (c) => c.id === ce.coeficienteId && c.deletadoEm === null
        );
        return parent?.descricao ?? ceId;
      }
    }
    return ceId;
  };

  if (!grupoId) {
    return (
      <>
        <PageHeader
          title="Produtos"
          description="Gerencie os produtos do grupo"
        />
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Selecione um Grupo para visualizar os registros.
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Produtos"
        description="Gerencie os produtos do grupo"
      />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchPlaceholder="Buscar por descrição..."
        onNew={openNew}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      <CrudModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar Produto" : "Novo Produto"}
        saving={saving}
        onSave={onSave}
        maxWidth="sm:max-w-5xl"
      >
        <Tabs defaultValue="dados" className="w-full">
          <div className="flex justify-between items-center mb-4">
             <TabsList>
              <TabsTrigger value="dados">Dados Gerais</TabsTrigger>
              <TabsTrigger value="empresas">Empresas Permitidas</TabsTrigger>
              <TabsTrigger value="precos">Tabelas de Preço</TabsTrigger>
              <TabsTrigger value="classificacao" disabled={!editingId}>Classificação de Qualidade</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-3">
              <Switch
                id="ativo"
                checked={ativoValue}
                onCheckedChange={(v) => setValue("ativo", v)}
              />
              <Label htmlFor="ativo">Produto está ativo?</Label>
            </div>
          </div>

          {/* ---- TAB 1: Dados Gerais ---- */}
          <TabsContent value="dados">
            <div className="space-y-4">
              {/* Tipo de Produto - primeiro campo */}
              <div className="space-y-1.5">
                <Label>
                  Tipo de Produto <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch("tipoProdutoId")}
                  onValueChange={(v) => setValue("tipoProdutoId", v)}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Selecione o tipo de produto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposProdutoList.filter((tp) => tp.ativo).map((tp) => (
                      <SelectItem key={tp.id} value={tp.id}>
                        {tp.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipoProdutoId && (
                  <p className="text-xs text-destructive">
                    {errors.tipoProdutoId.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="codigoBarras">Código de Barras</Label>
                  <Input
                    id="codigoBarras"
                    maxLength={50}
                    {...register("codigoBarras")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="descricao">
                    Descrição <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="descricao"
                    maxLength={200}
                    {...register("descricao")}
                  />
                  {errors.descricao && (
                    <p className="text-xs text-destructive">
                      {errors.descricao.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="aplicacao">Aplicação</Label>
                <Textarea
                  id="aplicacao"
                  rows={2}
                  {...register("aplicacao")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <Label>
                    Tipo de Baixa <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={watch("tipoBaixaEstoque")}
                    onValueChange={(v) =>
                      setValue(
                        "tipoBaixaEstoque",
                        v as TipoBaixaEstoque
                      )
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                      <SelectItem value="AGREGADO">Agregado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>
                    Divisão <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={watch("divisaoProdutoId")}
                    onValueChange={(v) => setValue("divisaoProdutoId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {divisoes.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.divisaoProdutoId && (
                    <p className="text-xs text-destructive">
                      {errors.divisaoProdutoId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Marca</Label>
                  <Select
                    value={watch("marcaProdutoId") || "__none__"}
                    onValueChange={(v) =>
                      setValue("marcaProdutoId", v === "__none__" ? "" : v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Nenhuma</SelectItem>
                      {marcas.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>
                    Seção <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={watch("secaoProdutoId")}
                    onValueChange={(v) => {
                      setValue("secaoProdutoId", v);
                      setValue("grupoProdutoId", "");
                      setValue("subgrupoProdutoId", "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {secoes.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.secaoProdutoId && (
                    <p className="text-xs text-destructive">
                      {errors.secaoProdutoId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>
                    Grupo <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={watch("grupoProdutoId")}
                    onValueChange={(v) => {
                      setValue("grupoProdutoId", v);
                      setValue("subgrupoProdutoId", "");
                    }}
                    disabled={!secaoSel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {gruposFiltrados.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.grupoProdutoId && (
                    <p className="text-xs text-destructive">
                      {errors.grupoProdutoId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>
                    Subgrupo <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={watch("subgrupoProdutoId")}
                    onValueChange={(v) => setValue("subgrupoProdutoId", v)}
                    disabled={!grupoSel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {subgruposFiltrados.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subgrupoProdutoId && (
                    <p className="text-xs text-destructive">
                      {errors.subgrupoProdutoId.message}
                    </p>
                  )}
                </div>
              </div>

              {/* 📦 Unidades */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">📦 Unidades</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Coluna 1: Unidade Base */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>
                        Unidade Base <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={watch("unidadeBaseId")}
                        onValueChange={(v) => {
                          setValue("unidadeBaseId", v);
                          setValue("unidadeEntradaId", "");
                          setValue("unidadeSaidaId", "");
                          setValue("quantidadeEmbalagemEntrada", 1);
                          setValue("quantidadeEmbalagemSaida", 1);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {unidades.filter((u) => u.ativo).map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.codigo} - {u.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.unidadeBaseId && (
                        <p className="text-xs text-destructive">
                          {errors.unidadeBaseId.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Coluna 2: Unidade de Entrada + Qtd Emb */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>
                        Unidade de Entrada <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={watch("unidadeEntradaId")}
                        onValueChange={(v) => {
                          setValue("unidadeEntradaId", v);
                          if (v === unidadeBaseIdSel) {
                            setValue("quantidadeEmbalagemEntrada", 1);
                          }
                          const um = unidades.find((u) => u.id === v);
                          if (um) {
                            console.log(`[Mock Conversão Entrada] unidade=${um.codigo}, fator=${um.fatorBase}`);
                          }
                        }}
                        disabled={!unidadeBaseIdSel}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {unidadesEntradaFiltradas.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.codigo} - {u.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.unidadeEntradaId && (
                        <p className="text-xs text-destructive">
                          {errors.unidadeEntradaId.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>
                        Qtd. Emb. Entrada <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        step="0.000001"
                        min="0"
                        readOnly={unidadeEntradaIdSel === unidadeBaseIdSel && !!unidadeEntradaIdSel}
                        className={unidadeEntradaIdSel === unidadeBaseIdSel && !!unidadeEntradaIdSel ? "bg-muted" : ""}
                        {...register("quantidadeEmbalagemEntrada")}
                        onChange={(e) => {
                          register("quantidadeEmbalagemEntrada").onChange(e);
                          const val = parseFloat(e.target.value) || 0;
                          const um = unidades.find((u) => u.id === unidadeEntradaIdSel);
                          if (um) {
                            console.log(`[Mock Conversão] quantidade_base = ${val} × ${um.fatorBase} = ${val * um.fatorBase}`);
                          }
                        }}
                      />
                      {errors.quantidadeEmbalagemEntrada && (
                        <p className="text-xs text-destructive">
                          {errors.quantidadeEmbalagemEntrada.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Coluna 3: Unidade de Saída + Qtd Emb */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>
                        Unidade de Saída <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={watch("unidadeSaidaId")}
                        onValueChange={(v) => {
                          setValue("unidadeSaidaId", v);
                          if (v === unidadeBaseIdSel) {
                            setValue("quantidadeEmbalagemSaida", 1);
                          }
                          const um = unidades.find((u) => u.id === v);
                          if (um) {
                            console.log(`[Mock Conversão Saída] unidade=${um.codigo}, fator=${um.fatorBase}`);
                          }
                        }}
                        disabled={!unidadeBaseIdSel}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {unidadesSaidaFiltradas.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.codigo} - {u.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.unidadeSaidaId && (
                        <p className="text-xs text-destructive">
                          {errors.unidadeSaidaId.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>
                        Qtd. Emb. Saída <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        step="0.000001"
                        min="0"
                        readOnly={unidadeSaidaIdSel === unidadeBaseIdSel && !!unidadeSaidaIdSel}
                        className={unidadeSaidaIdSel === unidadeBaseIdSel && !!unidadeSaidaIdSel ? "bg-muted" : ""}
                        {...register("quantidadeEmbalagemSaida")}
                      />
                      {errors.quantidadeEmbalagemSaida && (
                        <p className="text-xs text-destructive">
                          {errors.quantidadeEmbalagemSaida.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ---- TAB 2: Empresas Permitidas ---- */}
          <TabsContent value="empresas">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  Configuração por Empresa
                </h3>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmRecalc(true)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Recalcular preços
                  </Button>
                )}
              </div>

              {empresaRows.length === 0 ? (
                <div className="rounded-lg border bg-muted/50 p-6 text-center text-sm text-muted-foreground">
                  Nenhuma empresa disponível no grupo.
                </div>
              ) : (
                <div className="space-y-3">
                  {empresaRows.map((row, index) => (
                    <div
                      key={row.empresaId}
                      className="rounded-lg border bg-card p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={row.ativo}
                            onCheckedChange={(v) =>
                              updateEmpresaRow(index, { ativo: v })
                            }
                          />
                          <span className="font-medium text-sm">
                            {row.empresaNome}
                          </span>
                        </div>
                        <Badge
                          variant={row.ativo ? "default" : "secondary"}
                        >
                          {row.ativo ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>

                      {row.ativo && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">
                              Coeficiente{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              value={row.coeficienteEmpresaId || "__none__"}
                              onValueChange={(v) => {
                                const ceId =
                                  v === "__none__" ? "" : v;
                                const custoCalc = ceId
                                  ? calcularCusto(row.custoBase, ceId)
                                  : row.custoBase;
                                updateEmpresaRow(index, {
                                  coeficienteEmpresaId: ceId,
                                  custoCalculado: custoCalc,
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">
                                  Selecione...
                                </SelectItem>
                                {(
                                  coeficientesPorEmpresa[row.empresaId] ??
                                  []
                                ).map((ce) => (
                                  <SelectItem key={ce.id} value={ce.id}>
                                    {getCoeficienteNome(ce.id)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">
                              Custo Base{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={row.custoBase}
                              onChange={(e) => {
                                const val =
                                  parseFloat(e.target.value) || 0;
                                const custoCalc =
                                  row.coeficienteEmpresaId
                                    ? calcularCusto(
                                        val,
                                        row.coeficienteEmpresaId
                                      )
                                    : val;
                                updateEmpresaRow(index, {
                                  custoBase: val,
                                  custoCalculado: custoCalc,
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">
                              Custo Calculado
                            </Label>
                            <Input
                              type="number"
                              value={row.custoCalculado.toFixed(2)}
                              readOnly
                              className="bg-muted"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ---- TAB 3: Tabelas de Preço ---- */}
          <TabsContent value="precos">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">
                Preços por Tabela e Empresa
              </h3>

              {empresaRows.filter((r) => r.ativo).length === 0 ? (
                <div className="rounded-lg border bg-muted/50 p-6 text-center text-sm text-muted-foreground">
                  Nenhuma empresa ativa. Ative empresas na aba anterior.
                </div>
              ) : (
                <div className="space-y-3">
                  {empresaRows
                    .map((row, origIndex) => ({ row, origIndex }))
                    .filter(({ row }) => row.ativo)
                    .map(({ row, origIndex }) => (
                      <div
                        key={row.empresaId}
                        className="rounded-lg border bg-card p-4 space-y-3"
                      >
                        <h4 className="font-medium text-sm">
                          {row.empresaNome}
                        </h4>

                        {row.tabelasPreco.length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            Nenhuma tabela de preço configurada para esta
                            empresa.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {row.tabelasPreco.map((tp, tpIndex) => (
                              <div
                                key={tp.tabelaPrecoEmpresaId}
                                className="flex items-center gap-4 rounded-md border p-3"
                              >
                                <Switch
                                  checked={tp.ativo}
                                  onCheckedChange={(v) => {
                                    const newTps = [
                                      ...row.tabelasPreco,
                                    ];
                                    newTps[tpIndex] = {
                                      ...newTps[tpIndex],
                                      ativo: v,
                                      precoCalculado: v
                                        ? calcularPreco(
                                            row.custoCalculado,
                                            tp.tabelaPrecoEmpresaId
                                          )
                                        : 0,
                                    };
                                    updateEmpresaRow(origIndex, {
                                      tabelasPreco: newTps,
                                    });
                                  }}
                                />
                                <span className="text-sm min-w-[120px]">
                                  {getTabelaPrecoNome(
                                    tp.tabelaPrecoEmpresaId
                                  )}
                                </span>
                                <div className="flex items-center gap-2 ml-auto">
                                  <Label className="text-xs">
                                    Preço Calculado
                                  </Label>
                                  <Input
                                    type="number"
                                    value={tp.precoCalculado.toFixed(2)}
                                    readOnly
                                    className="bg-muted w-[120px]"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ---- TAB 4: Classificação de Qualidade ---- */}
          <TabsContent value="classificacao">
            <div className="space-y-6">
              {/* GRID 1 — Classificações utilizadas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Classificações Utilizadas</h3>
                  <Button type="button" size="sm" variant="outline" onClick={() => {
                    setEditingClass(null);
                    setClassForm({ classificacaoTipoId: "", valorPadrao: "", limiteTolerancia: "", ativo: true });
                    setClassModalOpen(true);
                  }}><Plus className="mr-2 h-4 w-4" />Adicionar</Button>
                </div>
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo Classificação</TableHead>
                        <TableHead className="text-right">Valor Padrão</TableHead>
                        <TableHead className="text-right">Limite Tolerância</TableHead>
                        <TableHead>Ativo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {produtoClassificacoes.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Nenhuma classificação configurada.</TableCell></TableRow>
                      ) : produtoClassificacoes.map((pc) => (
                        <TableRow key={pc.id}>
                          <TableCell>{classificacaoTipos.find((t) => t.id === pc.classificacaoTipoId)?.descricao ?? pc.classificacaoTipoId}</TableCell>
                          <TableCell className="text-right">{pc.valorPadrao}</TableCell>
                          <TableCell className="text-right">{pc.limiteTolerancia}</TableCell>
                          <TableCell><Badge variant={pc.ativo ? "default" : "secondary"}>{pc.ativo ? "Sim" : "Não"}</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => {
                                setEditingClass(pc);
                                setClassForm({ classificacaoTipoId: pc.classificacaoTipoId, valorPadrao: String(pc.valorPadrao), limiteTolerancia: String(pc.limiteTolerancia), ativo: pc.ativo });
                                setClassModalOpen(true);
                              }}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => {
                                setDeleteClassTarget(pc);
                              }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* GRID 2 — Tabela de Descontos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Tabela de Descontos por Qualidade</h3>
                  <Button type="button" size="sm" variant="outline" onClick={() => {
                    setEditingDesc(null);
                    setDescForm({ classificacaoTipoId: "", valorMinimo: "", valorMaximo: "", percentualDesconto: "" });
                    setDescModalOpen(true);
                  }}><Plus className="mr-2 h-4 w-4" />Adicionar</Button>
                </div>
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo Classificação</TableHead>
                        <TableHead className="text-right">Valor Mínimo</TableHead>
                        <TableHead className="text-right">Valor Máximo</TableHead>
                        <TableHead className="text-right">% Desconto</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classificacaoDescontos.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Nenhuma faixa de desconto configurada.</TableCell></TableRow>
                      ) : classificacaoDescontos.map((cd) => (
                        <TableRow key={cd.id}>
                          <TableCell>{classificacaoTipos.find((t) => t.id === cd.classificacaoTipoId)?.descricao ?? cd.classificacaoTipoId}</TableCell>
                          <TableCell className="text-right">{cd.valorMinimo}</TableCell>
                          <TableCell className="text-right">{cd.valorMaximo}</TableCell>
                          <TableCell className="text-right">{cd.percentualDesconto}%</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => {
                                setEditingDesc(cd);
                                setDescForm({ classificacaoTipoId: cd.classificacaoTipoId, valorMinimo: String(cd.valorMinimo), valorMaximo: String(cd.valorMaximo), percentualDesconto: String(cd.percentualDesconto) });
                                setDescModalOpen(true);
                              }}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={async () => {
                                await classificacaoDescontoService.excluir(cd.id);
                                setClassificacaoDescontos((prev) => prev.filter((d) => d.id !== cd.id));
                                toast({ title: "Excluído", description: "Faixa de desconto removida." });
                              }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Classification modal */}
        {classModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setClassModalOpen(false)}>
            <div className="bg-background rounded-lg border p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold">{editingClass ? "Editar Classificação" : "Nova Classificação"}</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Tipo Classificação <span className="text-destructive">*</span></Label>
                  <Select value={classForm.classificacaoTipoId} onValueChange={(v) => setClassForm((f) => ({ ...f, classificacaoTipoId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>{classificacaoTipos.filter((t) => t.ativo).map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.descricao}</SelectItem>
                    ))}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Valor Padrão</Label>
                    <Input type="number" step="0.000001" value={classForm.valorPadrao} onChange={(e) => setClassForm((f) => ({ ...f, valorPadrao: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Limite Tolerância</Label>
                    <Input type="number" step="0.000001" value={classForm.limiteTolerancia} onChange={(e) => setClassForm((f) => ({ ...f, limiteTolerancia: e.target.value }))} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={classForm.ativo} onCheckedChange={(v) => setClassForm((f) => ({ ...f, ativo: v }))} />
                  <Label>Ativo</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setClassModalOpen(false)}>Cancelar</Button>
                <Button onClick={async () => {
                  if (!classForm.classificacaoTipoId || !editingId || !grupoId || !empresaAtual || !filialAtual) return;
                  await produtoClassificacaoService.salvar(
                    { id: editingClass?.id, produtoId: editingId, classificacaoTipoId: classForm.classificacaoTipoId, valorPadrao: Number(classForm.valorPadrao) || 0, limiteTolerancia: Number(classForm.limiteTolerancia) || 0, ativo: classForm.ativo },
                    { grupoId, empresaId: empresaAtual.id, filialId: filialAtual.id }
                  );
                  const updated = await produtoClassificacaoService.listarPorProduto(editingId);
                  setProdutoClassificacoes(updated);
                  setClassModalOpen(false);
                  toast({ title: "Sucesso", description: editingClass ? "Classificação atualizada." : "Classificação adicionada." });
                }}>Salvar</Button>
              </div>
            </div>
          </div>
        )}

        {/* Discount range modal */}
        {descModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setDescModalOpen(false)}>
            <div className="bg-background rounded-lg border p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold">{editingDesc ? "Editar Faixa de Desconto" : "Nova Faixa de Desconto"}</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Tipo Classificação <span className="text-destructive">*</span></Label>
                  <Select value={descForm.classificacaoTipoId} onValueChange={(v) => setDescForm((f) => ({ ...f, classificacaoTipoId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>{classificacaoTipos.filter((t) => t.ativo && produtoClassificacoes.some((pc) => pc.classificacaoTipoId === t.id)).map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.descricao}</SelectItem>
                    ))}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Valor Mín.</Label>
                    <Input type="number" step="0.000001" value={descForm.valorMinimo} onChange={(e) => setDescForm((f) => ({ ...f, valorMinimo: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Valor Máx.</Label>
                    <Input type="number" step="0.000001" value={descForm.valorMaximo} onChange={(e) => setDescForm((f) => ({ ...f, valorMaximo: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>% Desconto</Label>
                    <Input type="number" step="0.000001" value={descForm.percentualDesconto} onChange={(e) => setDescForm((f) => ({ ...f, percentualDesconto: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDescModalOpen(false)}>Cancelar</Button>
                <Button onClick={async () => {
                  if (!descForm.classificacaoTipoId || !editingId || !grupoId || !empresaAtual || !filialAtual) return;
                  await classificacaoDescontoService.salvar(
                    { id: editingDesc?.id, produtoId: editingId, classificacaoTipoId: descForm.classificacaoTipoId, valorMinimo: Number(descForm.valorMinimo) || 0, valorMaximo: Number(descForm.valorMaximo) || 0, percentualDesconto: Number(descForm.percentualDesconto) || 0 },
                    { grupoId, empresaId: empresaAtual.id, filialId: filialAtual.id }
                  );
                  const updated = await classificacaoDescontoService.listarPorProduto(editingId);
                  setClassificacaoDescontos(updated);
                  setDescModalOpen(false);
                  toast({ title: "Sucesso", description: editingDesc ? "Faixa atualizada." : "Faixa adicionada." });
                }}>Salvar</Button>
              </div>
            </div>
          </div>
        )}
      </CrudModal>

      {/* Cascade delete classification confirmation */}
      <AlertDialog open={!!deleteClassTarget} onOpenChange={(v) => !v && setDeleteClassTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Ao remover esta classificação, todos os descontos configurados para ela neste produto também serão excluídos. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteClassTarget || !editingId) return;
                await classificacaoDescontoService.excluirPorProdutoETipo(editingId, deleteClassTarget.classificacaoTipoId);
                await produtoClassificacaoService.excluir(deleteClassTarget.id);
                setProdutoClassificacoes((prev) => prev.filter((p) => p.id !== deleteClassTarget.id));
                setClassificacaoDescontos((prev) => prev.filter((d) => d.classificacaoTipoId !== deleteClassTarget.classificacaoTipoId));
                setDeleteClassTarget(null);
                toast({ title: "Excluído", description: "Classificação e descontos vinculados removidos." });
              }}
            >Confirmar exclusão</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente excluir o produto "
              {deleteTarget?.descricao}"? Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Recalc confirmation */}
      <AlertDialog open={confirmRecalc} onOpenChange={setConfirmRecalc}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Recalcular preços</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá recalcular custos e preços de todas as empresas
              ativas deste produto. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={recalcAll}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
