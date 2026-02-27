import { useLocation } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Construction } from "lucide-react";

export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const name = pathname.split("/").filter(Boolean).pop() ?? "Página";
  const title = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ");

  return (
    <>
      <PageHeader title={title} description="Módulo em construção" />
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Construction className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-lg">Esta tela será implementada nas próximas fases.</p>
      </div>
    </>
  );
}
