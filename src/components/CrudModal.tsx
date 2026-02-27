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
}

export function CrudModal({ open, onClose, title, saving, onSave, children }: CrudModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-2">{children}</div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
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
