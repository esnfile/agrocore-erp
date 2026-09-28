import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  autorizacaoService,
  ROTULO_ACAO_SUPERVISIONADA,
  type AcaoSupervisionada,
  type AlvoAutorizacao,
} from "@/lib/services";

interface Props {
  open: boolean;
  acao: AcaoSupervisionada;
  alvo: AlvoAutorizacao;
  /** Quando informado, exige justificativa com esse mínimo de caracteres. */
  minJustificativa?: number;
  aviso?: string;
  onClose: () => void;
  onAuthorized: (justificativa: string, token?: string) => void;
  children?: React.ReactNode;
}

/**
 * Reautenticação de supervisor: valida a SENHA REAL do usuário logado e
 * registra o resultado no log de autorizações (inclusive recusas e cancelamentos).
 */
export function AutorizacaoSupervisorDialog({
  open, acao, alvo, minJustificativa, aviso, onClose, onAuthorized, children,
}: Props) {
  const [senha, setSenha] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const exigeJustificativa = typeof minJustificativa === "number" && minJustificativa > 0;
  const justificativaOk = !exigeJustificativa || justificativa.trim().length >= (minJustificativa ?? 0);

  const reset = () => { setSenha(""); setJustificativa(""); setErro(""); };

  const handleClose = async () => {
    await autorizacaoService.registrarTentativa(acao, alvo, "CANCELADO", justificativa.trim());
    reset();
    onClose();
  };

  const handleAutorizar = async () => {
    if (!justificativaOk) {
      setErro(`Justificativa obrigatória com no mínimo ${minJustificativa} caracteres.`);
      return;
    }
    setEnviando(true);
    const res = await autorizacaoService.validarSupervisor(senha, {
      acao, alvo, justificativa: justificativa.trim(),
    });
    setEnviando(false);
    if (!res.ok) { setErro(res.mensagem); return; }
    const texto = justificativa.trim();
    reset();
    onAuthorized(texto, res.token);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) void handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Autorização de Supervisor</DialogTitle>
          <DialogDescription>{ROTULO_ACAO_SUPERVISIONADA[acao]}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {children}
          <div className="flex items-start gap-2 rounded-md bg-warning/10 text-warning-foreground p-3 text-sm">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{aviso ?? "Esta operação exige autorização e fica registrada no log de autorizações."}</span>
          </div>

          {exigeJustificativa && (
            <div className="space-y-1.5">
              <Label>Justificativa (mínimo {minJustificativa} caracteres)</Label>
              <Textarea
                value={justificativa}
                onChange={(e) => { setJustificativa(e.target.value); setErro(""); }}
                rows={3}
                placeholder="Descreva o motivo desta operação"
              />
              <p className="text-xs text-muted-foreground">{justificativa.trim().length} caractere(s)</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Sua senha</Label>
            <Input
              type="password"
              autoFocus
              autoComplete="current-password"
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErro(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleAutorizar()}
            />
            {erro && <p className="text-sm text-destructive">{erro}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => void handleClose()} disabled={enviando}>Cancelar</Button>
          <Button onClick={handleAutorizar} disabled={!senha || enviando || !justificativaOk}>
            {enviando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Autorizar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
