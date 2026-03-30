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
  Scale,
  ClipboardList,
  Sprout,
  Leaf,
  CalendarDays,
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
              { title: "Pessoas", url: "/admin/pessoas", icon: Contact },
              { title: "Grupo de Pessoas", url: "/admin/grupo-pessoas", icon: Users },
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
    title: "Fazenda/Agricultura",
    icon: Sprout,
    items: [
      { title: "Gestão de Safras", url: "/fazenda/safras", icon: CalendarDays },
      {
        title: "Planejamento",
        icon: Layers,
        children: [
          { title: "Cultivos", url: "/fazenda/cultivos", icon: Leaf },
          { title: "Romaneios de Colheitas", url: "/fazenda/romaneios-colheitas", icon: ClipboardList },
        ],
      },
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
        title: "Produtos",
        icon: Package,
        children: [
          { title: "Produtos", url: "/produtos-estoque/produtos", icon: Package },
          {
            title: "Estrutura",
            icon: Layers,
            children: [
              { title: "Tipo de Produto", url: "/produtos-estoque/tipo-produto", icon: Tags },
              { title: "Marca de Produto", url: "/produtos-estoque/marca-produto", icon: Tags },
              {
                title: "Classificação",
                icon: Layers,
                children: [
                  { title: "Divisão", url: "/produtos-estoque/divisao-produto", icon: Component },
                  { title: "Seção", url: "/produtos-estoque/secao-produto", icon: Component },
                  { title: "Grupo", url: "/produtos-estoque/grupo-produto", icon: Component },
                  { title: "Subgrupo", url: "/produtos-estoque/subgrupo-produto", icon: Component },
                ],
              },
            ],
          },
          {
            title: "Configurações",
            icon: Server,
            children: [
              {
                title: "Custos e Vendas",
                icon: DollarSign,
                children: [
                  { title: "Coeficientes", url: "/produtos-estoque/coeficientes", icon: Calculator },
                  { title: "Tabela de Preços", url: "/produtos-estoque/tabela-precos", icon: Table2 },
                ],
              },
              { title: "Unidade de Medidas", url: "/produtos-estoque/unidades-medida", icon: Ruler },
              { title: "Controle de Qualidade", url: "/produtos-estoque/classificacao-tipos", icon: Tags },
            ],
          },
        ],
      },
      {
        title: "Auxiliares",
        icon: Server,
        children: [
          { title: "Pontos de Estoque", url: "/produtos-estoque/pontos-estoque", icon: WarehouseIcon },
          { title: "Movimentação de Estoque", url: "/produtos-estoque/movimentacao-estoque", icon: ArrowDownCircle },
          { title: "Consulta de Estoque", url: "/produtos-estoque/consulta-estoque", icon: BarChart3 },
          { title: "Inventário de Estoque", url: "/produtos-estoque/inventario-estoque", icon: BarChart3 },
        ],
      },
    ],
  },
  {
    title: "Comercial",
    icon: FileText,
    items: [
      { title: "Contratos", url: "/comercial/contratos", icon: FileText },
      {
        title: "Gestão de Descontos",
        icon: Tags,
        children: [
          { title: "Condições e Descontos", url: "/comercial/condicoes-descontos", icon: Table2 },
        ],
      },
      {
        title: "Configurações Gerais",
        icon: Settings,
        children: [
          { title: "Moedas e Cotações", url: "/comercial/moedas-cotacoes", icon: DollarSign },
        ],
      },
    ],
  },
  {
    title: "Romaneios",
    icon: ClipboardList,
    items: [
      { title: "Romaneios", url: "/romaneios", icon: Scale },
      {
        title: "Cadastros",
        icon: Layers,
        children: [
          { title: "Motoristas", url: "/romaneios/motoristas", icon: Contact },
          { title: "Veículos", url: "/romaneios/veiculos", icon: Truck },
        ],
      },
    ],
  },
  {
    title: "Financeiro",
    icon: DollarSign,
    items: [
      { title: "Contas", url: "/financeiro/contas", icon: FileText },
      { title: "Caixa e Bancos", url: "/financeiro/movimentacoes", icon: DollarSign },
      { title: "Adiantamentos", url: "/financeiro/adiantamentos", icon: ArrowDownCircle },
      {
        title: "Tabelas",
        icon: Layers,
        children: [
          { title: "Bancos", url: "/financeiro/bancos", icon: Building2 },
          { title: "Tipo de Contas", url: "/financeiro/tipo-contas", icon: Tags },
          { title: "Contas Financeiras", url: "/financeiro/contas-financeiras", icon: DollarSign },
          { title: "Tipos de Lançamento", url: "/financeiro/tipos-lancamento", icon: Tags },
          { title: "Formas de Pagamento", url: "/financeiro/formas-pagamento", icon: Tags },
          { title: "Plano de Contas", url: "/financeiro/plano-contas", icon: Layers },
          { title: "Centros de Custo", url: "/financeiro/centros-custo", icon: Tags },
        ],
      },
      { title: "Fluxo de Caixa", url: "/financeiro/fluxo-caixa", icon: BarChart3 },
    ],
  },
];
