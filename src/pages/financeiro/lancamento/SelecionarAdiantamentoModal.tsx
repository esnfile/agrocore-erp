import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { financeiroAdiantamentoService } from "@/lib/services";
import type { FinanceiroAdiantamento, TipoBeneficiarioAdiantamento } from "@/lib/mock-data";
import type { AdiantamentoUso } from "./types";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  open: boolean;
  onClose: () => void;
  pessoaId: string;
  tipoBeneficiario: TipoBeneficiarioAdiantamento;
  selecionadosAtuais: AdiantamentoUso[];
  onConfirm: (sel: AdiantamentoUso[]) => void;
}

export function SelecionarAdiantamentoModal({
  open, onClose, pessoaId, tipoBeneficiario, selecionadosAtuais, onConfirm,
}: Props) {
  const [lista, setLista] = useState<FinanceiroAdiantamento[]>([]);
  const [sel, setSel] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open || !pessoaId) return;
    financeiroAdiantamentoService.listarPorPessoa(pessoaId).then((all) => {
      setLista(all.filter((a) =>
        a.tipoBeneficiario === tipoBeneficiario && a.saldoRestante > 0 && a.status !== "CANCELADO"
      ));
    });
    const initial: Record<string, number> = {};
    selecionadosAtuais.forEach((s) => { initial[s.adiantamentoId] = s.valor; });
    setSel(initial);
  }, [open, pessoaId, tipoBeneficiario, selecionadosAtuais]);

  const total = useMemo(() => Object.values(sel).reduce((s, v) => s + (v || 0), 0), [sel]);

  const toggle = (a: FinanceiroAdiantamento, checked: boolean) => {
    setSel((s) => {
      const n = { ...s };
      if (checked) n[a.id] = a.saldoRestante;
      else delete n[a.id];
      return n;
    });
  };

  const setValor = (a: FinanceiroAdiantamento, v: number) => {
    const clamped = Math.max(0, Math.min(a.saldoRestante, v || 0));
    setSel((s) => ({ ...s, [a.id]: clamped }));
  };

  const confirmar = () => {
    const out: AdiantamentoUso[] = Object.entries(sel)
      .filter(([, v]) => v > 0)
      .map(([adiantamentoId, valor]) => ({ adiantamentoId, valor }));
    onConfirm(out);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Selecionar Adiantamento</DialogTitle>
        </DialogHeader>
        <div className="max-h-[50vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead className="text-right">Saldo Disponível</TableHead>
                <TableHead className="text-right w-40">Valor a Usar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  Nenhum adiantamento disponível para esta pessoa.
                </TableCell></TableRow>
              ) : lista.map((a) => {
                const checked = sel[a.id] !== undefined;
                return (
                  <TableRow key={a.id}>
                    <TableCell><Checkbox checked={checked} onCheckedChange={(c) => toggle(a, !!c)} /></TableCell>
                    <TableCell>{new Date(a.dataAdiantamento).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-xs">{a.origemTipo ?? "—"}</TableCell>
                    <TableCell className="text-right font-mono">{fmt(a.saldoRestante)}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number" step="0.01" min="0" max={a.saldoRestante}
                        disabled={!checked}
                        value={checked ? sel[a.id] || "" : ""}
                        onChange={(e) => setValor(a, parseFloat(e.target.value))}
                        className="text-right"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-sm text-muted-foreground">TOTAL Selecionado</span>
          <span className="text-lg font-mono font-bold">{fmt(total)}</span>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={confirmar}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
