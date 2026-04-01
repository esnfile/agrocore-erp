import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, Link2, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { romaneioService, contratoService } from "@/lib/services";
import { produtos as mockProdutos } from "@/lib/mock-data";
import type { Romaneio, Contrato } from "@/lib/mock-data";
import { ORIGEM_LABELS, TIPO_LABELS, SAFRAS_REF, CULTIVOS_REF } from "../romaneio-types";

interface StepVinculoProps {
  romaneio: Romaneio;
  onRefresh: () => void;
  ctx: { grupoId: string; empresaId: string; filialId: string } | null;
}

export function StepVinculo({ romaneio, onRefresh, ctx }: StepVinculoProps) {
  const [vincularTipo, setVincularTipo] = useState<"contrato" | "colheita" | null>(null);
  const [vincularContratoId, setVincularContratoId] = useState("");
  const [vincularSafraId, setVincularSafraId] = useState("");
  const [vincularCultivoId, setVincularCultivoId] = useState("");
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [contratosLoaded, setContratosLoaded] = useState(false);

  const vinculoResolvido = romaneio.origem !== "AVULSO" || romaneio.status !== "AGUARDANDO_VINCULO";
  const isAvulsoSemVinculo = romaneio.origem === "AVULSO" && romaneio.status === "AGUARDANDO_VINCULO";

  const produtoNome = mockProdutos.find((p) => p.id === romaneio.produtoId)?.descricao || romaneio.produtoId;

  // Filter contracts: same empresa, same produto, compatible tipo
  const contratosCompativeis = useMemo(() => {
    return contratos.filter((c) => {
      // Same empresa
      if (c.empresaId !== romaneio.empresaId) return false;
      // Same produto
      if (c.produtoId !== romaneio.produtoId) return false;
      // Compatible tipo: ENTRADA → COMPRA, SAIDA → VENDA
      if (romaneio.tipoRomaneio === "ENTRADA" && c.tipoContrato !== "COMPRA") return false;
      if (romaneio.tipoRomaneio === "SAIDA" && c.tipoContrato !== "VENDA") return false;
      return true;
    });
  }, [contratos, romaneio]);

  const loadContratos = async () => {
    if (contratosLoaded || !ctx) return;
    // Load all contracts for the empresa (not filtered by filial — filial doesn't block)
    const c = await contratoService.listar(romaneio.empresaId, romaneio.filialId);
    setContratos(c.filter((ct) => ct.status === "ABERTO" || ct.status === "PARCIAL"));
    setContratosLoaded(true);
  };

  const vincularContrato = async () => {
    if (!vincularContratoId) return;

    // Validate compatibility before sending
    const contrato = contratos.find((c) => c.id === vincularContratoId);
    if (!contrato) {
      toast({ title: "Contrato não encontrado.", variant: "destructive" });
      return;
    }
    if (contrato.empresaId !== romaneio.empresaId) {
      toast({ title: "Empresa do contrato é diferente da empresa do romaneio. Vínculo bloqueado.", variant: "destructive" });
      return;
    }
    if (contrato.produtoId !== romaneio.produtoId) {
      toast({ title: "Produto do contrato é diferente do produto do romaneio. Vínculo bloqueado.", variant: "destructive" });
      return;
    }
    const tipoEsperado = romaneio.tipoRomaneio === "ENTRADA" ? "COMPRA" : "VENDA";
    if (contrato.tipoContrato !== tipoEsperado) {
      toast({ title: `Tipo incompatível. Romaneio de ${TIPO_LABELS[romaneio.tipoRomaneio]} requer contrato de ${tipoEsperado}.`, variant: "destructive" });
      return;
    }

    const result = await romaneioService.vincularContrato(romaneio.id, vincularContratoId);
    if (result.sucesso) {
      toast({ title: result.mensagem });
      setVincularTipo(null);
      onRefresh();
    } else {
      toast({ title: result.mensagem, variant: "destructive" });
    }
  };

  const vincularColheita = async () => {
    if (!vincularSafraId || !vincularCultivoId) return;
    // Colheita is always ENTRADA — check compatibility
    if (romaneio.tipoRomaneio !== "ENTRADA") {
      toast({ title: "Romaneio de Saída não pode ser vinculado a Colheita.", variant: "destructive" });
      return;
    }
    const result = await romaneioService.vincularColheita(romaneio.id, vincularSafraId, vincularCultivoId);
    if (result.sucesso) {
      toast({ title: result.mensagem });
      setVincularTipo(null);
      onRefresh();
    } else {
      toast({ title: result.mensagem, variant: "destructive" });
    }
  };

  const cultivosFiltrados = CULTIVOS_REF.filter((c) => c.safraId === vincularSafraId);

  // Selected contract summary for validation display
  const selectedContrato = contratos.find((c) => c.id === vincularContratoId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Vínculo Definitivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Origem atual:</span>
            <Badge variant="outline">{ORIGEM_LABELS[romaneio.origem]}</Badge>
            <span className="text-sm text-muted-foreground ml-2">Tipo:</span>
            <Badge variant="outline">{TIPO_LABELS[romaneio.tipoRomaneio]}</Badge>
          </div>

          {vinculoResolvido ? (
            <div className="rounded-md bg-green-50 border border-green-200 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-800">Vínculo resolvido</p>
              </div>
              <div className="mt-3 space-y-1 text-sm text-green-700">
                {romaneio.contratoId && (
                  <>
                    <p>✓ Contrato: {romaneio.contratoId.substring(0, 8)}</p>
                    <p>✓ Produto: {produtoNome}</p>
                    <p>✓ Tipo: {TIPO_LABELS[romaneio.tipoRomaneio]}</p>
                    <p>✓ Empresa: compatível</p>
                  </>
                )}
                {romaneio.safraId && <p>✓ Safra: {SAFRAS_REF.find((s) => s.id === romaneio.safraId)?.nome}</p>}
                {romaneio.cultivoId && <p>✓ Cultivo: {CULTIVOS_REF.find((c) => c.id === romaneio.cultivoId)?.nome}</p>}
              </div>
            </div>
          ) : (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <p className="text-sm font-medium text-amber-800">Pendente de vínculo definitivo</p>
              </div>
              <p className="mt-2 text-sm text-amber-700">
                Este romaneio já possui pesagens registradas, mas não pode seguir para classificação, estoque ou finalização sem vínculo definitivo.
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="gap-2" onClick={() => { setVincularTipo("contrato"); setVincularContratoId(""); loadContratos(); }}>
                  <Link2 className="h-4 w-4" /> Vincular a Contrato
                </Button>
                {romaneio.tipoRomaneio === "ENTRADA" && (
                  <Button variant="outline" className="gap-2" onClick={() => setVincularTipo("colheita")}>
                    <Link2 className="h-4 w-4" /> Vincular a Colheita
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog vincular contrato */}
      <Dialog open={vincularTipo === "contrato"} onOpenChange={() => setVincularTipo(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Vincular a Contrato</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md bg-muted/50 border p-3 text-xs space-y-1">
              <p><strong>Filtros aplicados:</strong></p>
              <p>• Empresa: {romaneio.empresaId.substring(0, 8)}</p>
              <p>• Produto: {produtoNome}</p>
              <p>• Tipo: {romaneio.tipoRomaneio === "ENTRADA" ? "Compra" : "Venda"}</p>
            </div>
            <div>
              <Label>Contrato *</Label>
              <Select value={vincularContratoId} onValueChange={setVincularContratoId}>
                <SelectTrigger><SelectValue placeholder="Selecione o contrato compatível" /></SelectTrigger>
                <SelectContent>
                  {contratosCompativeis.length === 0 ? (
                    <SelectItem value="__none" disabled>Nenhum contrato compatível encontrado</SelectItem>
                  ) : contratosCompativeis.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.numeroContrato} — {c.tipoContrato}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Validation summary */}
            {selectedContrato && (
              <div className="rounded-md bg-green-50 border border-green-200 p-3 text-xs space-y-1">
                <div className="flex items-center gap-1 text-green-700 font-medium">
                  <ShieldCheck className="h-3 w-3" /> Validação
                </div>
                <p className="text-green-700">✓ Empresa compatível</p>
                <p className="text-green-700">✓ Produto compatível ({produtoNome})</p>
                <p className="text-green-700">✓ Tipo compatível ({selectedContrato.tipoContrato})</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVincularTipo(null)}>Cancelar</Button>
            <Button onClick={vincularContrato} disabled={!vincularContratoId || vincularContratoId === "__none"}>Vincular</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog vincular colheita */}
      <Dialog open={vincularTipo === "colheita"} onOpenChange={() => setVincularTipo(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Vincular a Colheita</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Safra *</Label>
              <Select value={vincularSafraId} onValueChange={(v) => { setVincularSafraId(v); setVincularCultivoId(""); }}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {SAFRAS_REF.map((s) => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cultivo *</Label>
              <Select value={vincularCultivoId} onValueChange={setVincularCultivoId} disabled={!vincularSafraId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {cultivosFiltrados.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVincularTipo(null)}>Cancelar</Button>
            <Button onClick={vincularColheita} disabled={!vincularSafraId || !vincularCultivoId}>Vincular</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
