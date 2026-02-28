import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { CrudModal } from "@/components/CrudModal";
import { filialService, empresaService } from "@/lib/services";
import type { Filial, Empresa } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
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

const schema = z.object({
  empresaId: z.string().min(1, "Selecione uma empresa"),
  nomeRazao: z.string().min(3, "Mínimo 3 caracteres"),
  cpfCnpj: z.string().min(1, "Obrigatório"),
  inscricaoEstadual: z.string().optional(),
  endereco: z.string().optional(),
  numeroKm: z.string().optional(),
  bairro: z.string().optional(),
  cep: z.string().max(10, "Máximo 10 caracteres").optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2, "UF deve ter 2 caracteres"),
  ativo: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function FiliaisPage() {
  const [data, setData] = useState<Filial[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Filial | null>(null);

  // Filtros
  const [filtroEmpresa, setFiltroEmpresa] = useState("");
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroCpfCnpj, setFiltroCpfCnpj] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const columns: Column<Filial>[] = [
    {
      key: "empresaId",
      header: "Empresa",
      render: (row) => {
        const emp = empresas.find((e) => e.id === row.empresaId);
        return emp?.nomeFantasia ?? row.empresaId;
      },
    },
    { key: "nomeRazao", header: "Nome/Razão Social" },
    { key: "cpfCnpj", header: "CPF/CNPJ" },
    { key: "cidade", header: "Cidade" },
    { key: "estado", header: "Estado" },
    {
      key: "ativo",
      header: "Ativo",
      render: (row) => (
        <Badge variant={row.ativo ? "default" : "secondary"}>
          {row.ativo ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
  ];

  const loadEmpresas = async () => {
    const list = await empresaService.listar();
    setEmpresas(list);
  };

  const loadData = async () => {
    setLoading(true);
    let list: Filial[];
    if (filtroEmpresa) {
      list = await filialService.listarPorEmpresa(filtroEmpresa);
    } else {
      list = await filialService.listar();
    }
    if (filtroNome) {
      const term = filtroNome.toLowerCase();
      list = list.filter((f) => f.nomeRazao.toLowerCase().includes(term));
    }
    if (filtroCpfCnpj) {
      const term = filtroCpfCnpj.toLowerCase();
      list = list.filter((f) => f.cpfCnpj.toLowerCase().includes(term));
    }
    setData(list);
    setLoading(false);
  };

  useEffect(() => {
    loadEmpresas();
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const handleFiltrar = () => loadData();

  const handleLimpar = () => {
    setFiltroEmpresa("");
    setFiltroNome("");
    setFiltroCpfCnpj("");
    // Reload sem filtros
    setLoading(true);
    filialService.listar().then((list) => {
      setData(list);
      setLoading(false);
    });
  };

  const openNew = () => {
    setEditingId(null);
    reset({
      empresaId: filtroEmpresa || "",
      nomeRazao: "",
      cpfCnpj: "",
      inscricaoEstadual: "",
      endereco: "",
      numeroKm: "",
      bairro: "",
      cep: "",
      cidade: "",
      estado: "",
      ativo: true,
    });
    setModalOpen(true);
  };

  const openEdit = (row: Filial) => {
    setEditingId(row.id);
    reset({
      empresaId: row.empresaId,
      nomeRazao: row.nomeRazao,
      cpfCnpj: row.cpfCnpj,
      inscricaoEstadual: row.inscricaoEstadual,
      endereco: row.endereco,
      numeroKm: row.numeroKm,
      bairro: row.bairro,
      cep: row.cep,
      cidade: row.cidade,
      estado: row.estado,
      ativo: row.ativo,
    });
    setModalOpen(true);
  };

  const onSave = handleSubmit(async (formData) => {
    // Verificar duplicidade CPF/CNPJ na mesma empresa
    const duplicado = await filialService.cpfCnpjExiste(
      formData.cpfCnpj.trim(),
      formData.empresaId,
      editingId ?? undefined
    );
    if (duplicado) {
      toast({
        title: "CPF/CNPJ duplicado",
        description: "Já existe uma filial com este CPF/CNPJ nesta empresa.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await filialService.salvar({
        ...formData,
        nomeRazao: formData.nomeRazao.trim(),
        cpfCnpj: formData.cpfCnpj.trim(),
        inscricaoEstadual: (formData.inscricaoEstadual ?? "").trim(),
        endereco: (formData.endereco ?? "").trim(),
        numeroKm: (formData.numeroKm ?? "").trim(),
        bairro: (formData.bairro ?? "").trim(),
        cep: (formData.cep ?? "").trim(),
        cidade: (formData.cidade ?? "").trim(),
        estado: formData.estado.trim().toUpperCase(),
        id: editingId ?? undefined,
      });
      toast({
        title: editingId ? "Filial atualizada" : "Filial criada",
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
    const temMovimentacoes = await filialService.possuiMovimentacoes(deleteTarget.id);
    if (temMovimentacoes) {
      toast({
        title: "Exclusão bloqueada",
        description: "Não é possível excluir uma filial que possui movimentações vinculadas.",
        variant: "destructive",
      });
      setDeleteTarget(null);
      return;
    }
    await filialService.excluir(deleteTarget.id);
    toast({ title: "Filial excluída", description: `${deleteTarget.nomeRazao} foi removida.` });
    setDeleteTarget(null);
    loadData();
  };

  return (
    <>
      <PageHeader title="Filiais" description="Gerencie as filiais das empresas" />

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Empresa</Label>
          <Select value={filtroEmpresa} onValueChange={setFiltroEmpresa}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Todas as empresas" />
            </SelectTrigger>
            <SelectContent>
              {empresas.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.nomeFantasia}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Nome/Razão Social</Label>
          <Input
            className="w-[200px]"
            placeholder="Buscar..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">CPF/CNPJ</Label>
          <Input
            className="w-[180px]"
            placeholder="Buscar..."
            value={filtroCpfCnpj}
            onChange={(e) => setFiltroCpfCnpj(e.target.value)}
          />
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
        searchPlaceholder="Buscar filial..."
        onNew={openNew}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      <CrudModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar Filial" : "Nova Filial"}
        saving={saving}
        onSave={onSave}
        maxWidth="sm:max-w-4xl"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Linha 1 — Empresa + Ativo */}
          <div className="space-y-1.5">
            <Label>Empresa <span className="text-destructive">*</span></Label>
            <Controller
              name="empresaId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.nomeFantasia}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.empresaId && <p className="text-xs text-destructive">{errors.empresaId.message}</p>}
          </div>

          <div className="space-y-1.5 flex items-end gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="ativo">Ativo</Label>
              <Controller
                name="ativo"
                control={control}
                render={({ field }) => (
                  <Switch id="ativo" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
          </div>

          {/* Linha 2 — Nome/Razão Social (full width) */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="nomeRazao">Nome/Razão Social <span className="text-destructive">*</span></Label>
            <Input id="nomeRazao" maxLength={200} {...register("nomeRazao")} />
            {errors.nomeRazao && <p className="text-xs text-destructive">{errors.nomeRazao.message}</p>}
          </div>

          {/* Linha 3 — CPF/CNPJ + IE */}
          <div className="space-y-1.5">
            <Label htmlFor="cpfCnpj">CPF/CNPJ <span className="text-destructive">*</span></Label>
            <Input id="cpfCnpj" maxLength={20} {...register("cpfCnpj")} />
            {errors.cpfCnpj && <p className="text-xs text-destructive">{errors.cpfCnpj.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
            <Input id="inscricaoEstadual" maxLength={30} {...register("inscricaoEstadual")} />
          </div>

          {/* Linha 4 — Endereço + Número/KM */}
          <div className="space-y-1.5">
            <Label htmlFor="endereco">Endereço</Label>
            <Input id="endereco" maxLength={150} {...register("endereco")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="numeroKm">Número/KM</Label>
            <Input id="numeroKm" maxLength={20} {...register("numeroKm")} />
          </div>

          {/* Linha 5 — Bairro + CEP */}
          <div className="space-y-1.5">
            <Label htmlFor="bairro">Bairro</Label>
            <Input id="bairro" maxLength={70} {...register("bairro")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" maxLength={10} {...register("cep")} />
            {errors.cep && <p className="text-xs text-destructive">{errors.cep.message}</p>}
          </div>

          {/* Linha 6 — Cidade + Estado */}
          <div className="space-y-1.5">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" maxLength={100} {...register("cidade")} />
          </div>
          <div className="space-y-1.5">
            <Label>Estado (UF) <span className="text-destructive">*</span></Label>
            <Controller
              name="estado"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_BRASILEIROS.map((e) => (
                      <SelectItem key={e.sigla} value={e.sigla}>{e.sigla}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.estado && <p className="text-xs text-destructive">{errors.estado.message}</p>}
          </div>
        </div>
      </CrudModal>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente excluir esta filial? Esta ação não poderá ser desfeita.
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
