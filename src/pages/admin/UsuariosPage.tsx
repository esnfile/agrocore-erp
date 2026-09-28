import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { catalogo, type PerfilAcesso } from "@/lib/services";

interface UsuarioLinha {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilAcesso;
  ativo: boolean;
  filiais_permitidas: string[];
}

const PERFIL_LABEL: Record<PerfilAcesso, string> = {
  ADMINISTRADOR: "Administrador",
  OPERADOR: "Operador",
  CONSULTA: "Consulta",
};

async function chamar(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("admin-usuarios", { body });
  if (error) {
    let msg = "Falha na operação.";
    try {
      const ctx = await (error as { context?: Response }).context?.json();
      msg = [ctx?.message, ...(ctx?.errors ?? [])].filter(Boolean).join(" ") || msg;
    } catch { /* mantém mensagem padrão */ }
    throw new Error(msg);
  }
  return data;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioLinha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<UsuarioLinha | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState<PerfilAcesso>("OPERADOR");
  const [ativo, setAtivo] = useState(true);
  const [filiais, setFiliais] = useState<string[]>([]);

  const todasFiliais = catalogo.filiais().filter((f) => f.deletadoEm === null);
  const empresas = catalogo.empresas();

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const r = await chamar({ acao: "listar" });
      setUsuarios(r.data ?? []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function abrirNovo() {
    setEditando(null);
    setNome(""); setEmail(""); setSenha(""); setPerfil("OPERADOR"); setAtivo(true);
    setFiliais(todasFiliais[0] ? [todasFiliais[0].id] : []);
    setAberto(true);
  }
  function abrirEdicao(u: UsuarioLinha) {
    setEditando(u);
    setNome(u.nome); setEmail(u.email); setSenha(""); setPerfil(u.perfil); setAtivo(u.ativo);
    setFiliais(u.filiais_permitidas ?? []);
    setAberto(true);
  }

  async function salvar() {
    if (filiais.length === 0) { toast.error("Vincule ao menos uma filial."); return; }
    const empresasPermitidas = Array.from(new Set(
      todasFiliais.filter((f) => filiais.includes(f.id)).map((f) => f.empresaId)
    ));
    setSalvando(true);
    try {
      if (editando) {
        await chamar({ acao: "atualizar", id: editando.id, perfil, ativo, filiaisPermitidas: filiais, empresasPermitidas });
        toast.success("Usuário atualizado.");
      } else {
        await chamar({
          acao: "criar", nome, email, senha, perfil, filiaisPermitidas: filiais, empresasPermitidas,
          empresaId: empresasPermitidas[0],
        });
        toast.success("Usuário criado. Informe a senha inicial ao usuário.");
      }
      setAberto(false);
      carregar();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  const nomeFilial = (id: string) => todasFiliais.find((f) => f.id === id)?.nomeRazao ?? id;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <PageHeader title="Gestão de Usuários" description="Somente o Administrador cria usuários, define perfil e vincula filiais." />
        <Button onClick={abrirNovo}><Plus className="mr-2 h-4 w-4" />Novo usuário</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {carregando ? (
            <div className="space-y-2 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : usuarios.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-10 text-muted-foreground">
              <Users className="h-8 w-8" /> Nenhum usuário cadastrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Filiais</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.nome}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell><Badge variant={u.perfil === "ADMINISTRADOR" ? "default" : "secondary"}>{PERFIL_LABEL[u.perfil]}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {(u.filiais_permitidas ?? []).length === 0 ? "—" : u.filiais_permitidas.map(nomeFilial).join(", ")}
                      </TableCell>
                      <TableCell><Badge variant={u.ativo ? "outline" : "destructive"}>{u.ativo ? "Ativo" : "Inativo"}</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => abrirEdicao(u)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="flex max-h-[90vh] flex-col">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar usuário" : "Novo usuário"}</DialogTitle>
            <DialogDescription>Perfil e filiais definem o que o usuário pode ver e fazer.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={nome} disabled={!!editando} onChange={(e) => setNome(e.target.value)} maxLength={150} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={email} disabled={!!editando} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
            </div>
            {!editando && (
              <div className="space-y-2">
                <Label>Senha inicial</Label>
                <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 8 caracteres" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Perfil</Label>
              <Select value={perfil} onValueChange={(v) => setPerfil(v as PerfilAcesso)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(PERFIL_LABEL) as PerfilAcesso[]).map((p) => (
                    <SelectItem key={p} value={p}>{PERFIL_LABEL[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filiais permitidas</Label>
              <div className="space-y-3 rounded-md border p-3">
                {empresas.map((emp) => {
                  const fs = todasFiliais.filter((f) => f.empresaId === emp.id);
                  if (fs.length === 0) return null;
                  return (
                    <div key={emp.id} className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground">{emp.nome}</p>
                      {fs.map((f) => (
                        <label key={f.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={filiais.includes(f.id)}
                            onCheckedChange={(c) => setFiliais((a) => c ? [...a, f.id] : a.filter((x) => x !== f.id))}
                          />
                          {f.nomeRazao}
                        </label>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
            {editando && (
              <div className="flex items-center gap-2">
                <Switch checked={ativo} onCheckedChange={setAtivo} id="ativo" />
                <Label htmlFor="ativo">Usuário ativo</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
