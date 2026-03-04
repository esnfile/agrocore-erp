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
  Server,
  Layers,
  Component,
  AppWindow,
  Lock,
  ShoppingCart,
  Calculator,
  Table2,
  Ruler,
  type LucideIcon,
} from "lucide-react";

export interface MenuItem {
  title: string;
  icon: LucideIcon;
  url?: string;
  children?: MenuItem[];
}

export interface Module {
  title: string;
  icon: LucideIcon;
  items: MenuItem[];
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
      {
        title: "Tabelas Gerais",
        icon: Layers,
        children: [
          {
            title: "Grupo Empresarial",
            icon: GitBranch,
            children: [
              { title: "Grupos", url: "/admin/grupos", icon: GitBranch },
              { title: "Empresas", url: "/admin/empresas", icon: Building2 },
              { title: "Filiais", url: "/admin/filiais", icon: Building2 },
            ],
          },
          {
            title: "Pessoas",
            icon: Contact,
            children: [
              { title: "Pessoas", url: "/cadastros/pessoas", icon: Contact },
              { title: "Grupo de Pessoas", url: "/cadastros/grupo-pessoas", icon: Users },
            ],
          },
        ],
      },
      {
        title: "GerSys",
        icon: Server,
        children: [
          {
            title: "Usuários",
            icon: Users,
            children: [
              { title: "Usuários", url: "/admin/usuarios", icon: Users },
              { title: "Permissões", url: "/admin/permissoes", icon: ShieldCheck },
            ],
          },
          {
            title: "Módulos e Programas",
            icon: Layers,
            children: [
              { title: "Módulos", url: "/admin/gersys_modulos", icon: Component },
              { title: "Sub-Módulos", url: "/admin/gersys_submodulos", icon: Layers },
              { title: "Programas", url: "/admin/gersys_programas", icon: AppWindow },
              { title: "Permissões", url: "/admin/gersys_permissoes", icon: Lock },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Cadastros",
    icon: Package,
    items: [
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
    title: "Produtos e Estoque",
    icon: Package,
    items: [
      {
        title: "Central de Compras",
        icon: ShoppingCart,
        children: [
          { title: "Entrada de Mercadoria", url: "/produtos-estoque/entrada-mercadoria", icon: ArrowDownCircle },
          { title: "Pedido de Compra", url: "/produtos-estoque/pedido-compra", icon: FileText },
          { title: "Cotação de Preços", url: "/produtos-estoque/cotacao-precos", icon: DollarSign },
          { title: "Liberação de Pedidos", url: "/produtos-estoque/liberacao-pedidos", icon: ShieldCheck },
          { title: "Requisição de Compra", url: "/produtos-estoque/requisicao-compra", icon: FileText },
        ],
      },
      {
        title: "Tabelas",
        icon: Layers,
        children: [
          { title: "Tipo de Produto", url: "/produtos-estoque/tipo-produto", icon: Tags },
          { title: "Marca de Produto", url: "/produtos-estoque/marca-produto", icon: Tags },
          { title: "Divisão de Produto", url: "/produtos-estoque/divisao-produto", icon: Tags },
          {
            title: "Classificação",
            icon: Layers,
            children: [
              { title: "Seção", url: "/produtos-estoque/secao-produto", icon: Component },
              { title: "Grupo", url: "/produtos-estoque/grupo-produto", icon: Component },
              { title: "Subgrupo", url: "/produtos-estoque/subgrupo-produto", icon: Component },
            ],
          },
          { title: "Coeficientes", url: "/produtos-estoque/coeficientes", icon: Calculator },
          { title: "Tabela de Preços", url: "/produtos-estoque/tabela-precos", icon: Table2 },
          { title: "Unidades de Medida", url: "/produtos-estoque/unidades-medida", icon: Ruler },
        ],
      },
      { title: "Produtos", url: "/produtos-estoque/produtos", icon: Package },
      {
        title: "Auxiliares",
        icon: Server,
        children: [
          { title: "Estrutura de Estoque", url: "/produtos-estoque/estrutura-estoque", icon: WarehouseIcon },
          { title: "Pontos de Estoque", url: "/produtos-estoque/pontos-estoque", icon: WarehouseIcon },
          { title: "Movimentação de Estoque", url: "/produtos-estoque/movimentacao-estoque", icon: ArrowDownCircle },
          { title: "Consulta de Estoque", url: "/produtos-estoque/consulta-estoque", icon: BarChart3 },
          { title: "Inventário de Estoque", url: "/produtos-estoque/inventario-estoque", icon: BarChart3 },
        ],
      },
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
