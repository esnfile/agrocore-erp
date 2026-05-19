import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { SENHA_SUPERVISOR_MOCK } from "@/lib/constants";

interface Props {
  open: boolean;
  onClose: () => void;
  onAuthorized: () => void;
  resumo: { cliente: string; valor: number; referencia: string };
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function AutorizacaoSupervisorModal({ open, onClose, onAuthorized, resumo }: Props) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const reset = () => { setSenha(""); setErro(""); };
  const handleClose = () => { reset(); onClose(); };

  const handleAutorizar = () => {
    if (senha === SENHA_SUPERVISOR_MOCK) {
      reset();
      onAuthorized();
    } else {
      setErro("Senha inválida");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Autorização de Adiantamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
            <div><span className="text-muted-foreground">Cliente: </span><span className="font-medium">{resumo.cliente}</span></div>
            <div><span className="text-muted-foreground">Valor: </span><span className="font-medium">{fmt(resumo.valor)}</span></div>
            <div><span className="text-muted-foreground">Referência: </span><span>{resumo.referencia}</span></div>
          </div>
          <div className="flex items-start gap-2 rounded-md bg-warning/10 text-warning-foreground p-3 text-sm">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>Este lançamento requer autorização de supervisor.</span>
          </div>
          <div className="space-y-1.5">
            <Label>Senha do supervisor</Label>
            <Input
              type="password"
              autoFocus
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErro(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleAutorizar()}
            />
            {erro && <p className="text-sm text-destructive">{erro}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleAutorizar} disabled={!senha}>Autorizar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
