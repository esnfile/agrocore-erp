import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, Link2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { romaneioService, contratoService } from "@/lib/services";
import type { Romaneio, Contrato } from "@/lib/mock-data";
import { ORIGEM_LABELS, SAFRAS_REF, CULTIVOS_REF } from "../romaneio-types";

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

  const loadContratos = async () => {
    if (contratosLoaded || !ctx) return;
    const c = await contratoService.listar(romaneio.empresaId, romaneio.filialId);
    setContratos(c.filter((ct) => ct.status === "ABERTO" || ct.status === "PARCIAL"));
    setContratosLoaded(true);
  };

  const vincularContrato = async () => {
    if (!vincularContratoId) return;
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
          </div>

          {vinculoResolvido ? (
            <div className="rounded-md bg-green-50 border border-green-200 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-800">Vínculo resolvido</p>
              </div>
              <div className="mt-2 text-sm text-green-700">
                {romaneio.contratoId && <p>Contrato vinculado: {romaneio.contratoId.substring(0, 8)}</p>}
                {romaneio.safraId && <p>Safra: {SAFRAS_REF.find((s) => s.id === romaneio.safraId)?.nome}</p>}
                {romaneio.cultivoId && <p>Cultivo: {CULTIVOS_REF.find((c) => c.id === romaneio.cultivoId)?.nome}</p>}
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
                <Button variant="outline" className="gap-2" onClick={() => { setVincularTipo("contrato"); loadContratos(); }}>
                  <Link2 className="h-4 w-4" /> Vincular a Contrato
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => setVincularTipo("colheita")}>
                  <Link2 className="h-4 w-4" /> Vincular a Colheita
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog vincular contrato */}
      <Dialog open={vincularTipo === "contrato"} onOpenChange={() => setVincularTipo(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Vincular a Contrato</DialogTitle></DialogHeader>
          <div>
            <Label>Contrato *</Label>
            <Select value={vincularContratoId} onValueChange={setVincularContratoId}>
              <SelectTrigger><SelectValue placeholder="Selecione o contrato" /></SelectTrigger>
              <SelectContent>
                {contratos.map((c) => <SelectItem key={c.id} value={c.id}>{c.numeroContrato} — {c.tipoContrato}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVincularTipo(null)}>Cancelar</Button>
            <Button onClick={vincularContrato} disabled={!vincularContratoId}>Vincular</Button>
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
