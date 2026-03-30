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
  matrizFilial: z.enum(["MATRIZ", "FILIAL"], { required_error: "Selecione o tipo" }),
  nomeRazao: z.string().min(3, "Mínimo 3 caracteres").max(200, "Máximo 200 caracteres"),
  cpfCnpj: z.string().min(1, "Obrigatório").max(18, "Máximo 18 caracteres"),
  ie: z.string().max(30, "Máximo 30 caracteres").optional(),
  email: z.string().max(320, "Máximo 320 caracteres").optional(),
  telefone: z.string().max(20, "Máximo 20 caracteres").optional(),
  cep: z.string().max(9, "Máximo 9 caracteres").optional(),
  logradouro: z.string().max(200, "Máximo 200 caracteres").optional(),
  numero: z.string().max(20, "Máximo 20 caracteres").optional(),
  complemento: z.string().max(100, "Máximo 100 caracteres").optional(),
  bairro: z.string().max(100, "Máximo 100 caracteres").optional(),
  cidade: z.string().max(100, "Máximo 100 caracteres").optional(),
  uf: z.string().length(2, "UF deve ter 2 caracteres"),
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
        return emp?.nome ?? row.empresaId;
      },
    },
    {
      key: "matrizFilial",
      header: "Tipo",
      render: (row) => (
        <Badge variant={row.matrizFilial === "MATRIZ" ? "default" : "outline"}>
          {row.matrizFilial}
        </Badge>
      ),
    },
    { key: "nomeRazao", header: "Nome/Razão Social" },
    { key: "cpfCnpj", header: "CPF/CNPJ" },
    { key: "cidade", header: "Cidade" },
    { key: "uf", header: "UF" },
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
      matrizFilial: "FILIAL",
      nomeRazao: "",
      cpfCnpj: "",
      ie: "",
      email: "",
      telefone: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      ativo: true,
    });
    setModalOpen(true);
  };

  const openEdit = (row: Filial) => {
    setEditingId(row.id);
    reset({
      empresaId: row.empresaId,
      matrizFilial: row.matrizFilial,
      nomeRazao: row.nomeRazao,
      cpfCnpj: row.cpfCnpj,
      ie: row.ie,
      email: row.email,
      telefone: row.telefone,
      cep: row.cep,
      logradouro: row.logradouro,
      numero: row.numero,
      complemento: row.complemento,
      bairro: row.bairro,
      cidade: row.cidade,
      uf: row.uf,
      ativo: row.ativo,
    });
    setModalOpen(true);
  };

  const onSave = handleSubmit(async (formData) => {
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
        ie: (formData.ie ?? "").trim(),
        email: (formData.email ?? "").trim(),
        telefone: (formData.telefone ?? "").trim(),
        cep: (formData.cep ?? "").trim(),
        logradouro: (formData.logradouro ?? "").trim(),
        numero: (formData.numero ?? "").trim(),
        complemento: (formData.complemento ?? "").trim(),
        bairro: (formData.bairro ?? "").trim(),
        cidade: (formData.cidade ?? "").trim(),
        uf: formData.uf.trim().toUpperCase(),
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
                <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
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
          {/* Empresa + Tipo */}
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
                      <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.empresaId && <p className="text-xs text-destructive">{errors.empresaId.message}</p>}
          </div>

          <div className="flex items-end gap-6">
            <div className="space-y-1.5">
              <Label>Tipo <span className="text-destructive">*</span></Label>
              <Controller
                name="matrizFilial"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MATRIZ">Matriz</SelectItem>
                      <SelectItem value="FILIAL">Filial</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.matrizFilial && <p className="text-xs text-destructive">{errors.matrizFilial.message}</p>}
            </div>
            <div className="flex items-center gap-2 pb-1">
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

          {/* Nome/Razão Social */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="nomeRazao">Nome/Razão Social <span className="text-destructive">*</span></Label>
            <Input id="nomeRazao" maxLength={200} {...register("nomeRazao")} />
            {errors.nomeRazao && <p className="text-xs text-destructive">{errors.nomeRazao.message}</p>}
          </div>

          {/* CPF/CNPJ + IE */}
          <div className="space-y-1.5">
            <Label htmlFor="cpfCnpj">CPF/CNPJ <span className="text-destructive">*</span></Label>
            <Input id="cpfCnpj" maxLength={18} {...register("cpfCnpj")} />
            {errors.cpfCnpj && <p className="text-xs text-destructive">{errors.cpfCnpj.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ie">Inscrição Estadual</Label>
            <Input id="ie" maxLength={30} {...register("ie")} />
          </div>

          {/* Email + Telefone */}
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" maxLength={320} {...register("email")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" maxLength={20} {...register("telefone")} />
          </div>

          {/* Endereço */}
          <div className="space-y-1.5">
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" maxLength={9} {...register("cep")} />
          </div>
          <div className="space-y-1.5">
            <Label>UF <span className="text-destructive">*</span></Label>
            <Controller
              name="uf"
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
            {errors.uf && <p className="text-xs text-destructive">{errors.uf.message}</p>}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="logradouro">Logradouro</Label>
            <Input id="logradouro" maxLength={200} {...register("logradouro")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="numero">Número</Label>
            <Input id="numero" maxLength={20} {...register("numero")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="complemento">Complemento</Label>
            <Input id="complemento" maxLength={100} {...register("complemento")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bairro">Bairro</Label>
            <Input id="bairro" maxLength={100} {...register("bairro")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" maxLength={100} {...register("cidade")} />
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
