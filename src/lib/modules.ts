import {
  LayoutDashboard,
  Settings,
  Building2,
  GitBranch,
  Users,
  ShieldCheck,
  Contact,
  Package,
  Tags,
  Warehouse as WarehouseIcon,
  FileText,
  Truck,
  BarChart3,
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  type LucideIcon,
} from "lucide-react";

export interface ModuleItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface Module {
  title: string;
  icon: LucideIcon;
  items: ModuleItem[];
}

export const modules: Module[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [{ title: "Visão Geral", url: "/dashboard", icon: BarChart3 }],
  },
  {
    title: "Administrativo",
    icon: Settings,
    items: [
      { title: "Grupos", url: "/admin/grupos", icon: GitBranch },
      { title: "Empresas", url: "/admin/empresas", icon: Building2 },
      { title: "Filiais", url: "/admin/filiais", icon: Building2 },
      { title: "Usuários", url: "/admin/usuarios", icon: Users },
      { title: "Permissões", url: "/admin/permissoes", icon: ShieldCheck },
    ],
  },
  {
    title: "Cadastros",
    icon: Contact,
    items: [
      { title: "Pessoas", url: "/cadastros/pessoas", icon: Contact },
      { title: "Produtos", url: "/cadastros/produtos", icon: Package },
      { title: "Categorias", url: "/cadastros/categorias", icon: Tags },
      { title: "Locais de Estoque", url: "/cadastros/locais-estoque", icon: WarehouseIcon },
    ],
  },
  {
    title: "Armazém",
    icon: WarehouseIcon,
    items: [
      { title: "Contratos", url: "/armazem/contratos", icon: FileText },
      { title: "Entregas", url: "/armazem/entregas", icon: Truck },
      { title: "Estoque", url: "/armazem/estoque", icon: BarChart3 },
    ],
  },
  {
    title: "Financeiro",
    icon: DollarSign,
    items: [
      { title: "Contas a Receber", url: "/financeiro/contas-receber", icon: ArrowDownCircle },
      { title: "Contas a Pagar", url: "/financeiro/contas-pagar", icon: ArrowUpCircle },
    ],
  },
];
