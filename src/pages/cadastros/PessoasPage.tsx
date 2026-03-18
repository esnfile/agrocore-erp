import { useEffect, useState, useCallback } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { CrudModal } from "@/components/CrudModal";
import { pessoaService, grupoPessoaService } from "@/lib/services";
import { useOrganization } from "@/contexts/OrganizationContext";
import type { Pessoa, GrupoPessoa } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ESTADOS_BRASILEIROS } from "@/lib/constants";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ---- Máscaras ----
function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function maskCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}
function maskTelefone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

const RELACOES = ["Cliente", "Produtor", "Fornecedor", "Parceiro", "Transportadora"] as const;

const enderecoSchema = z.object({
  id: z.string(),
  enderecoPadrao: z.boolean(),
  tipoEndereco: z.enum(["Residencial", "Comercial", "Outros"]),
  cep: z.string(),
  cidade: z.string(),
  estado: z.string(),
  endereco: z.string(),
  numero: z.string(),
  bairro: z.string(),
  referencia: z.string(),
});

const contatoSchema = z.object({
  id: z.string(),
  contatoPadrao: z.boolean(),
  tipoContato: z.enum(["Telefone", "WhatsApp", "Email", "Outros"]),
  descContatoPessoa: z.string().min(1, "Obrigatório"),
});

const schema = z
  .object({
    tipoPessoa: z.enum(["PF", "PJ"]),
    grupoPessoaId: z.string().min(1, "Selecione um grupo"),
    relacaoComercial: z.array(z.string()).min(1, "Selecione ao menos uma relação"),
    nomeRazao: z.string().min(3, "Mínimo 3 caracteres"),
    dataNascimentoAbertura: z.string().optional(),
    cpfCnpj: z.string().min(1, "Obrigatório"),
    rgIe: z.string().optional(),
    nomeFantasia: z.string().optional(),
    sexo: z.string().optional(),
    ativo: z.boolean(),
    enderecos: z.array(enderecoSchema),
    contatos: z.array(contatoSchema),
  })
  .refine(
    (data) => {
      if (data.tipoPessoa === "PF" && (!data.sexo || data.sexo === "")) return false;
      return true;
    },
    { message: "Sexo é obrigatório para Pessoa Física", path: ["sexo"] }
  );

type FormData = z.infer<typeof schema>;

export default function PessoasPage() {
  const { grupoAtual, empresaAtual, filialAtual } = useOrganization();
  const [data, setData] = useState<Pessoa[]>([]);
  const [gruposPessoa, setGruposPessoa] = useState<GrupoPessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Pessoa | null>(null);
  const [expandedEnderecos, setExpandedEnderecos] = useState<Set<number>>(new Set());

  // Filtros
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroCpfCnpj, setFiltroCpfCnpj] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroRelacao, setFiltroRelacao] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const {
    fields: enderecoFields,
    append: appendEndereco,
    remove: removeEndereco,
    update: updateEndereco,
  } = useFieldArray({ control, name: "enderecos" });

  const {
    fields: contatoFields,
    append: appendContato,
    remove: removeContato,
    update: updateContato,
  } = useFieldArray({ control, name: "contatos" });

  const tipoPessoa = watch("tipoPessoa") ?? "PF";
  const relacaoComercial = watch("relacaoComercial") ?? [];

  const columns: Column<Pessoa>[] = [
    { key: "nomeRazao", header: "Nome/Razão" },
    {
      key: "tipoPessoa",
      header: "Tipo",
      render: (row) => (
        <Badge variant="outline">{row.tipoPessoa === "PF" ? "Física" : "Jurídica"}</Badge>
      ),
    },
    { key: "cpfCnpj", header: "CPF/CNPJ" },
    {
      key: "relacaoComercial",
      header: "Relação Comercial",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.relacaoComercial.map((r) => (
            <Badge key={r} variant="secondary" className="text-xs">
              {r}
            </Badge>
          ))}
        </div>
      ),
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

  const loadGruposPessoa = useCallback(async () => {
    if (!empresaAtual || !filialAtual) return;
    const list = await grupoPessoaService.listar(empresaAtual.id, filialAtual.id);
    setGruposPessoa(list);
  }, [empresaAtual, filialAtual]);

  const loadData = useCallback(async () => {
    if (!empresaAtual || !filialAtual) return;
    setLoading(true);
    const list = await pessoaService.listar(empresaAtual.id, filialAtual.id, {
      nome: filtroNome || undefined,
      cpfCnpj: filtroCpfCnpj || undefined,
      tipoPessoa: filtroTipo || undefined,
      relacaoComercial: filtroRelacao || undefined,
      status: filtroStatus || undefined,
    });
    setData(list);
    setLoading(false);
  }, [empresaAtual, filialAtual, filtroNome, filtroCpfCnpj, filtroTipo, filtroRelacao, filtroStatus]);

  useEffect(() => {
    loadGruposPessoa();
    loadData();
  }, [empresaAtual, filialAtual]);

  const handleFiltrar = () => loadData();
  const handleLimpar = () => {
    setFiltroNome("");
    setFiltroCpfCnpj("");
    setFiltroTipo("");
    setFiltroRelacao("");
    setFiltroStatus("");
  };

  useEffect(() => {
    if (!filtroNome && !filtroCpfCnpj && !filtroTipo && !filtroRelacao && !filtroStatus) {
      loadData();
    }
  }, [filtroNome, filtroCpfCnpj, filtroTipo, filtroRelacao, filtroStatus]);

  const emptyForm: FormData = {
    tipoPessoa: "PF",
    grupoPessoaId: "",
    relacaoComercial: [],
    nomeRazao: "",
    dataNascimentoAbertura: "",
    cpfCnpj: "",
    rgIe: "",
    nomeFantasia: "",
    sexo: "",
    ativo: true,
    enderecos: [],
    contatos: [],
  };

  const openNew = () => {
    setEditingId(null);
    reset(emptyForm);
    setExpandedEnderecos(new Set());
    setModalOpen(true);
  };

  const openEdit = (row: Pessoa) => {
    setEditingId(row.id);
    reset({
      tipoPessoa: row.tipoPessoa,
      grupoPessoaId: row.grupoPessoaId,
      relacaoComercial: row.relacaoComercial,
      nomeRazao: row.nomeRazao,
      dataNascimentoAbertura: row.dataNascimentoAbertura,
      cpfCnpj: row.cpfCnpj,
      rgIe: row.rgIe,
      nomeFantasia: row.nomeFantasia,
      sexo: row.sexo,
      ativo: row.ativo,
      enderecos: row.enderecos,
      contatos: row.contatos,
    });
    setExpandedEnderecos(new Set());
    setModalOpen(true);
  };

  const onSave = handleSubmit(async (formData) => {
    if (!grupoAtual || !empresaAtual || !filialAtual) return;

    const emailContatos = formData.contatos.filter((c) => c.tipoContato === "Email");
    for (const ec of emailContatos) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ec.descContatoPessoa)) {
        toast({ title: "E-mail inválido", description: `O contato "${ec.descContatoPessoa}" não é um e-mail válido.`, variant: "destructive" });
        return;
      }
    }

    const duplicado = await pessoaService.cpfCnpjExiste(
      formData.cpfCnpj.trim(),
      empresaAtual.id,
      editingId ?? undefined
    );
    if (duplicado) {
      toast({
        title: "CPF/CNPJ duplicado",
        description: "Já existe uma pessoa com este CPF/CNPJ nesta empresa.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await pessoaService.salvar(
        {
          nomeRazao: formData.nomeRazao.trim(),
          cpfCnpj: formData.cpfCnpj.trim(),
          rgIe: (formData.rgIe ?? "").trim(),
          nomeFantasia: (formData.nomeFantasia ?? "").trim(),
          sexo: (formData.sexo ?? "") as "" | "Masculino" | "Feminino",
          tipoPessoa: formData.tipoPessoa,
          grupoPessoaId: formData.grupoPessoaId,
          relacaoComercial: formData.relacaoComercial,
          dataNascimentoAbertura: formData.dataNascimentoAbertura ?? "",
          ativo: formData.ativo,
          enderecos: formData.enderecos.map((e) => ({
            id: e.id,
            enderecoPadrao: e.enderecoPadrao,
            tipoEndereco: e.tipoEndereco,
            cep: e.cep,
            cidade: e.cidade,
            estado: e.estado,
            endereco: e.endereco,
            numero: e.numero,
            bairro: e.bairro,
            referencia: e.referencia,
            criadoEm: e.criadoEm ?? new Date().toISOString(),
            criadoPor: e.criadoPor ?? "system",
            atualizadoEm: new Date().toISOString(),
            atualizadoPor: "system",
          })),
          contatos: formData.contatos.map((c) => ({
            id: c.id,
            contatoPadrao: c.contatoPadrao,
            tipoContato: c.tipoContato,
            descContatoPessoa: c.descContatoPessoa,
            criadoEm: c.criadoEm ?? new Date().toISOString(),
            criadoPor: c.criadoPor ?? "system",
            atualizadoEm: new Date().toISOString(),
            atualizadoPor: "system",
          })),
          id: editingId ?? undefined,
        },
        { grupoId: grupoAtual.id, empresaId: empresaAtual.id, filialId: filialAtual.id }
      );
      toast({
        title: editingId ? "Pessoa atualizada" : "Pessoa criada",
        description: `${formData.nomeRazao.trim()} salva com sucesso.`,
      });
      setModalOpen(false);
      loadData();
    } catch {
      toast({ title: "Erro", description: "Não foi possível salvar.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await pessoaService.excluir(deleteTarget.id);
    toast({ title: "Pessoa excluída", description: `${deleteTarget.nomeRazao} foi removida.` });
    setDeleteTarget(null);
    loadData();
  };

  const toggleEnderecoPadrao = (index: number) => {
    enderecoFields.forEach((f, i) => {
      if (i === index) {
        updateEndereco(i, { ...f, enderecoPadrao: true });
      } else if (f.enderecoPadrao) {
        updateEndereco(i, { ...f, enderecoPadrao: false });
      }
    });
  };

  const toggleContatoPadrao = (index: number) => {
    contatoFields.forEach((f, i) => {
      if (i === index) {
        updateContato(i, { ...f, contatoPadrao: true });
      } else if (f.contatoPadrao) {
        updateContato(i, { ...f, contatoPadrao: false });
      }
    });
  };

  const toggleRelacao = (rel: string) => {
    const current = relacaoComercial;
    if (current.includes(rel)) {
      setValue("relacaoComercial", current.filter((r) => r !== rel), { shouldValidate: true });
    } else {
      setValue("relacaoComercial", [...current, rel], { shouldValidate: true });
    }
  };

  const toggleEnderecoExpanded = (index: number) => {
    setExpandedEnderecos((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const addEndereco = () => {
    const newIndex = enderecoFields.length;
    appendEndereco({
      id: `end${Date.now()}`,
      enderecoPadrao: enderecoFields.length === 0,
      tipoEndereco: "Residencial",
      cep: "",
      cidade: "",
      estado: "",
      endereco: "",
      numero: "",
      bairro: "",
      referencia: "",
    });
    setExpandedEnderecos((prev) => new Set(prev).add(newIndex));
  };

  const removeEnderecoAt = (index: number) => {
    removeEndereco(index);
    setExpandedEnderecos((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  };

  // Helper to get contact description label
  const getContatoLabel = (tipo: string) => {
    if (tipo === "Telefone" || tipo === "WhatsApp") return "Telefone";
    if (tipo === "Email") return "E-mail";
    return "Descrição";
  };

  const getContatoPlaceholder = (tipo: string) => {
    if (tipo === "Telefone" || tipo === "WhatsApp") return "(00) 00000-0000";
    if (tipo === "Email") return "email@exemplo.com";
    return "Descrição";
  };

  return (
    <>
      <PageHeader title="Pessoas" description="Gerencie o cadastro de pessoas" />

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Nome/Razão</Label>
          <Input className="w-[180px]" placeholder="Buscar..." value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">CPF/CNPJ</Label>
          <Input className="w-[160px]" placeholder="Buscar..." value={filtroCpfCnpj} onChange={(e) => setFiltroCpfCnpj(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Tipo Pessoa</Label>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PF">Física</SelectItem>
              <SelectItem value="PJ">Jurídica</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Relação</Label>
          <Select value={filtroRelacao} onValueChange={setFiltroRelacao}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              {RELACOES.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={handleFiltrar}>
          <Search className="mr-1 h-4 w-4" /> Filtrar
        </Button>
        <Button size="sm" variant="outline" onClick={handleLimpar}>
          <X className="mr-1 h-4 w-4" /> Limpar
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchPlaceholder="Buscar pessoa..."
        onNew={openNew}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      <CrudModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar Pessoa" : "Nova Pessoa"}
        saving={saving}
        onSave={onSave}
        maxWidth="sm:max-w-4xl"
      >
        <div className="space-y-5">
          {/* ===== STATUS NO TOPO ===== */}
          <div className="flex items-center justify-end gap-2">
            <Label htmlFor="ativo" className="text-sm">Ativo</Label>
            <Controller
              name="ativo"
              control={control}
              render={({ field }) => (
                <Switch id="ativo" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          {/* ===== TABS ===== */}
          <Tabs defaultValue="dados-gerais" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="dados-gerais">Dados Gerais</TabsTrigger>
              <TabsTrigger value="enderecos">Endereços</TabsTrigger>
              <TabsTrigger value="contatos">Contatos</TabsTrigger>
            </TabsList>

            {/* ===== ABA 1 - DADOS GERAIS ===== */}
            <TabsContent value="dados-gerais">
              <div className="space-y-5 pt-2">
                {/* L1: Tipo Pessoa + Relação Comercial */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Tipo de Pessoa <span className="text-destructive">*</span></Label>
                    <Controller
                      name="tipoPessoa"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4 pt-1">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="PF" id="pf" />
                            <Label htmlFor="pf" className="font-normal cursor-pointer">Física</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="PJ" id="pj" />
                            <Label htmlFor="pj" className="font-normal cursor-pointer">Jurídica</Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Relação Comercial <span className="text-destructive">*</span></Label>
                    <div className="flex flex-wrap gap-3 pt-1">
                      {RELACOES.map((rel) => (
                        <label key={rel} className="flex items-center gap-1.5 cursor-pointer text-sm">
                          <Checkbox
                            checked={relacaoComercial.includes(rel)}
                            onCheckedChange={() => toggleRelacao(rel)}
                          />
                          {rel}
                        </label>
                      ))}
                    </div>
                    {errors.relacaoComercial && <p className="text-xs text-destructive">{errors.relacaoComercial.message}</p>}
                  </div>
                </div>

                {/* L2: Grupo de Pessoas */}
                <div className="space-y-1.5">
                  <Label>Grupo de Pessoas <span className="text-destructive">*</span></Label>
                  <Controller
                    name="grupoPessoaId"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {gruposPessoa.map((gp) => (
                            <SelectItem key={gp.id} value={gp.id}>{gp.descGrupoPessoa}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.grupoPessoaId && <p className="text-xs text-destructive">{errors.grupoPessoaId.message}</p>}
                </div>

                {/* L3: Nome/Razão Social */}
                <div className="space-y-1.5">
                  <Label htmlFor="nomeRazao">
                    {tipoPessoa === "PF" ? "Nome" : "Razão Social"} <span className="text-destructive">*</span>
                  </Label>
                  <Input id="nomeRazao" maxLength={200} {...register("nomeRazao")} />
                  {errors.nomeRazao && <p className="text-xs text-destructive">{errors.nomeRazao.message}</p>}
                </div>

                {/* L4: CPF/CNPJ + RG/IE + Data (posição fixa, 3 colunas) */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="cpfCnpj">
                      {tipoPessoa === "PF" ? "CPF" : "CNPJ"} <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      name="cpfCnpj"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="cpfCnpj"
                          value={field.value}
                          onChange={(e) => {
                            const masked = tipoPessoa === "PF" ? maskCPF(e.target.value) : maskCNPJ(e.target.value);
                            field.onChange(masked);
                          }}
                          placeholder={tipoPessoa === "PF" ? "000.000.000-00" : "00.000.000/0000-00"}
                        />
                      )}
                    />
                    {errors.cpfCnpj && <p className="text-xs text-destructive">{errors.cpfCnpj.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rgIe">RG/IE</Label>
                    <Input id="rgIe" maxLength={20} {...register("rgIe")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dataNascimentoAbertura">
                      {tipoPessoa === "PF" ? "Data Nascimento" : "Data Abertura"}
                    </Label>
                    <Input id="dataNascimentoAbertura" type="date" {...register("dataNascimentoAbertura")} />
                  </div>
                </div>

                {/* L5: Campos condicionais */}
                {tipoPessoa === "PF" && (
                  <div className="space-y-1.5 max-w-xs">
                    <Label>Sexo <span className="text-destructive">*</span></Label>
                    <Controller
                      name="sexo"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Masculino">Masculino</SelectItem>
                            <SelectItem value="Feminino">Feminino</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.sexo && <p className="text-xs text-destructive">{errors.sexo.message}</p>}
                  </div>
                )}
                {tipoPessoa === "PJ" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                    <Input id="nomeFantasia" maxLength={200} {...register("nomeFantasia")} />
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ===== ABA 2 - ENDEREÇOS ===== */}
            <TabsContent value="enderecos">
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Endereços</h3>
                  <Button type="button" size="sm" variant="outline" onClick={addEndereco}>
                    <Plus className="mr-1 h-4 w-4" /> Adicionar Endereço
                  </Button>
                </div>

                {enderecoFields.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum endereço cadastrado.</p>
                )}

                <div className="space-y-3">
                  {enderecoFields.map((field, index) => {
                    const isExpanded = expandedEnderecos.has(index);
                    const tipoEnd = watch(`enderecos.${index}.tipoEndereco`);
                    const enderecoRua = watch(`enderecos.${index}.endereco`);
                    const numeroEnd = watch(`enderecos.${index}.numero`);
                    const cidadeEnd = watch(`enderecos.${index}.cidade`);
                    const estadoEnd = watch(`enderecos.${index}.estado`);
                    const isPadrao = watch(`enderecos.${index}.enderecoPadrao`);

                    return (
                      <Collapsible
                        key={field.id}
                        open={isExpanded}
                        onOpenChange={() => toggleEnderecoExpanded(index)}
                      >
                        <div className="rounded-lg border">
                          {/* Header do card */}
                          <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <CollapsibleTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                              </CollapsibleTrigger>
                              <div className="flex items-center gap-2 min-w-0 flex-nowrap">
                                <Badge variant="outline" className="text-xs flex-shrink-0">{tipoEnd || "—"}</Badge>
                                <span className="text-sm text-muted-foreground truncate">
                                  {[
                                    [enderecoRua, numeroEnd].filter(Boolean).join(", "),
                                    cidadeEnd,
                                    estadoEnd
                                  ].filter(Boolean).join(" / ") || "Novo endereço"}
                                </span>
                                {isPadrao && (
                                  <Badge variant="default" className="text-xs flex-shrink-0">Padrão</Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 flex-shrink-0"
                              onClick={(e) => { e.stopPropagation(); removeEnderecoAt(index); }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>

                          {/* Conteúdo expandido */}
                          <CollapsibleContent>
                            <div className="px-4 pb-4 space-y-3 border-t pt-3">
                              {/* Padrão + Tipo */}
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs">Padrão</Label>
                                  <Switch
                                    checked={field.enderecoPadrao}
                                    onCheckedChange={() => toggleEnderecoPadrao(index)}
                                  />
                                </div>
                                <div className="space-y-1 flex-1 max-w-[200px]">
                                  <Label className="text-xs">Tipo Endereço</Label>
                                  <Controller
                                    name={`enderecos.${index}.tipoEndereco`}
                                    control={control}
                                    render={({ field: f }) => (
                                      <Select value={f.value} onValueChange={f.onChange}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Residencial">Residencial</SelectItem>
                                          <SelectItem value="Comercial">Comercial</SelectItem>
                                          <SelectItem value="Outros">Outros</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}
                                  />
                                </div>
                              </div>

                              {/* CEP + Cidade + Estado */}
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">CEP</Label>
                                  <Input maxLength={10} {...register(`enderecos.${index}.cep`)} />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Cidade</Label>
                                  <Input maxLength={100} {...register(`enderecos.${index}.cidade`)} />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Estado (UF)</Label>
                                  <Controller
                                    name={`enderecos.${index}.estado`}
                                    control={control}
                                    render={({ field: f }) => (
                                      <Select value={f.value} onValueChange={f.onChange}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="UF" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {ESTADOS_BRASILEIROS.map((e) => (
                                            <SelectItem key={e.sigla} value={e.sigla}>{e.sigla}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  />
                                </div>
                              </div>

                              {/* Endereço + Número */}
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="space-y-1 sm:col-span-2">
                                  <Label className="text-xs">Endereço</Label>
                                  <Input maxLength={150} {...register(`enderecos.${index}.endereco`)} />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Número</Label>
                                  <Input maxLength={20} {...register(`enderecos.${index}.numero`)} />
                                </div>
                              </div>

                              {/* Bairro + Referência */}
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">Bairro</Label>
                                  <Input maxLength={70} {...register(`enderecos.${index}.bairro`)} />
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                  <Label className="text-xs">Referência</Label>
                                  <Input maxLength={150} {...register(`enderecos.${index}.referencia`)} />
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* ===== ABA 3 - CONTATOS ===== */}
            <TabsContent value="contatos">
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Contatos</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      appendContato({
                        id: `ct${Date.now()}`,
                        contatoPadrao: contatoFields.length === 0,
                        tipoContato: "Telefone",
                        descContatoPessoa: "",
                      })
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" /> Adicionar Contato
                  </Button>
                </div>

                {contatoFields.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum contato cadastrado.</p>
                )}


                <div className="space-y-2">
                  {contatoFields.map((field, index) => {
                    const tipoContato = watch(`contatos.${index}.tipoContato`);
                    const isTel = tipoContato === "Telefone" || tipoContato === "WhatsApp";

                    return (
                      <div key={field.id} className="grid grid-cols-1 sm:grid-cols-[60px_1fr_1fr_40px] gap-3 items-start rounded-lg border p-3 sm:p-2">
                        {/* Padrão */}
                        <div className="space-y-1">
                          <Label className="text-xs">Padrão</Label>
                          <Switch
                            checked={field.contatoPadrao}
                            onCheckedChange={() => toggleContatoPadrao(index)}
                          />
                        </div>

                        {/* Tipo */}
                        <div className="space-y-1">
                          <Label className="text-xs">Tipo</Label>
                          <Controller
                            name={`contatos.${index}.tipoContato`}
                            control={control}
                            render={({ field: f }) => (
                              <Select value={f.value} onValueChange={f.onChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Telefone">Telefone</SelectItem>
                                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                  <SelectItem value="Email">Email</SelectItem>
                                  <SelectItem value="Outros">Outros</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        {/* Descrição dinâmica */}
                        <div className="space-y-1">
                          <Label className="text-xs">
                            {getContatoLabel(tipoContato)} <span className="text-destructive">*</span>
                          </Label>
                          <Controller
                            name={`contatos.${index}.descContatoPessoa`}
                            control={control}
                            render={({ field: f }) => (
                              <Input
                                value={f.value}
                                onChange={(e) => {
                                  const val = isTel ? maskTelefone(e.target.value) : e.target.value;
                                  f.onChange(val);
                                }}
                                placeholder={getContatoPlaceholder(tipoContato)}
                              />
                            )}
                          />
                          {errors.contatos?.[index]?.descContatoPessoa && (
                            <p className="text-xs text-destructive">{errors.contatos[index]?.descContatoPessoa?.message}</p>
                          )}
                        </div>

                        {/* Excluir */}
                        <div className="flex items-center sm:justify-center sm:pt-1">
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeContato(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CrudModal>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente excluir esta pessoa? Esta ação não poderá ser desfeita.
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
    </>
  );
}
