import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CrudModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  saving?: boolean;
  onSave?: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export function CrudModal({ open, onClose, title, saving, onSave, children, maxWidth }: CrudModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={`${maxWidth ?? "sm:max-w-2xl"} flex flex-col max-h-[80vh]`}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="py-4 px-2">{children}</div>
        </div>
        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={saving} className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive">
            Cancelar
          </Button>
          {onSave && (
            <Button onClick={onSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
