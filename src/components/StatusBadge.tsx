import { memo } from "react";
import {
  Clock,
  DollarSign,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileEdit,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Global StatusBadge — single source of truth for operational/financial status visuals.
 *
 * RULES:
 * - Same status → same icon + same color in EVERY screen.
 * - Centralized config in STATUS_CONFIG below; never hardcode status colors elsewhere.
 * - Romaneio module keeps its own dedicated palette (intentional — see romaneio-types.ts).
 */

type StatusGroup =
  | "wait"
  | "billed"
  | "progress"
  | "done"
  | "doneStrong"
  | "canceled"
  | "overdue"
  | "draft";

interface GroupStyle {
  icon: LucideIcon;
  classes: string;
}

const GROUP_STYLES: Record<StatusGroup, GroupStyle> = {
  // Aguardando / pendência
  wait: {
    icon: Clock,
    classes: "bg-amber-100 text-amber-800 border-amber-300",
  },
  // Faturado
  billed: {
    icon: DollarSign,
    classes: "bg-orange-100 text-orange-800 border-orange-300",
  },
  // Processamento em curso
  progress: {
    icon: RefreshCw,
    classes: "bg-purple-100 text-purple-800 border-purple-300",
  },
  // Concluído (verde claro)
  done: {
    icon: CheckCircle2,
    classes: "bg-green-100 text-green-800 border-green-300",
  },
  // Concluído destaque (LIQUIDADO — verde primário do tema)
  doneStrong: {
    icon: CheckCircle2,
    classes: "bg-primary text-primary-foreground border-primary",
  },
  // Cancelado / inativo
  canceled: {
    icon: XCircle,
    classes: "bg-gray-200 text-gray-700 border-gray-400",
  },
  // Atrasado / vencido
  overdue: {
    icon: AlertCircle,
    classes: "bg-red-100 text-red-800 border-red-300",
  },
  // Rascunho
  draft: {
    icon: FileEdit,
    classes: "bg-slate-100 text-slate-700 border-slate-300",
  },
};

interface StatusEntry {
  group: StatusGroup;
  label: string;
}

// Canonical status → group + display label
const STATUS_CONFIG: Record<string, StatusEntry> = {
  // Wait / pendência
  ABERTO: { group: "wait", label: "Aberto" },
  PENDENTE: { group: "wait", label: "Pendente" },
  PREVISTO: { group: "wait", label: "Previsto" },
  AGUARDANDO: { group: "wait", label: "Aguardando" },

  // Faturado
  FATURADO: { group: "billed", label: "Faturado" },

  // Em progresso
  PARCIAL: { group: "progress", label: "Parcial" },
  EM_ANDAMENTO: { group: "progress", label: "Em andamento" },
  PROCESSANDO: { group: "progress", label: "Processando" },
  BAIXADO_PARCIAL: { group: "progress", label: "Baixado parcial" },

  // Done
  PAGO: { group: "done", label: "Pago" },
  RECEBIDO: { group: "done", label: "Recebido" },
  FINALIZADO: { group: "done", label: "Finalizado" },
  ATIVO: { group: "done", label: "Ativo" },

  // Done destaque
  LIQUIDADO: { group: "doneStrong", label: "Liquidado" },

  // Canceled
  CANCELADO: { group: "canceled", label: "Cancelado" },
  CANCELADA: { group: "canceled", label: "Cancelada" },
  INATIVO: { group: "canceled", label: "Inativo" },

  // Overdue
  ATRASADO: { group: "overdue", label: "Atrasado" },
  VENCIDA: { group: "overdue", label: "Vencida" },
  VENCIDO: { group: "overdue", label: "Vencido" },

  // Draft
  RASCUNHO: { group: "draft", label: "Rascunho" },
};

export type StatusBadgeSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<StatusBadgeSize, { wrapper: string; icon: number }> = {
  sm: { wrapper: "px-2 py-0.5 text-xs gap-1", icon: 12 },
  md: { wrapper: "px-2.5 py-1 text-sm gap-1.5", icon: 14 },
  lg: { wrapper: "px-3 py-1.5 text-base gap-2", icon: 16 },
};

export interface StatusBadgeProps {
  status: string;
  size?: StatusBadgeSize;
  className?: string;
  /** Override the displayed label (icon + colors stay derived from status) */
  label?: string;
}

function StatusBadgeImpl({ status, size = "sm", className, label }: StatusBadgeProps) {
  if (!status || typeof status !== "string") {
    console.error("[StatusBadge] invalid status:", status);
    return null;
  }
  const key = status.trim().toUpperCase();
  const entry = STATUS_CONFIG[key];

  if (!entry) {
    console.error(`[StatusBadge] unknown status "${status}". Add it to STATUS_CONFIG.`);
    // Safe fallback: render as draft style with raw text
    const fb = GROUP_STYLES.draft;
    const FbIcon = fb.icon;
    return (
      <span
        aria-label={`Status: ${status}`}
        className={cn(
          "inline-flex items-center rounded-md border font-semibold whitespace-nowrap",
          fb.classes,
          SIZE_CLASSES[size].wrapper,
          className,
        )}
      >
        <FbIcon size={SIZE_CLASSES[size].icon} aria-hidden />
        {label ?? status}
      </span>
    );
  }

  const style = GROUP_STYLES[entry.group];
  const Icon = style.icon;
  const display = label ?? entry.label;

  return (
    <span
      aria-label={`Status: ${display}`}
      className={cn(
        "inline-flex items-center rounded-md border font-semibold whitespace-nowrap",
        style.classes,
        SIZE_CLASSES[size].wrapper,
        className,
      )}
    >
      <Icon size={SIZE_CLASSES[size].icon} aria-hidden />
      {display}
    </span>
  );
}

export const StatusBadge = memo(StatusBadgeImpl);
