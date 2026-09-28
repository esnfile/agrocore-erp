import { AutorizacaoSupervisorDialog } from "@/components/AutorizacaoSupervisorDialog";

interface Props {
  open: boolean;
  onClose: () => void;
  onAuthorized: () => void;
  resumo: { cliente: string; valor: number; referencia: string; pessoaId?: string };
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function AutorizacaoSupervisorModal({ open, onClose, onAuthorized, resumo }: Props) {
  return (
    <AutorizacaoSupervisorDialog
      open={open}
      acao="ADIANTAMENTO_CLIENTE"
      alvo={{
        tipo: "Adiantamento de Cliente",
        id: resumo.pessoaId ?? resumo.referencia,
        descricao: `${resumo.cliente} — ${fmt(resumo.valor)} — ${resumo.referencia}`,
      }}
      aviso="Este lançamento requer autorização de supervisor e fica registrado no log de autorizações."
      onClose={onClose}
      onAuthorized={() => onAuthorized()}
    >
      <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
        <div><span className="text-muted-foreground">Cliente: </span><span className="font-medium">{resumo.cliente}</span></div>
        <div><span className="text-muted-foreground">Valor: </span><span className="font-medium">{fmt(resumo.valor)}</span></div>
        <div><span className="text-muted-foreground">Referência: </span><span>{resumo.referencia}</span></div>
      </div>
    </AutorizacaoSupervisorDialog>
  );
}
