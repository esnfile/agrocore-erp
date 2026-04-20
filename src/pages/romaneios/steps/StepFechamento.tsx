import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, AlertTriangle, Scale, Pencil } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { romaneioService, pontoEstoqueService, contratoService } from "@/lib/services";
import { produtos as mockProdutos } from "@/lib/mock-data";
import type { Romaneio, PontoEstoque, Contrato } from "@/lib/mock-data";
import { STATUS_LABELS, ORIGEM_LABELS, TIPO_LABELS, SAFRAS_REF, CULTIVOS_REF, STATUS_BADGE_CLASSES, STATUS_ICONS, type StatusRomaneioNew, resolveContratoUnidadeInfo, fmtDualUnit } from "../romaneio-types";
import { empresas, filiais } from "@/lib/mock-data";

interface StepFechamentoProps {
  romaneio: Romaneio;
  onRefresh: () => void;
  ctx: { grupoId: string; empresaId: string; filialId: string } | null;
}

export function StepFechamento({ romaneio, onRefresh, ctx }: StepFechamentoProps) {
  const [pontosEstoque, setPontosEstoque] = useState<PontoEstoque[]>([]);
  const [pontosLoaded, setPontosLoaded] = useState(false);
  const [editingPonto, setEditingPonto] = useState(false);
  const [confirmFinalizar, setConfirmFinalizar] = useState(false);
  const [confirmCancelar, setConfirmCancelar] = useState(false);
  const [contratoVinculado, setContratoVinculado] = useState<Contrato | null>(null);

  const produtoNome = mockProdutos.find((p) => p.id === romaneio.produtoId)?.descricao || romaneio.produtoId;
  const empresaNome = empresas.find((e) => e.id === romaneio.empresaId)?.nome || romaneio.empresaId.substring(0, 8);
  const filialNome = filiais.find((f) => f.id === romaneio.filialId)?.nomeRazao || romaneio.filialId.substring(0, 8);

  const loadPontos = async () => {
    if (pontosLoaded) return;
    const p = await pontoEstoqueService.listar(romaneio.empresaId, romaneio.filialId);
    setPontosEstoque(p.filter((pe) => pe.ativo));
    setPontosLoaded(true);
  };

  // Load linked contract for balance validation
  useEffect(() => {
    if (romaneio.contratoId) {
      contratoService.listar(romaneio.empresaId, romaneio.filialId).then((contratos) => {
        const ct = contratos.find((c) => c.id === romaneio.contratoId);
        if (ct) setContratoVinculado(ct);
      });
    }
  }, [romaneio.contratoId, romaneio.empresaId, romaneio.filialId]);

  const pontoNome = useMemo(() => {
    if (!romaneio.pontoEstoqueId) return "Não definido";
    const ponto = pontosEstoque.find((p) => p.id === romaneio.pontoEstoqueId);
    return ponto ? `${ponto.descricao} (${ponto.tipo})` : romaneio.pontoEstoqueId.substring(0, 8);
  }, [romaneio.pontoEstoqueId, pontosEstoque]);

  // CORREÇÃO 4: Check contract balance vs peso classificado (compare in kg)
  const pesoComercial = romaneio.pesoClassificado > 0 ? romaneio.pesoClassificado : romaneio.pesoLiquidoSecoLimpo;
  const contratoUInfo = contratoVinculado ? resolveContratoUnidadeInfo(contratoVinculado) : null;
  const saldoContratoKg = contratoUInfo ? contratoUInfo.saldoKg : 0;
  const excedeContrato = contratoVinculado && pesoComercial > 0 && pesoComercial > saldoContratoKg;

  // Validations for finalization
  const bloqueios = useMemo(() => {
    const erros: string[] = [];
    if (romaneio.status === "CANCELADO") erros.push("Romaneio cancelado");
    if (romaneio.status === "FINALIZADO") return [];
    if (romaneio.status === "AGUARDANDO_CLASSIFICACAO") erros.push("Classificação pendente. Classifique o romaneio antes de finalizar.");
    if (!romaneio.contratoId && !romaneio.safraId) erros.push("Sem vínculo definitivo (contrato ou colheita)");
    if (romaneio.pesoLiquidoFisico <= 0) erros.push("Peso líquido físico inválido");
    if (romaneio.pesoClassificado <= 0 && romaneio.status !== "CLASSIFICADO") erros.push("Classificação não concluída");
    if (!romaneio.pontoEstoqueId) erros.push("Ponto de estoque não definido");
    if (excedeContrato) erros.push(`Peso classificado (${pesoComercial.toFixed(0)} kg) excede saldo disponível do contrato (${saldoContratoKg.toFixed(0)} kg)`);
    if (pesoComercial > romaneio.pesoLiquidoFisico && romaneio.pesoLiquidoFisico > 0) erros.push("Peso comercial inconsistente com peso físico");
    return erros;
  }, [romaneio, excedeContrato, pesoComercial, contratoVinculado]);

  const podeFinalizar = bloqueios.length === 0 && romaneio.status !== "FINALIZADO" && romaneio.status !== "CANCELADO";

  const isEditable = romaneio.status !== "FINALIZADO" && romaneio.status !== "CANCELADO";

  const handlePontoChange = async (pontoId: string) => {
    if (!ctx) return;
    await romaneioService.salvar({ id: romaneio.id, pontoEstoqueId: pontoId || null }, ctx);
    toast({ title: "Ponto de estoque atualizado" });
    setEditingPonto(false);
    onRefresh();
  };

  const handleFinalizar = async () => {
    if (!romaneio.pontoEstoqueId) {
      toast({ title: "Ponto de estoque é obrigatório para finalizar.", variant: "destructive" });
      setConfirmFinalizar(false);
      return;
    }
    if (excedeContrato) {
      toast({ title: "Peso classificado excede o saldo disponível do contrato.", variant: "destructive" });
      setConfirmFinalizar(false);
      return;
    }
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

  const fmtPeso = (v: number) => v > 0 ? `${v.toFixed(0)} kg` : "—";

  return (
    <div className="space-y-6">
      {/* Resumo do Romaneio */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Resumo do Romaneio</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-sm">
            <div><span className="text-muted-foreground">ID:</span> <strong>{romaneio.id.substring(0, 8)}</strong></div>
            <div><span className="text-muted-foreground">Origem:</span> <Badge variant="outline" className="ml-1">{ORIGEM_LABELS[romaneio.origem]}</Badge></div>
            <div><span className="text-muted-foreground">Tipo:</span> <Badge variant="outline" className="ml-1">{TIPO_LABELS[romaneio.tipoRomaneio]}</Badge></div>
            <div><span className="text-muted-foreground">Empresa:</span> <strong>{empresaNome}</strong></div>
            <div><span className="text-muted-foreground">Filial:</span> <strong>{filialNome}</strong></div>
            <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={`ml-1 ${STATUS_BADGE_CLASSES[romaneio.status as StatusRomaneioNew] || ""}`}>{STATUS_LABELS[romaneio.status as keyof typeof STATUS_LABELS] || romaneio.status}</Badge></div>
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
            <div><span className="text-muted-foreground text-xs">Peso Entrada</span><p className="font-bold font-mono">{fmtPeso(romaneio.pesoEntrada)}</p></div>
            <div><span className="text-muted-foreground text-xs">Peso Saída</span><p className="font-bold font-mono">{fmtPeso(romaneio.pesoSaida)}</p></div>
            <div><span className="text-muted-foreground text-xs">Peso Carregado</span><p className="font-bold font-mono">{fmtPeso(romaneio.pesoCarregado)}</p></div>
            <div><span className="text-muted-foreground text-xs">Tara</span><p className="font-bold font-mono">{fmtPeso(romaneio.pesoTara)}</p></div>
            <div><span className="text-muted-foreground text-xs">Peso Líquido Físico</span><p className="font-bold font-mono text-green-700">{fmtPeso(romaneio.pesoLiquidoFisico)}</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Peso Físico vs Classificado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-blue-200 bg-blue-50/30">
          <CardContent className="p-6 text-center">
            <Scale className="mx-auto h-6 w-6 text-blue-600 mb-2" />
            <p className="text-xs text-blue-600 font-medium">PESO FÍSICO</p>
            <p className="text-2xl font-bold text-blue-800">{fmtPeso(romaneio.pesoLiquidoFisico)}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-200 bg-green-50/30">
          <CardContent className="p-6 text-center">
            <Scale className="mx-auto h-6 w-6 text-green-600 mb-2" />
            <p className="text-xs text-green-600 font-medium">PESO CLASSIFICADO / COMERCIAL</p>
            <p className="text-2xl font-bold text-green-800">{pesoComercial > 0 ? fmtPeso(pesoComercial) : "—"}</p>
            {romaneio.totalPercentualDescontos > 0 && (
              <p className="text-xs text-orange-600 mt-1">Descontos: -{romaneio.totalPesoDescontado.toFixed(0)} kg ({romaneio.totalPercentualDescontos.toFixed(2)}%)</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CORREÇÃO 4: Contract balance info when linked */}
      {contratoVinculado && (() => {
        const uInfo = resolveContratoUnidadeInfo(contratoVinculado);
        return (
        <Card className={excedeContrato && romaneio.status !== "FINALIZADO" && romaneio.status !== "CANCELADO" ? "border-destructive" : ""}>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Saldo Contratual</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Total Contratado</span>
                <p className="font-bold font-mono">{fmtDualUnit(uInfo.totalOriginal, uInfo)}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Já Entregue</span>
                <p className="font-bold font-mono">{fmtDualUnit(uInfo.entregueOriginal, uInfo)}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Saldo Disponível</span>
                <p className={`font-bold font-mono ${contratoVinculado.quantidadeSaldo <= 0 ? "text-destructive" : "text-green-700"}`}>
                  {fmtDualUnit(uInfo.saldoOriginal, uInfo)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Peso Classificado (este romaneio)</span>
                <p className={`font-bold font-mono ${excedeContrato ? "text-destructive" : ""}`}>
                  {pesoComercial > 0 ? `${pesoComercial.toFixed(0)} kg` : "—"}
                </p>
              </div>
            </div>
            {excedeContrato && romaneio.status !== "FINALIZADO" && romaneio.status !== "CANCELADO" && (
              <div className="mt-3 rounded-md bg-destructive/10 border border-destructive/30 p-2 text-xs text-destructive">
                ⚠ O peso classificado excede o saldo disponível do contrato em {(pesoComercial - uInfo.saldoKg).toFixed(0)} kg. Finalização bloqueada.
              </div>
            )}
          </CardContent>
        </Card>
        );
      })()}

      {/* Ponto de Estoque — same field as Step 1 */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Ponto de Estoque</CardTitle></CardHeader>
        <CardContent>
          {!editingPonto ? (
            <div className="flex items-center justify-between">
              <div>
                {romaneio.pontoEstoqueId ? (
                  <p className="font-medium">{pontoNome}</p>
                ) : (
                  <p className="text-sm text-destructive font-medium">⚠ Ponto de estoque não definido — obrigatório para finalizar</p>
                )}
              </div>
              {isEditable && (
                <Button variant="outline" size="sm" className="gap-1" onClick={() => { setEditingPonto(true); loadPontos(); }}>
                  <Pencil className="h-3 w-3" /> Alterar
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Ponto de Estoque *</Label>
              <Select value={romaneio.pontoEstoqueId || ""} onValueChange={handlePontoChange}>
                <SelectTrigger><SelectValue placeholder="Selecione o ponto de estoque" /></SelectTrigger>
                <SelectContent>
                  {pontosEstoque.map((p) => <SelectItem key={p.id} value={p.id}>{p.descricao} ({p.tipo})</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={() => setEditingPonto(false)}>Cancelar</Button>
            </div>
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

      {/* Ações — CORREÇÃO 3: Only show when editable */}
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
