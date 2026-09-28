import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Sprout } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { session, carregando, entrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as { from?: string } | null)?.from || "/dashboard";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
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
                <p className="mt-4 text-xs text-muted-foreground">
                  Não tem acesso? Solicite ao Administrador do sistema.
                </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
