import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { romaneioService } from "@/lib/services";
import { produtoClassificacoes, classificacaoDescontos, classificacaoTipos } from "@/lib/mock-data";
import type { Romaneio } from "@/lib/mock-data";
import { ORIGEM_LABELS, SAFRAS_REF } from "../romaneio-types";
import { FormRow } from "@/components/FormRow";
import { produtos as mockProdutos } from "@/lib/mock-data";

interface StepClassificacaoProps {
  romaneio: Romaneio;
  onRefresh: () => void;
  ctx: { grupoId: string; empresaId: string; filialId: string } | null;
}

interface ClassificacaoLinha {
  classificacaoTipoId: string;
  descricao: string;
  unidade: string;
  valorBase: number;
  limiteTolerancia: number;
  valorMedido: number;
  diferenca: number;
  percentualFaixa: number;
  percentualFinal: number;
  pesoDescontado: number;
  pesoApos: number;
}

export function StepClassificacao({ romaneio, onRefresh, ctx }: StepClassificacaoProps) {
  // Load product classifications
  const classificacoesAtivas = useMemo(() => {
    return produtoClassificacoes.filter(
      (pc) => pc.deletadoEm === null && pc.produtoId === romaneio.produtoId && pc.ativo
    );
  }, [romaneio.produtoId]);

  // Init values from existing data
  const [valoresMedidos, setValoresMedidos] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    classificacoesAtivas.forEach((pc) => { init[pc.classificacaoTipoId] = 0; });
    return init;
  });

  const isEditable = romaneio.status === "AGUARDANDO_CLASSIFICACAO";
  const produtoNome = mockProdutos.find((p) => p.id === romaneio.produtoId)?.descricao || romaneio.produtoId;

  // Calculation
  const resultado = useMemo(() => {
    let pesoAtual = romaneio.pesoLiquidoFisico;
    const linhas: ClassificacaoLinha[] = [];

    // Sort by classificação tipo ordem
    const sortedClassifs = [...classificacoesAtivas].sort((a, b) => {
      const tipoA = classificacaoTipos.find((ct) => ct.id === a.classificacaoTipoId);
      const tipoB = classificacaoTipos.find((ct) => ct.id === b.classificacaoTipoId);
      return (tipoA?.descricao || "").localeCompare(tipoB?.descricao || "");
    });

    let totalPercDescontos = 0;
    let totalPesoDescontado = 0;

    for (const pc of sortedClassifs) {
      const tipo = classificacaoTipos.find((ct) => ct.id === pc.classificacaoTipoId);
      if (!tipo) continue;

      const valorMedido = valoresMedidos[pc.classificacaoTipoId] || 0;
      const valorBase = pc.valorPadrao;
      const limiteTolerancia = pc.limiteTolerancia;
      const diferenca = Math.max(0, valorMedido - valorBase);

      // Find applicable discount tier
      let percentualFaixa = 0;
      if (diferenca > 0) {
        const faixa = classificacaoDescontos.find(
          (cd) => cd.deletadoEm === null && cd.produtoId === romaneio.produtoId &&
            cd.classificacaoTipoId === pc.classificacaoTipoId &&
            valorMedido >= cd.valorMinimo && valorMedido < cd.valorMaximo
        );
        percentualFaixa = faixa?.percentualDesconto || 0;
      }

      const percentualFinal = diferenca * percentualFaixa;
      const pesoDescontado = pesoAtual * (percentualFinal / 100);
      pesoAtual -= pesoDescontado;

      totalPercDescontos += percentualFinal;
      totalPesoDescontado += pesoDescontado;

      linhas.push({
        classificacaoTipoId: pc.classificacaoTipoId,
        descricao: tipo.descricao,
        unidade: tipo.unidade === "PERCENTUAL" ? "%" : tipo.unidade,
        valorBase,
        limiteTolerancia,
        valorMedido,
        diferenca,
        percentualFaixa,
        percentualFinal,
        pesoDescontado,
        pesoApos: pesoAtual,
      });
    }

    return { linhas, pesoClassificado: pesoAtual, totalPercDescontos, totalPesoDescontado };
  }, [classificacoesAtivas, valoresMedidos, romaneio]);

  const handleSalvar = async () => {
    if (!ctx) return;
    if (resultado.pesoClassificado <= 0) {
      toast({ title: "Descontos resultam em peso zerado ou negativo", variant: "destructive" });
      return;
    }

    await romaneioService.salvar({
      id: romaneio.id,
      pesoClassificado: resultado.pesoClassificado,
      totalPercentualDescontos: resultado.totalPercDescontos,
      totalPesoDescontado: resultado.totalPesoDescontado,
      dataClassificacao: new Date().toISOString(),
      pesoLiquidoSecoLimpo: resultado.pesoClassificado,
      status: "CLASSIFICADO",
    }, ctx);

    toast({ title: `Classificação salva. Peso classificado: ${resultado.pesoClassificado.toFixed(0)} kg` });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Resumo do Romaneio</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-muted-foreground">Origem:</span> <Badge variant="outline" className="ml-1">{ORIGEM_LABELS[romaneio.origem]}</Badge></div>
            <div><span className="text-muted-foreground">Produto:</span> <strong className="ml-1">{produtoNome}</strong></div>
            <div><span className="text-muted-foreground">Peso Físico:</span> <strong className="ml-1">{romaneio.pesoLiquidoFisico.toFixed(0)} kg</strong></div>
            <div>
              <span className="text-muted-foreground">Vínculo:</span>
              <span className="ml-1">
                {romaneio.contratoId ? `Contrato ${romaneio.contratoId.substring(0, 8)}` :
                  romaneio.safraId ? SAFRAS_REF.find((s) => s.id === romaneio.safraId)?.nome : "—"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {classificacoesAtivas.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>Nenhuma classificação configurada para este produto.</p>
            <p className="text-xs mt-1">Configure classificações no cadastro de produtos.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Apontamento */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Apontamento de Classificação</CardTitle>
                {isEditable && (
                  <Button size="sm" onClick={handleSalvar} className="gap-1">
                    <Check className="h-3 w-3" /> Salvar Classificação
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resultado.linhas.map((l) => (
                  <div key={l.classificacaoTipoId} className="rounded-md border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">{l.descricao} (Base: {l.valorBase}{l.unidade})</Label>
                      {l.percentualFinal > 0 && (
                        <Badge variant="destructive" className="text-[10px]">-{l.percentualFinal.toFixed(2)}%</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Valor medido:</span>
                      <Input
                        type="number" step="0.1" min="0" max="100"
                        value={valoresMedidos[l.classificacaoTipoId] || 0}
                        onChange={(e) => setValoresMedidos((prev) => ({ ...prev, [l.classificacaoTipoId]: parseFloat(e.target.value) || 0 }))}
                        className="h-8 w-24" disabled={!isEditable}
                      />
                      <span className="text-xs">{l.unidade}</span>
                    </div>
                    {l.diferenca > 0 && (
                      <p className="text-xs text-orange-600">
                        Diferença: {l.diferenca.toFixed(1)} × {l.percentualFaixa.toFixed(2)}% = {l.percentualFinal.toFixed(2)}% → -{l.pesoDescontado.toFixed(0)} kg
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cálculo progressivo */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Cálculo Progressivo</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Etapa</TableHead>
                    <TableHead className="text-xs text-right">Desconto %</TableHead>
                    <TableHead className="text-xs text-right">Peso Descontado</TableHead>
                    <TableHead className="text-xs text-right">Peso Após</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-xs font-medium">Peso Líquido Físico</TableCell>
                    <TableCell className="text-xs text-right">—</TableCell>
                    <TableCell className="text-xs text-right">—</TableCell>
                    <TableCell className="text-xs text-right font-mono">{romaneio.pesoLiquidoFisico.toFixed(0)} kg</TableCell>
                  </TableRow>
                  {resultado.linhas.map((l) => (
                    <TableRow key={l.classificacaoTipoId}>
                      <TableCell className="text-xs">{l.descricao}</TableCell>
                      <TableCell className="text-xs text-right text-orange-600">{l.percentualFinal > 0 ? `-${l.percentualFinal.toFixed(2)}%` : "0%"}</TableCell>
                      <TableCell className="text-xs text-right text-orange-600 font-mono">{l.pesoDescontado > 0 ? `-${l.pesoDescontado.toFixed(0)} kg` : "—"}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{l.pesoApos.toFixed(0)} kg</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Resumo final */}
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total Descontos</p>
                  <p className="text-sm font-bold text-orange-600">{resultado.totalPesoDescontado.toFixed(0)} kg ({resultado.totalPercDescontos.toFixed(2)}%)</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Peso Líquido Físico</p>
                  <p className="text-sm font-bold">{romaneio.pesoLiquidoFisico.toFixed(0)} kg</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Peso Classificado / Comercial</p>
                  <p className={`text-lg font-bold ${resultado.pesoClassificado > 0 ? "text-green-700" : "text-destructive"}`}>
                    {resultado.pesoClassificado.toFixed(0)} kg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
