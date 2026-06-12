import { Badge } from "@/components/ui/badge";
import { STATUS_BADGE_CLASSES, STATUS_ICONS, STATUS_LABELS, type StatusRomaneioNew } from "../romaneio-types";

interface Props {
  status: string;
  className?: string;
}

export function RomaneioStatusBadge({ status, className = "" }: Props) {
  const key = status as StatusRomaneioNew;
  const Icon = STATUS_ICONS[key];
  return (
    <Badge
      variant="outline"
      className={`text-[10px] inline-flex items-center gap-1 ${STATUS_BADGE_CLASSES[key] || ""} ${className}`}
    >
      {Icon && <Icon className="h-3 w-3" aria-hidden />}
      {STATUS_LABELS[key] || status}
    </Badge>
  );
}
