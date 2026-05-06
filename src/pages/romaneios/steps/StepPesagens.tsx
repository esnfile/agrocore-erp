import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Scale, ArrowDown, ArrowUp, Check, AlertTriangle, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { romaneioPesagemService, romaneioService } from "@/lib/services";
import type { Romaneio, RomaneioPesagem, TipoPesagem } from "@/lib/mock-data";
import { FormRow } from "@/components/FormRow";

interface StepPesagensProps {
  romaneio: Romaneio;
  pesagens: RomaneioPesagem[];
  onRefresh: () => void;
  ctx: { grupoId: string; empresaId: string; filialId: string } | null;
}

export function StepPesagens({ romaneio, pesagens, onRefresh, ctx }: StepPesagensProps) {
  const [pesagemOpen, setPesagemOpen] = useState(false);
  const [pesagemTipo, setPesagemTipo] = useState<TipoPesagem>("ENTRADA");
  const [pesagemPeso, setPesagemPeso] = useState("");
  const [pesagemOrigem, setPesagemOrigem] = useState<"MANUAL" | "BALANCA">("BALANCA");
  const [pesagemObs, setPesagemObs] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPeso, setEditPeso] = useState(0);
  const [editTipo, setEditTipo] = useState<TipoPesagem>("ENTRADA");

  const temEntrada = pesagens.some((p) => p.tipoPesagem === "ENTRADA");
  const temSaida = pesagens.some((p) => p.tipoPesagem === "SAIDA");
  const pesagensCompletas = temEntrada && temSaida;

  const isEditable = romaneio.status !== "FINALIZADO" && romaneio.status !== "CANCELADO";

  // Validations
  const validacoes = useMemo(() => {
    const erros: string[] = [];
    if (pesagensCompletas) {
      if (romaneio.pesoTara <= 0) erros.push("Tara deve ser > 0");
      if (romaneio.pesoCarregado <= 0) erros.push("Peso carregado deve ser > 0");
      if (romaneio.pesoLiquidoFisico <= 0) erros.push("Peso líquido físico deve ser > 0");
      if (romaneio.pesoCarregado <= romaneio.pesoTara) erros.push("Peso carregado deve ser > tara");
    }
    return erros;
  }, [pesagensCompletas, romaneio]);

  const addPesagem = async () => {
    if (!ctx || !pesagemPeso) return;
    const peso = parseFloat(pesagemPeso);
    if (isNaN(peso) || peso <= 0) { toast({ title: "Peso inválido", variant: "destructive" }); return; }
    const result = await romaneioPesagemService.salvar({
      romaneioId: romaneio.id,
      tipoPesagem: pesagemTipo,
      peso,
      origemLeitura: pesagemOrigem,
      observacao: pesagemObs,
    }, ctx);
    if ("erro" in result) {
      toast({ title: result.erro, variant: "destructive" }); return;
    }
    toast({ title: `Pesagem de ${pesagemTipo === "ENTRADA" ? "entrada" : "saída"} registrada` });
    setPesagemOpen(false); setPesagemPeso(""); setPesagemObs("");
    onRefresh();
  };

  const salvarEdicao = async () => {
    if (!editingId) return;
    const result = await romaneioPesagemService.editarPesagem(editingId, editPeso, editTipo);
    if (result.sucesso) {
      toast({ title: result.mensagem });
    } else {
      toast({ title: result.mensagem, variant: "destructive" }); return;
    }
    setEditingId(null);
    onRefresh();
  };

  const openPesagemDialog = () => {
    if (!temEntrada) setPesagemTipo("ENTRADA");
    else if (!temSaida) setPesagemTipo("SAIDA");
    setPesagemPeso("");
    setPesagemObs("");
    setPesagemOrigem("BALANCA");
    setPesagemOpen(true);
  };

  const fmtPeso = (v: number) => v > 0 ? `${v.toFixed(0)} kg` : "—";

  return (
    <div className="space-y-6">
      {/* Resumo visual */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className={temEntrada ? "border-primary/30" : "border-dashed"}>
          <CardContent className="p-4 text-center">
            <ArrowDown className={`mx-auto h-5 w-5 mb-1 ${temEntrada ? "text-primary" : "text-muted-foreground"}`} />
            <p className="text-xs text-muted-foreground">Entrada</p>
            <p className="text-lg font-bold">{fmtPeso(romaneio.pesoEntrada)}</p>
            {temEntrada && <Badge variant="default" className="text-[10px] mt-1">✓ Registrada</Badge>}
          </CardContent>
        </Card>
        <Card className={temSaida ? "border-primary/30" : "border-dashed"}>
          <CardContent className="p-4 text-center">
            <ArrowUp className={`mx-auto h-5 w-5 mb-1 ${temSaida ? "text-primary" : "text-muted-foreground"}`} />
            <p className="text-xs text-muted-foreground">Saída</p>
            <p className="text-lg font-bold">{fmtPeso(romaneio.pesoSaida)}</p>
            {temSaida && <Badge variant="default" className="text-[10px] mt-1">✓ Registrada</Badge>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Scale className="mx-auto h-5 w-5 mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Peso Carregado</p>
            <p className="text-lg font-bold">{fmtPeso(romaneio.pesoCarregado)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mt-1">Tara</p>
            <p className="text-lg font-bold">{fmtPeso(romaneio.pesoTara)}</p>
          </CardContent>
        </Card>
        <Card className={romaneio.pesoLiquidoFisico > 0 ? "border-green-500/30 bg-green-50/30" : ""}>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mt-1">Peso Líquido Físico</p>
            <p className={`text-lg font-bold ${romaneio.pesoLiquidoFisico > 0 ? "text-green-700" : ""}`}>
              {fmtPeso(romaneio.pesoLiquidoFisico)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Validações */}
      {validacoes.length > 0 && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm font-medium text-destructive">Inconsistências de pesagem</p>
          </div>
          {validacoes.map((e, i) => <p key={i} className="text-xs text-destructive ml-6">• {e}</p>)}
        </div>
      )}

      {/* Ação principal */}
      {isEditable && !pesagensCompletas && (
        <Button onClick={openPesagemDialog} className="gap-2">
          <Scale className="h-4 w-4" /> Registrar Pesagem
        </Button>
      )}
      {pesagensCompletas && validacoes.length === 0 && (
        <p className="text-sm text-green-700 font-medium">✅ Pesagens completas. Peso líquido físico calculado automaticamente.</p>
      )}

      {/* Histórico */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Histórico de Pesagens</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Peso (kg)</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Observação</TableHead>
                {isEditable && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pesagens.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhuma pesagem registrada</TableCell></TableRow>
              ) : pesagens.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {editingId === p.id ? (
                      <Select value={editTipo} onValueChange={(v) => setEditTipo(v as TipoPesagem)}>
                        <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ENTRADA">⬇️ Entrada</SelectItem>
                          <SelectItem value="SAIDA">⬆️ Saída</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={p.tipoPesagem === "ENTRADA" ? "default" : "secondary"}>
                        {p.tipoPesagem === "ENTRADA" ? "⬇️" : "⬆️"} {p.tipoPesagem}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === p.id ? (
                      <div className="flex items-center gap-2">
                        <Input type="number" step="1" min="0" value={editPeso} onChange={(e) => setEditPeso(parseFloat(e.target.value) || 0)} className="h-8 w-28 font-mono" autoFocus />
                        <span className="text-xs text-muted-foreground">kg</span>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancelar</Button>
                        <Button size="sm" className="gap-1" onClick={salvarEdicao}><Check className="h-3 w-3" /> Salvar</Button>
                      </div>
                    ) : (
                      <span className="font-mono">{p.peso.toFixed(0)} kg</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{format(new Date(p.dataHora), "dd/MM/yyyy HH:mm:ss")}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{p.origemLeitura}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.observacao || "—"}</TableCell>
                  {isEditable && (
                    <TableCell className="text-right">
                      {editingId !== p.id && (
                        <Button variant="ghost" size="sm" onClick={() => { setEditingId(p.id); setEditPeso(p.peso); setEditTipo(p.tipoPesagem); }}>
                          Editar
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Aviso condicional sobre invalidação de classificação */}
      {romaneio.status === "CLASSIFICADO" && (
        <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          <Info className="h-4 w-4 shrink-0" />
          <span>Alterações nas pesagens invalidarão a classificação já realizada, que deverá ser refeita.</span>
        </div>
      )}

      {/* Dialog de Pesagem */}
      <Dialog open={pesagemOpen} onOpenChange={setPesagemOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Pesagem</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <FormRow columns={2}>
              <div>
                <Label>Tipo *</Label>
                <Select value={pesagemTipo} onValueChange={(v) => setPesagemTipo(v as TipoPesagem)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENTRADA" disabled={temEntrada}>⬇️ Entrada {temEntrada ? "(já registrada)" : ""}</SelectItem>
                    <SelectItem value="SAIDA" disabled={temSaida}>⬆️ Saída {temSaida ? "(já registrada)" : ""}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Origem da Leitura</Label>
                <Select value={pesagemOrigem} onValueChange={(v) => setPesagemOrigem(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUAL">Manual</SelectItem>
                    <SelectItem value="BALANCA">Balança</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FormRow>
            <div>
              <Label>Peso (kg) *</Label>
              <Input type="number" step="1" min="0" value={pesagemPeso} onChange={(e) => setPesagemPeso(e.target.value)} placeholder="0" />
            </div>
            <div>
              <Label>Observação</Label>
              <Textarea value={pesagemObs} onChange={(e) => setPesagemObs(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPesagemOpen(false)}>Cancelar</Button>
            <Button onClick={addPesagem} disabled={!pesagemPeso}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
