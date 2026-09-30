import { useEffect, useMemo, useState } from "react";
import { Loader2, ShieldCheck, Search } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { autorizacaoService, ROTULO_ACAO_SUPERVISIONADA, type RegistroAutorizacao } from "@/lib/services";

export default function LogAutorizacoesPage() {
  const [registros, setRegistros] = useState<RegistroAutorizacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");

  async function carregar() {
    setCarregando(true);
    try {
      const lista = await autorizacaoService.listarLog({
        de: de ? new Date(de + "T00:00:00").toISOString() : undefined,
        ate: ate ? new Date(ate + "T23:59:59").toISOString() : undefined,
      });
      setRegistros(lista);
    } catch (e: any) {
      toast.error(e.message ?? "Não foi possível carregar o log.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return registros;
    return registros.filter(
      (r) =>
        r.usuarioNome.toLowerCase().includes(termo) ||
        r.acao.toLowerCase().includes(termo) ||
        r.descricao.toLowerCase().includes(termo)
    );
  }, [registros, busca]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">Log de Autorizações</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="busca">Usuário, ação ou registro</Label>
            <Input id="busca" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pesquisar..." />
          </div>
          <div className="space-y-1">
            <Label htmlFor="de">De</Label>
            <Input id="de" type="date" value={de} onChange={(e) => setDe(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ate">Até</Label>
            <Input id="ate" type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
          </div>
          <div className="md:col-span-4">
            <Button onClick={carregar} disabled={carregando} size="sm">
              {carregando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Aplicar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {carregando ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : filtrados.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Nenhuma autorização registrada no período.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Justificativa</TableHead>
                  <TableHead>Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {new Date(r.criadoEm).toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-sm">{r.usuarioNome}</TableCell>
                    <TableCell className="text-sm">
                      {ROTULO_ACAO_SUPERVISIONADA[r.acao as keyof typeof ROTULO_ACAO_SUPERVISIONADA] ?? r.acao}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="text-muted-foreground">{r.registroTipo}</span>
                      {r.descricao ? ` — ${r.descricao}` : r.registroId ? ` — ${r.registroId.substring(0, 8)}` : ""}
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate text-sm" title={r.justificativa}>
                      {r.justificativa || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.resultado === "AUTORIZADO" ? "default" : "secondary"}>
                        {r.resultado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
