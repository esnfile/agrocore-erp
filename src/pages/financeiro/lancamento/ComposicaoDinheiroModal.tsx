import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FinanceiroFormaPagto } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ComposicaoDinheiroItem } from "./types";
import { sumComposicao } from "./types";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (itens: ComposicaoDinheiroItem[]) => void;
  formasPagto: FinanceiroFormaPagto[];
  valorAtual: ComposicaoDinheiroItem[];
}

export function ComposicaoDinheiroModal({ open, onClose, onConfirm, formasPagto, valorAtual }: Props) {
  const { toast } = useToast();
  const [itens, setItens] = useState<ComposicaoDinheiroItem[]>([]);

  // Apenas formas com categoria contábil DINHEIRO entram no popup do campo Dinheiro.
  const formasDisponiveis = useMemo(
    () =>
      formasPagto
        .filter((f) => f.ativo && f.deletadoEm === null && f.categoriaContabil === "DINHEIRO")
        .sort((a, b) => a.descricao.localeCompare(b.descricao)),
    [formasPagto],
  );

  useEffect(() => {
    if (open) {
      setItens(valorAtual.length > 0 ? valorAtual.map((i) => ({ ...i })) : []);
    }
  }, [open, valorAtual]);

  const total = sumComposicao(itens);

  const addLinha = () => setItens((s) => [...s, { formaId: "", valor: 0 }]);
  const removeLinha = (idx: number) => setItens((s) => s.filter((_, i) => i !== idx));
  const updateLinha = (idx: number, patch: Partial<ComposicaoDinheiroItem>) =>
    setItens((s) => s.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const confirmar = () => {
    if (itens.length === 0) {
      onConfirm([]);
      onClose();
      return;
    }
    for (const [i, it] of itens.entries()) {
      if (!it.formaId) {
        toast({ title: `Linha ${i + 1}: selecione a forma de pagamento`, variant: "destructive" });
        return;
      }
      if (!it.valor || it.valor <= 0) {
        toast({ title: `Linha ${i + 1}: valor deve ser maior que zero`, variant: "destructive" });
        return;
      }
    }
    onConfirm(itens.map((i) => ({ ...i, valor: +i.valor.toFixed(2) })));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-3 border-b">
          <DialogTitle>Composição de Formas de Pagamento</DialogTitle>
          <DialogDescription>
            Detalhe como o valor de "Dinheiro" entrou/saiu (espécie, PIX, transferência, etc.).
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {formasDisponiveis.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhuma forma de pagamento disponível. Cadastre formas (tipo DINHEIRO, BANCÁRIO ou ELETRÔNICO) antes de continuar.
            </div>
          ) : itens.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhuma forma adicionada. Clique em "Adicionar Forma" para começar.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="hidden md:grid grid-cols-[1fr_180px_40px] gap-2 px-1 text-xs font-medium text-muted-foreground">
                <span>Forma de Pagamento</span>
                <span className="text-right">Valor</span>
                <span></span>
              </div>
              {itens.map((it, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_180px_40px] gap-2 items-start">
                  <div>
                    <Label className="md:hidden text-xs">Forma</Label>
                    <Select
                      value={it.formaId || undefined}
                      onValueChange={(id) => updateLinha(idx, { formaId: id })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma..." />
                      </SelectTrigger>
                      <SelectContent>
                        {formasDisponiveis.map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.descricao}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
            </div>
          )}

          {formasDisponiveis.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={addLinha}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar Forma
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
