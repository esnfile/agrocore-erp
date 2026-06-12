import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DashboardAccent = "success" | "info" | "warning" | "destructive" | "primary";

const accentMap: Record<DashboardAccent, { border: string; icon: string }> = {
  success: { border: "border-l-success", icon: "text-success" },
  info: { border: "border-l-info", icon: "text-info" },
  warning: { border: "border-l-warning", icon: "text-warning" },
  destructive: { border: "border-l-destructive", icon: "text-destructive" },
  primary: { border: "border-l-primary", icon: "text-primary" },
};

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  accent?: DashboardAccent;
  hint?: string;
}

export function DashboardCard({ title, value, icon: Icon, accent = "primary", hint }: DashboardCardProps) {
  const a = accentMap[accent];
  return (
    <Card className={cn("border-l-4", a.border)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className={cn("h-4 w-4", a.icon)} />}
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold text-foreground truncate">{value}</p>
        {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}
