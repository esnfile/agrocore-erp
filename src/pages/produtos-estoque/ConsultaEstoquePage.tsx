import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useOrganization } from "@/contexts/OrganizationContext";
import { estoqueService, pontoEstoqueService } from "@/lib/services";
import {
  produtos as mockProdutos,
  unidadesMedida as mockUnidades,
} from "@/lib/mock-data";
import type { Estoque, PontoEstoque } from "@/lib/mock-data";

export default function ConsultaEstoquePage() {
  const { empresaAtual, filialAtual } = useOrganization();
  const selectedEmpresa = empresaAtual?.id ?? null;
  const selectedFilial = filialAtual?.id ?? null;

  const [estoques, setEstoques] = useState<Estoque[]>([]);
  const [pontos, setPontos] = useState<PontoEstoque[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroProduto, setFiltroProduto] = useState<string>("__all__");
  const [filtroPonto, setFiltroPonto] = useState<string>("__all__");

  const produtosAtivos = useMemo(
    () => mockProdutos.filter((p) => p.deletadoEm === null && p.empresaId === selectedEmpresa),
    [selectedEmpresa]
  );

  useEffect(() => {
    if (!selectedEmpresa || !selectedFilial) { setEstoques([]); setPontos([]); setLoading(false); return; }
    setLoading(true);
    Promise.all([
      estoqueService.listarPorEmpresaFilial(selectedEmpresa, selectedFilial),
      pontoEstoqueService.listar(selectedEmpresa, selectedFilial),
    ]).then(([estList, ptList]) => {
      setEstoques(estList);
      setPontos(ptList);
      setLoading(false);
    });
  }, [selectedEmpresa, selectedFilial]);

  const filteredEstoques = useMemo(() => {
    let list = estoques;
    if (filtroProduto && filtroProduto !== "__all__") list = list.filter((e) => e.produtoId === filtroProduto);
    if (filtroPonto && filtroPonto !== "__all__") list = list.filter((e) => e.pontoEstoqueId === filtroPonto);
    return list;
  }, [estoques, filtroProduto, filtroPonto]);

  const getNomeProduto = (id: string) => mockProdutos.find((p) => p.id === id)?.descricao ?? id;
  const getNomePonto = (id: string) => pontos.find((p) => p.id === id)?.descricao ?? id;
  const getUnidadeBaseProduto = (produtoId: string) => {
    const produto = mockProdutos.find((p) => p.id === produtoId);
    if (!produto) return "";
    return getCodigoUnidadeBase(produto.tipoUnidade);
  };

  if (!selectedEmpresa || !selectedFilial) {
    return (
      <>
        <PageHeader title="Consulta de Estoque" description="Visualizar saldos consolidados por produto e ponto" />
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Selecione uma Empresa e Filial para consultar.
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Consulta de Estoque" description="Visualizar saldos consolidados por produto e ponto" />

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Produto</Label>
              <Select value={filtroProduto} onValueChange={setFiltroProduto}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todos</SelectItem>
                  {produtosAtivos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.descricao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Ponto de Estoque</Label>
              <Select value={filtroPonto} onValueChange={setFiltroPonto}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todos</SelectItem>
                  {pontos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.descricao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
          ) : filteredEstoques.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum registro de estoque encontrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Ponto de Estoque</TableHead>
                  <TableHead className="text-right">Quantidade Atual</TableHead>
                  <TableHead>Unidade Base</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstoques.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{getNomeProduto(e.produtoId)}</TableCell>
                    <TableCell>{getNomePonto(e.pontoEstoqueId)}</TableCell>
                    <TableCell className={`text-right font-mono ${e.quantidadeAtual < 0 ? "text-destructive font-bold" : ""}`}>
                      {Number(e.quantidadeAtual).toFixed(6)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getUnidadeBaseProduto(e.produtoId)}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
