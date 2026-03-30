import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { AppLayout } from "@/components/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import EmpresasPage from "@/pages/admin/EmpresasPage";
import GruposPage from "@/pages/admin/GruposPage";
import FiliaisPage from "@/pages/admin/FiliaisPage";
import GrupoPessoasPage from "@/pages/cadastros/GrupoPessoasPage";
import PessoasPage from "@/pages/cadastros/PessoasPage";
import TipoProdutoPage from "@/pages/produtos-estoque/TipoProdutoPage";
import MarcaProdutoPage from "@/pages/produtos-estoque/MarcaProdutoPage";
import DivisaoProdutoPage from "@/pages/produtos-estoque/DivisaoProdutoPage";
import SecaoProdutoPage from "@/pages/produtos-estoque/SecaoProdutoPage";
import GrupoProdutoPage from "@/pages/produtos-estoque/GrupoProdutoPage";
import SubgrupoProdutoPage from "@/pages/produtos-estoque/SubgrupoProdutoPage";
import CoeficientesPage from "@/pages/produtos-estoque/CoeficientesPage";
import TabelaPrecosPage from "@/pages/produtos-estoque/TabelaPrecosPage";
import UnidadesMedidaPage from "@/pages/produtos-estoque/UnidadesMedidaPage";
import ProdutosEstoquePage from "@/pages/produtos-estoque/ProdutosPage";
import PontosEstoquePage from "@/pages/produtos-estoque/PontosEstoquePage";
import MovimentacaoEstoquePage from "@/pages/produtos-estoque/MovimentacaoEstoquePage";
import ConsultaEstoquePage from "@/pages/produtos-estoque/ConsultaEstoquePage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import SafrasPage from "@/pages/fazenda/SafrasPage";
import CultivosPage from "@/pages/fazenda/CultivosPage";
import RomaneiosColheitasPage from "@/pages/fazenda/RomaneiosColheitasPage";
import ContratosPage from "@/pages/comercial/ContratosPage";
import CondicoesDescontosPage from "@/pages/comercial/CondicoesDescontosPage";
import MoedasCotacoesPage from "@/pages/comercial/MoedasCotacoesPage";
import ClassificacaoTiposPage from "@/pages/produtos-estoque/ClassificacaoTiposPage";
import ContasFinanceiroPage from "@/pages/financeiro/ContasPage";
import FluxoCaixaPage from "@/pages/financeiro/FluxoCaixaPage";
import BancosPage from "@/pages/financeiro/BancosPage";
import TipoContasPage from "@/pages/financeiro/TipoContasPage";
import ContasFinanceirasPage from "@/pages/financeiro/ContasFinanceirasPage";
import TiposLancamentoPage from "@/pages/financeiro/TiposLancamentoPage";
import FormasPagamentoPage from "@/pages/financeiro/FormasPagamentoPage";
import PlanoContasPage from "@/pages/financeiro/PlanoContasPage";
import CentrosCustoPage from "@/pages/financeiro/CentrosCustoPage";
import MovimentacoesPage from "@/pages/financeiro/MovimentacoesPage";
import AdiantamentosPage from "@/pages/financeiro/AdiantamentosPage";
import RomaneiosPage from "@/pages/romaneios/RomaneiosPage";
import MotoristasPage from "@/pages/romaneios/MotoristasPage";
import VeiculosPage from "@/pages/romaneios/VeiculosPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <OrganizationProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              {/* Administrativo — Grupo Empresarial */}
              <Route path="/admin/grupos" element={<GruposPage />} />
              <Route path="/admin/empresas" element={<EmpresasPage />} />
              <Route path="/admin/filiais" element={<FiliaisPage />} />
              {/* Administrativo — GerSys */}
              <Route path="/admin/usuarios" element={<PlaceholderPage />} />
              <Route path="/admin/gersys_modulos" element={<PlaceholderPage />} />
              <Route path="/admin/gersys_submodulos" element={<PlaceholderPage />} />
              <Route path="/admin/gersys_programas" element={<PlaceholderPage />} />
              <Route path="/admin/gersys_permissoes" element={<PlaceholderPage />} />
              {/* Pessoas */}
              <Route path="/admin/pessoas" element={<PessoasPage />} />
              <Route path="/admin/grupo-pessoas" element={<GrupoPessoasPage />} />
              {/* Fazenda/Agricultura */}
              <Route path="/fazenda/safras" element={<SafrasPage />} />
              <Route path="/fazenda/cultivos" element={<CultivosPage />} />
              <Route path="/fazenda/romaneios-colheitas" element={<RomaneiosColheitasPage />} />
              {/* Comercial */}
              <Route path="/comercial/contratos" element={<ContratosPage />} />
              <Route path="/comercial/condicoes-descontos" element={<CondicoesDescontosPage />} />
              <Route path="/comercial/moedas-cotacoes" element={<MoedasCotacoesPage />} />
              {/* Financeiro */}
              <Route path="/financeiro/contas" element={<ContasFinanceiroPage />} />
              <Route path="/financeiro/fluxo-caixa" element={<FluxoCaixaPage />} />
              <Route path="/financeiro/bancos" element={<BancosPage />} />
              <Route path="/financeiro/tipo-contas" element={<TipoContasPage />} />
              <Route path="/financeiro/contas-financeiras" element={<ContasFinanceirasPage />} />
              <Route path="/financeiro/tipos-lancamento" element={<TiposLancamentoPage />} />
              <Route path="/financeiro/formas-pagamento" element={<FormasPagamentoPage />} />
              <Route path="/financeiro/plano-contas" element={<PlanoContasPage />} />
              <Route path="/financeiro/centros-custo" element={<CentrosCustoPage />} />
              <Route path="/financeiro/movimentacoes" element={<MovimentacoesPage />} />
              <Route path="/financeiro/adiantamentos" element={<AdiantamentosPage />} />
              {/* Romaneios */}
              <Route path="/romaneios" element={<RomaneiosPage />} />
              <Route path="/romaneios/motoristas" element={<MotoristasPage />} />
              <Route path="/romaneios/veiculos" element={<VeiculosPage />} />
              {/* Produtos e Estoque — Tabelas */}
              <Route path="/produtos-estoque/tipo-produto" element={<TipoProdutoPage />} />
              <Route path="/produtos-estoque/marca-produto" element={<MarcaProdutoPage />} />
              <Route path="/produtos-estoque/divisao-produto" element={<DivisaoProdutoPage />} />
              <Route path="/produtos-estoque/secao-produto" element={<SecaoProdutoPage />} />
              <Route path="/produtos-estoque/grupo-produto" element={<GrupoProdutoPage />} />
              <Route path="/produtos-estoque/subgrupo-produto" element={<SubgrupoProdutoPage />} />
              <Route path="/produtos-estoque/coeficientes" element={<CoeficientesPage />} />
              <Route path="/produtos-estoque/tabela-precos" element={<TabelaPrecosPage />} />
              <Route path="/produtos-estoque/unidades-medida" element={<UnidadesMedidaPage />} />
              {/* Produtos e Estoque — Placeholders */}
              <Route path="/produtos-estoque/entrada-mercadoria" element={<PlaceholderPage />} />
              <Route path="/produtos-estoque/pedido-compra" element={<PlaceholderPage />} />
              <Route path="/produtos-estoque/cotacao-precos" element={<PlaceholderPage />} />
              <Route path="/produtos-estoque/liberacao-pedidos" element={<PlaceholderPage />} />
              <Route path="/produtos-estoque/requisicao-compra" element={<PlaceholderPage />} />
              <Route path="/produtos-estoque/produtos" element={<ProdutosEstoquePage />} />
              <Route path="/produtos-estoque/pontos-estoque" element={<PontosEstoquePage />} />
              <Route path="/produtos-estoque/movimentacao-estoque" element={<MovimentacaoEstoquePage />} />
              <Route path="/produtos-estoque/consulta-estoque" element={<ConsultaEstoquePage />} />
              <Route path="/produtos-estoque/inventario-estoque" element={<PlaceholderPage />} />
              <Route path="/produtos-estoque/classificacao-tipos" element={<ClassificacaoTiposPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </OrganizationProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;