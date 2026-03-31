import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, AlertTriangle, Scale } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { romaneioService, pontoEstoqueService } from "@/lib/services";
import { produtos as mockProdutos } from "@/lib/mock-data";
import type { Romaneio, PontoEstoque } from "@/lib/mock-data";
import { STATUS_LABELS, ORIGEM_LABELS, SAFRAS_REF, CULTIVOS_REF } from "../romaneio-types";
import { FormRow } from "@/components/FormRow";

interface StepFechamentoProps {
  romaneio: Romaneio;
  onRefresh: () => void;
  ctx: { grupoId: string; empresaId: string; filialId: string } | null;
}

export function StepFechamento({ romaneio, onRefresh, ctx }: StepFechamentoProps) {
  const [pontosEstoque, setPontosEstoque] = useState<PontoEstoque[]>([]);
  const [pontosLoaded, setPontosLoaded] = useState(false);
  const [confirmFinalizar, setConfirmFinalizar] = useState(false);
  const [confirmCancelar, setConfirmCancelar] = useState(false);

  const produtoNome = mockProdutos.find((p) => p.id === romaneio.produtoId)?.descricao || romaneio.produtoId;

  const loadPontos = async () => {
    if (pontosLoaded) return;
    const p = await pontoEstoqueService.listar(romaneio.empresaId, romaneio.filialId);
    setPontosEstoque(p.filter((pe) => pe.ativo));
    setPontosLoaded(true);
  };

  // Validations for finalization
  const bloqueios = useMemo(() => {
    const erros: string[] = [];
    if (romaneio.status === "CANCELADO") erros.push("Romaneio cancelado");
    if (romaneio.status === "FINALIZADO") return []; // Already done
    if (!romaneio.contratoId && !romaneio.safraId) erros.push("Sem vínculo definitivo (contrato ou colheita)");
    if (romaneio.pesoLiquidoFisico <= 0) erros.push("Peso líquido físico inválido");
    if (romaneio.pesoClassificado <= 0 && romaneio.status !== "CLASSIFICADO") erros.push("Classificação não concluída");
    if (!romaneio.pontoEstoqueId) erros.push("Ponto de estoque não definido");
    return erros;
  }, [romaneio]);

  const podeFinalizar = bloqueios.length === 0 && romaneio.status !== "FINALIZADO" && romaneio.status !== "CANCELADO";

  const handlePontoChange = async (pontoId: string) => {
    if (!ctx) return;
    await romaneioService.salvar({ id: romaneio.id, pontoEstoqueId: pontoId || null }, ctx);
    toast({ title: "Ponto de estoque atualizado" });
    onRefresh();
  };

  const handleFinalizar = async () => {
    const result = await romaneioService.finalizar(romaneio.id);
    if (result.sucesso) {
      toast({ title: result.mensagem });
    } else {
      toast({ title: result.mensagem, variant: "destructive" });
    }
    setConfirmFinalizar(false);
    onRefresh();
  };

  const handleCancelar = async () => {
    await romaneioService.cancelar(romaneio.id);
    toast({ title: "Romaneio cancelado" });
    setConfirmCancelar(false);
    onRefresh();
  };

  const pontoNome = pontosEstoque.find((p) => p.id === romaneio.pontoEstoqueId)?.descricao || (romaneio.pontoEstoqueId ? romaneio.pontoEstoqueId.substring(0, 8) : "Não definido");

  const isEditable = romaneio.status !== "FINALIZADO" && romaneio.status !== "CANCELADO";

  return (
    <div className="space-y-6">
      {/* Resumo do Romaneio */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Resumo do Romaneio</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-sm">
            <div><span className="text-muted-foreground">ID:</span> <strong>{romaneio.id.substring(0, 8)}</strong></div>
            <div><span className="text-muted-foreground">Origem:</span> <Badge variant="outline" className="ml-1">{ORIGEN_LABELS_SAFE(romaneio.origem)}</Badge></div>
            <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className="ml-1">{STATUS_LABELS[romaneio.status as keyof typeof STATUS_LABELS] || romaneio.status}</Badge></div>
            <div><span className="text-muted-foreground">Produto:</span> <strong>{produtoNome}</strong></div>
            <div><span className="text-muted-foreground">Motorista:</span> <strong>{romaneio.motoristaNome}</strong></div>
            <div><span className="text-muted-foreground">Veículo:</span> <strong>{romaneio.placaVeiculo}</strong></div>
            <div><span className="text-muted-foreground">Data:</span> <strong>{format(new Date(romaneio.criadoEm), "dd/MM/yyyy HH:mm")}</strong></div>
            {romaneio.contratoId && <div><span className="text-muted-foreground">Contrato:</span> <strong>{romaneio.contratoId.substring(0, 8)}</strong></div>}
            {romaneio.safraId && <div><span className="text-muted-foreground">Safra:</span> <strong>{SAFRAS_REF.find((s) => s.id === romaneio.safraId)?.nome}</strong></div>}
          </div>
        </CardContent>
      </Card>

      {/* Pesagens */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Pesagens</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div><span className="text-muted-foreground text-xs">Peso Entrada</span><p className="font-bold font-mono">{romaneio.pesoEntrada > 0 ? `${romaneio.pesoEntrada.toFixed(3)} ton` : "—"}</p></div>
            <div><span className="text-muted-foreground text-xs">Peso Saída</span><p className="font-bold font-mono">{romaneio.pesoSaida > 0 ? `${romaneio.pesoSaida.toFixed(3)} ton` : "—"}</p></div>
            <div><span className="text-muted-foreground text-xs">Peso Carregado</span><p className="font-bold font-mono">{romaneio.pesoCarregado > 0 ? `${romaneio.pesoCarregado.toFixed(3)} ton` : "—"}</p></div>
            <div><span className="text-muted-foreground text-xs">Tara</span><p className="font-bold font-mono">{romaneio.pesoTara > 0 ? `${romaneio.pesoTara.toFixed(3)} ton` : "—"}</p></div>
            <div><span className="text-muted-foreground text-xs">Peso Líquido Físico</span><p className="font-bold font-mono text-green-700">{romaneio.pesoLiquidoFisico > 0 ? `${romaneio.pesoLiquidoFisico.toFixed(3)} ton` : "—"}</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Peso Físico vs Classificado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-blue-200 bg-blue-50/30">
          <CardContent className="p-6 text-center">
            <Scale className="mx-auto h-6 w-6 text-blue-600 mb-2" />
            <p className="text-xs text-blue-600 font-medium">PESO FÍSICO</p>
            <p className="text-2xl font-bold text-blue-800">{romaneio.pesoLiquidoFisico > 0 ? `${romaneio.pesoLiquidoFisico.toFixed(3)} ton` : "—"}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-200 bg-green-50/30">
          <CardContent className="p-6 text-center">
            <Scale className="mx-auto h-6 w-6 text-green-600 mb-2" />
            <p className="text-xs text-green-600 font-medium">PESO CLASSIFICADO / COMERCIAL</p>
            <p className="text-2xl font-bold text-green-800">{romaneio.pesoClassificado > 0 ? `${romaneio.pesoClassificado.toFixed(3)} ton` : (romaneio.pesoLiquidoSecoLimpo > 0 ? `${romaneio.pesoLiquidoSecoLimpo.toFixed(3)} ton` : "—")}</p>
            {romaneio.totalPercentualDescontos > 0 && (
              <p className="text-xs text-orange-600 mt-1">Descontos: -{romaneio.totalPesoDescontado.toFixed(3)} ton ({romaneio.totalPercentualDescontos.toFixed(2)}%)</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ponto de Estoque */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Ponto de Estoque</CardTitle></CardHeader>
        <CardContent>
          {isEditable ? (
            <div>
              <Label>Ponto de Estoque *</Label>
              <Select value={romaneio.pontoEstoqueId || ""} onValueChange={handlePontoChange} onOpenChange={() => loadPontos()}>
                <SelectTrigger><SelectValue placeholder="Selecione o ponto de estoque" /></SelectTrigger>
                <SelectContent>
                  {pontosEstoque.map((p) => <SelectItem key={p.id} value={p.id}>{p.descricao} ({p.tipo})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="font-medium">{pontoNome}</p>
          )}
        </CardContent>
      </Card>

      {/* Bloqueios */}
      {bloqueios.length > 0 && romaneio.status !== "FINALIZADO" && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm font-medium text-destructive">Bloqueios para finalização</p>
          </div>
          {bloqueios.map((e, i) => <p key={i} className="text-xs text-destructive ml-6">• {e}</p>)}
        </div>
      )}

      {/* Ações */}
      {isEditable && (
        <div className="flex gap-3 justify-end pt-4">
          <Button variant="destructive" onClick={() => setConfirmCancelar(true)} className="gap-2">
            <XCircle className="h-4 w-4" /> Cancelar Romaneio
          </Button>
          <Button onClick={() => setConfirmFinalizar(true)} disabled={!podeFinalizar} className="gap-2">
            <CheckCircle className="h-4 w-4" /> Finalizar Romaneio
          </Button>
        </div>
      )}

      {romaneio.status === "FINALIZADO" && (
        <div className="rounded-md bg-green-50 border border-green-200 p-4 text-center">
          <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
          <p className="text-lg font-bold text-green-800">Romaneio Finalizado</p>
          <p className="text-sm text-green-700 mt-1">Processo operacional concluído.</p>
        </div>
      )}

      {romaneio.status === "CANCELADO" && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 p-4 text-center">
          <XCircle className="mx-auto h-8 w-8 text-destructive mb-2" />
          <p className="text-lg font-bold text-destructive">Romaneio Cancelado</p>
        </div>
      )}

      {/* Confirm dialogs */}
      <AlertDialog open={confirmFinalizar} onOpenChange={setConfirmFinalizar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar Romaneio?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação confirmará o fechamento do romaneio e atualizará estoque e saldos contratuais.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalizar}>Confirmar Finalização</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmCancelar} onOpenChange={setConfirmCancelar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Romaneio?</AlertDialogTitle>
            <AlertDialogDescription>O romaneio será cancelado e não poderá mais seguir o fluxo normal.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelar} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Confirmar Cancelamento</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Helper to avoid TS issues with legacy status values
function ORIGEN_LABELS_SAFE(origem: string): string {
  return ORIGEM_LABELS[origem as keyof typeof ORIGEM_LABELS] || origem;
}
