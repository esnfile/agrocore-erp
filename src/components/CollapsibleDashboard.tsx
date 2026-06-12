import { useState, useEffect, type ReactNode } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, BarChart3, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleDashboardProps {
  title: string;
  /** Carrega dados na primeira expansão. Chamado apenas uma vez. */
  onFirstExpand?: () => Promise<void> | void;
  loading?: boolean;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export function CollapsibleDashboard({
  title,
  onFirstExpand,
  loading = false,
  children,
  className,
  defaultOpen = false,
}: CollapsibleDashboardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [loadedOnce, setLoadedOnce] = useState(defaultOpen);

  useEffect(() => {
    if (open && !loadedOnce && onFirstExpand) {
      setLoadedOnce(true);
      void onFirstExpand();
    }
  }, [open, loadedOnce, onFirstExpand]);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn("mb-4 rounded-lg border bg-card shadow-sm overflow-hidden", className)}
    >
      <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{open ? "Recolher" : "Expandir"}</span>
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
        <div className="border-t p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Carregando dados...</span>
            </div>
          ) : (
            children
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
