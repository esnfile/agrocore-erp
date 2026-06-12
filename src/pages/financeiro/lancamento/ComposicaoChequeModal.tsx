import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FinanceiroCheque } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ComposicaoChequeItem } from "./types";
import { sumComposicao } from "./types";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (itens: ComposicaoChequeItem[]) => void;
  modo: "RECEBIMENTO" | "PAGAMENTO";
  cheques: FinanceiroCheque[];
  valorAtual: ComposicaoChequeItem[];
}

export function ComposicaoChequeModal({ open, onClose, onConfirm, modo, cheques, valorAtual }: Props) {
  const { toast } = useToast();
  const [itens, setItens] = useState<ComposicaoChequeItem[]>([]);

  const chequesDisponiveis = useMemo(
    () =>
      cheques
        .filter((c) => c.ativo && c.deletadoEm === null && c.status === "DISPONIVEL")
        .sort((a, b) => a.descricao.localeCompare(b.descricao)),
    [cheques],
  );

  useEffect(() => {
    if (open) setItens(valorAtual.length > 0 ? valorAtual.map((i) => ({ ...i })) : []);
  }, [open, valorAtual]);

  const total = sumComposicao(itens);

  const addLinha = () =>
    setItens((s) => [
      ...s,
      modo === "PAGAMENTO"
        ? { chequeId: "", valor: 0 }
        : { numero: "", banco: "", valor: 0 },
    ]);

  const removeLinha = (idx: number) => setItens((s) => s.filter((_, i) => i !== idx));
  const updateLinha = (idx: number, patch: Partial<ComposicaoChequeItem>) =>
    setItens((s) => s.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const onSelectCheque = (idx: number, chequeId: string) => {
    const chq = chequesDisponiveis.find((c) => c.id === chequeId);
    if (!chq) return;
    updateLinha(idx, { chequeId, numero: chq.numero, banco: chq.banco, valor: chq.valor });
  };

  const confirmar = () => {
    if (itens.length === 0) { onConfirm([]); onClose(); return; }
    for (const [i, it] of itens.entries()) {
      if (modo === "PAGAMENTO" && !it.chequeId) {
        toast({ title: `Linha ${i + 1}: selecione um cheque`, variant: "destructive" }); return;
      }
      if (modo === "RECEBIMENTO" && !(it.numero ?? "").trim()) {
        toast({ title: `Linha ${i + 1}: número do cheque é obrigatório`, variant: "destructive" }); return;
      }
      if (!it.valor || it.valor <= 0) {
        toast({ title: `Linha ${i + 1}: valor deve ser maior que zero`, variant: "destructive" }); return;
      }
    }
    onConfirm(itens.map((i) => ({ ...i, valor: +i.valor.toFixed(2) })));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-3 border-b">
          <DialogTitle>Composição de Cheques</DialogTitle>
          <DialogDescription>
            {modo === "RECEBIMENTO"
              ? "Cadastre os cheques recebidos (número e valor)."
              : "Selecione os cheques cadastrados a serem utilizados no pagamento."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {modo === "PAGAMENTO" && chequesDisponiveis.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhum cheque disponível. Cadastre cheques (status DISPONÍVEL) antes de continuar.
            </div>
          ) : itens.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhum cheque adicionado. Clique em "Adicionar Cheque" para começar.
            </div>
          ) : (
            <div className="space-y-2">
              {modo === "PAGAMENTO" ? (
                <>
                  <div className="hidden md:grid grid-cols-[1fr_180px_40px] gap-2 px-1 text-xs font-medium text-muted-foreground">
                    <span>Cheque</span>
                    <span className="text-right">Valor</span>
                    <span></span>
                  </div>
                  {itens.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_180px_40px] gap-2 items-start">
                      <div>
                        <Label className="md:hidden text-xs">Cheque</Label>
                        <Select
                          value={it.chequeId || undefined}
                          onValueChange={(id) => onSelectCheque(idx, id)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o cheque..." />
                          </SelectTrigger>
                          <SelectContent>
                            {chequesDisponiveis.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.descricao} — {fmt(c.valor)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="md:hidden text-xs">Valor</Label>
                        <Input
                          type="number" step="0.01" min="0"
                          value={it.valor || ""}
                          readOnly
                          className="text-right font-mono bg-muted cursor-not-allowed"
                        />
                      </div>
                      <Button
                        type="button" variant="ghost" size="icon"
                        onClick={() => removeLinha(idx)}
                        aria-label="Remover linha"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className="hidden md:grid grid-cols-[1fr_1fr_160px_40px] gap-2 px-1 text-xs font-medium text-muted-foreground">
                    <span>Número</span>
                    <span>Banco</span>
                    <span className="text-right">Valor</span>
                    <span></span>
                  </div>
                  {itens.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_160px_40px] gap-2 items-start">
                      <div>
                        <Label className="md:hidden text-xs">Número</Label>
                        <Input
                          value={it.numero ?? ""}
                          onChange={(e) => updateLinha(idx, { numero: e.target.value })}
                          placeholder="Ex: 12345"
                        />
                      </div>
                      <div>
                        <Label className="md:hidden text-xs">Banco</Label>
                        <Input
                          value={it.banco ?? ""}
                          onChange={(e) => updateLinha(idx, { banco: e.target.value })}
                          placeholder="Ex: Itaú"
                        />
                      </div>
                      <div>
                        <Label className="md:hidden text-xs">Valor</Label>
                        <Input
                          type="number" step="0.01" min="0"
                          value={it.valor || ""}
                          onChange={(e) => updateLinha(idx, { valor: parseFloat(e.target.value) || 0 })}
                          className="text-right font-mono"
                        />
                      </div>
                      <Button
                        type="button" variant="ghost" size="icon"
                        onClick={() => removeLinha(idx)}
                        aria-label="Remover linha"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {!(modo === "PAGAMENTO" && chequesDisponiveis.length === 0) && (
            <Button type="button" variant="outline" size="sm" onClick={addLinha}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar Cheque
            </Button>
          )}
        </div>

        <DialogFooter className="p-6 pt-3 border-t flex-row items-center justify-between sm:justify-between gap-3">
          <div className="text-sm">
            <span className="text-muted-foreground mr-2">TOTAL</span>
            <span className="font-mono font-bold text-lg">{fmt(total)}</span>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="button" onClick={confirmar}>Confirmar</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
