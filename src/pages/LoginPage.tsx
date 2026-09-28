import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Sprout } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { session, carregando, entrar, cadastrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as { from?: string } | null)?.from || "/dashboard";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!carregando && session) navigate(destino, { replace: true });
  }, [carregando, session, destino, navigate]);

  async function handleEntrar(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !senha) {
      toast.error("Informe e-mail e senha.");
      return;
    }
    setEnviando(true);
    const { erro } = await entrar(email, senha);
    setEnviando(false);
    if (erro) toast.error(erro);
    else toast.success("Bem-vindo ao AgroERP.");
  }

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || senha.length < 6) {
      toast.error("Preencha nome, e-mail e uma senha com pelo menos 6 caracteres.");
      return;
    }
    setEnviando(true);
    const { erro } = await cadastrar(nome, email, senha);
    if (!erro) {
      const login = await entrar(email, senha);
      setEnviando(false);
      if (login.erro) {
        toast.success("Conta criada. Faça login para continuar.");
        return;
      }
      toast.success("Conta criada e acesso liberado.");
      return;
    }
    setEnviando(false);
    toast.error(erro);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sprout className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">AgroERP</h1>
          <p className="text-sm text-muted-foreground">Gestão integrada do agronegócio</p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Acesso ao sistema</CardTitle>
            <CardDescription>Entre com suas credenciais para continuar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="entrar">
              <TabsList className="mb-4 grid w-full grid-cols-2">
                <TabsTrigger value="entrar">Entrar</TabsTrigger>
                <TabsTrigger value="criar">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="entrar">
                <form onSubmit={handleEntrar} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" autoComplete="email" value={email}
                      onChange={(e) => setEmail(e.target.value)} placeholder="usuario@empresa.com.br" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha</Label>
                    <Input id="senha" type="password" autoComplete="current-password" value={senha}
                      onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
                  </div>
                  <Button type="submit" className="w-full" disabled={enviando}>
                    {enviando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="criar">
                <form onSubmit={handleCadastrar} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-novo">E-mail</Label>
                    <Input id="email-novo" type="email" autoComplete="email" value={email}
                      onChange={(e) => setEmail(e.target.value)} placeholder="usuario@empresa.com.br" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha-nova">Senha</Label>
                    <Input id="senha-nova" type="password" autoComplete="new-password" value={senha}
                      onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
                  </div>
                  <Button type="submit" className="w-full" disabled={enviando}>
                    {enviando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar conta
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    O primeiro usuário cadastrado recebe o perfil Administrador. Os demais entram como Consulta
                    até que um administrador altere o perfil.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
