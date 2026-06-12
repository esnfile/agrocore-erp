import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FinanceiroCartao } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ComposicaoCartaoItem } from "./types";
import { sumComposicao } from "./types";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (itens: ComposicaoCartaoItem[]) => void;
  modo: "RECEBIMENTO" | "PAGAMENTO";
  cartoes: FinanceiroCartao[];
  valorAtual: ComposicaoCartaoItem[];
}

export function ComposicaoCartaoModal({ open, onClose, onConfirm, modo, cartoes, valorAtual }: Props) {
  const { toast } = useToast();
  const [itens, setItens] = useState<ComposicaoCartaoItem[]>([]);

  const cartoesDisponiveis = useMemo(
    () =>
      cartoes
        .filter((c) => c.ativo && c.deletadoEm === null && c.status === "DISPONIVEL")
        .sort((a, b) => a.descricao.localeCompare(b.descricao)),
    [cartoes],
  );

  useEffect(() => {
    if (open) setItens(valorAtual.length > 0 ? valorAtual.map((i) => ({ ...i })) : []);
  }, [open, valorAtual]);

  const total = sumComposicao(itens);

  const addLinha = () =>
    setItens((s) => [
      ...s,
      modo === "PAGAMENTO" ? { cartaoId: "", valor: 0 } : { numero: "", bandeira: "", valor: 0 },
    ]);

  const removeLinha = (idx: number) => setItens((s) => s.filter((_, i) => i !== idx));
  const updateLinha = (idx: number, patch: Partial<ComposicaoCartaoItem>) =>
    setItens((s) => s.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const onSelectCartao = (idx: number, cartaoId: string) => {
    const c = cartoesDisponiveis.find((x) => x.id === cartaoId);
    if (!c) return;
    updateLinha(idx, { cartaoId, numero: c.ultimos4, bandeira: c.bandeira, valor: c.valorDisponivel });
  };

  const confirmar = () => {
    if (itens.length === 0) { onConfirm([]); onClose(); return; }
    for (const [i, it] of itens.entries()) {
      if (modo === "PAGAMENTO" && !it.cartaoId) {
        toast({ title: `Linha ${i + 1}: selecione um cartão`, variant: "destructive" }); return;
      }
      if (modo === "RECEBIMENTO" && !(it.numero ?? "").trim()) {
        toast({ title: `Linha ${i + 1}: número do cartão é obrigatório`, variant: "destructive" }); return;
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
          <DialogTitle>Composição de Cartões</DialogTitle>
          <DialogDescription>
            {modo === "RECEBIMENTO"
              ? "Cadastre os cartões recebidos (bandeira, número e valor)."
              : "Selecione os cartões cadastrados a serem utilizados no pagamento."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {modo === "PAGAMENTO" && cartoesDisponiveis.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhum cartão disponível. Cadastre cartões antes de continuar.
            </div>
          ) : itens.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhum cartão adicionado. Clique em "Adicionar Cartão" para começar.
            </div>
          ) : (
            <div className="space-y-2">
              {modo === "PAGAMENTO" ? (
                <>
                  <div className="hidden md:grid grid-cols-[1fr_180px_40px] gap-2 px-1 text-xs font-medium text-muted-foreground">
                    <span>Cartão</span>
                    <span className="text-right">Valor</span>
                    <span></span>
                  </div>
                  {itens.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_180px_40px] gap-2 items-start">
                      <div>
                        <Label className="md:hidden text-xs">Cartão</Label>
                        <Select
                          value={it.cartaoId || undefined}
                          onValueChange={(id) => onSelectCartao(idx, id)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o cartão..." />
                          </SelectTrigger>
                          <SelectContent>
                            {cartoesDisponiveis.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.descricao} — disp. {fmt(c.valorDisponivel)}
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
                    <span>Bandeira</span>
                    <span>Número / Últ. 4</span>
                    <span className="text-right">Valor</span>
                    <span></span>
                  </div>
                  {itens.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_160px_40px] gap-2 items-start">
                      <div>
                        <Label className="md:hidden text-xs">Bandeira</Label>
                        <Input
                          value={it.bandeira ?? ""}
                          onChange={(e) => updateLinha(idx, { bandeira: e.target.value })}
                          placeholder="Ex: Visa"
                        />
                      </div>
                      <div>
                        <Label className="md:hidden text-xs">Número</Label>
                        <Input
                          value={it.numero ?? ""}
                          onChange={(e) => updateLinha(idx, { numero: e.target.value })}
                          placeholder="Ex: 1234"
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

          {!(modo === "PAGAMENTO" && cartoesDisponiveis.length === 0) && (
            <Button type="button" variant="outline" size="sm" onClick={addLinha}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar Cartão
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
