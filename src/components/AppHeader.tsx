import { SidebarTrigger } from "@/components/ui/sidebar";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, GitBranch, LogOut, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function AppHeader() {
  const { empresas, filiais, empresaAtual, filialAtual, setEmpresaId, setFilialId } =
    useOrganization();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6" />

      {/* Empresa selector */}
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <Select value={empresaAtual?.id ?? ""} onValueChange={setEmpresaId}>
          <SelectTrigger className="h-8 w-[200px] border-none bg-muted/50 text-sm">
            <SelectValue placeholder="Empresa" />
          </SelectTrigger>
          <SelectContent>
            {empresas.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.nomeFantasia}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filial selector */}
      <div className="flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-muted-foreground" />
        <Select value={filialAtual?.id ?? ""} onValueChange={setFilialId}>
          <SelectTrigger className="h-8 w-[200px] border-none bg-muted/50 text-sm">
            <SelectValue placeholder="Filial" />
          </SelectTrigger>
          <SelectContent>
            {filiais.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted/50">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              JA
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium md:inline">João Admin</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
