import { useEffect, useState } from "react";
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
import { Building2, GitBranch, LogOut, Network, User, TrendingUp, TrendingDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cotacaoMoedaService } from "@/lib/services";
import type { CotacaoMoeda } from "@/lib/mock-data";

function CotacaoWidget() {
  const [usd, setUsd] = useState<CotacaoMoeda | undefined>(
    cotacaoMoedaService.obterUltima("moeda2", "moeda1")
  );
  const [eur, setEur] = useState<CotacaoMoeda | undefined>(
    cotacaoMoedaService.obterUltima("moeda3", "moeda1")
  );

  useEffect(() => {
    const update = () => {
      const { usd: u, eur: e } = cotacaoMoedaService.simularAtualizacao();
      setUsd(u);
      setEur(e);
    };
    const interval = setInterval(update, 10 * 60 * 1000); // 10 min
    return () => clearInterval(interval);
  }, []);

  const renderCotacao = (label: string, cot?: CotacaoMoeda) => {
    if (!cot) return null;
    const positivo = cot.variacaoPercentual >= 0;
    return (
      <div className="flex items-center gap-1 text-xs">
        <span className="font-medium text-foreground">{label}:</span>
        <span className="font-semibold text-foreground">{cot.valorCompra.toFixed(2)}</span>
        {positivo ? (
          <TrendingUp className="h-3 w-3 text-emerald-500" />
        ) : (
          <TrendingDown className="h-3 w-3 text-destructive" />
        )}
        <span className={positivo ? "text-emerald-500" : "text-destructive"}>
          {positivo ? "+" : ""}{cot.variacaoPercentual.toFixed(2)}%
        </span>
      </div>
    );
  };

  return (
    <div className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-1.5">
      {renderCotacao("USD", usd)}
      <Separator orientation="vertical" className="h-4" />
      {renderCotacao("EUR", eur)}
    </div>
  );
}

export function AppHeader() {
  const {
    grupos, empresas, filiais,
    grupoAtual, empresaAtual, filialAtual,
    setGrupoId, setEmpresaId, setFilialId,
  } = useOrganization();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6" />

      {/* Grupo selector */}
      <div className="flex items-center gap-2">
        <Network className="h-4 w-4 text-muted-foreground" />
        <Select value={grupoAtual?.id ?? ""} onValueChange={setGrupoId}>
          <SelectTrigger className="h-8 w-[180px] border-none bg-muted/50 text-sm">
            <SelectValue placeholder="Grupo" />
          </SelectTrigger>
          <SelectContent>
            {grupos.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empresa selector */}
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <Select value={empresaAtual?.id ?? ""} onValueChange={setEmpresaId}>
          <SelectTrigger className="h-8 w-[180px] border-none bg-muted/50 text-sm">
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
          <SelectTrigger className="h-8 w-[180px] border-none bg-muted/50 text-sm">
            <SelectValue placeholder="Filial" />
          </SelectTrigger>
          <SelectContent>
            {filiais.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.nomeRazao}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Cotação */}
      <CotacaoWidget />

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
