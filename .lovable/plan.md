

## AgroERP — Fase 0: Fundação Estrutural do Frontend

### 1. Layout Enterprise Base
- Sidebar lateral com navegação hierárquica (Módulos → Submódulos → Programas)
- Header fixo com:
  - Logo AgroERP
  - Seletor de **Empresa** (dropdown)
  - Seletor de **Filial** (dropdown, filtrado pela empresa selecionada)
  - Menu do usuário (avatar, nome, logout)
- Área de conteúdo principal com breadcrumb automático
- Layout responsivo (sidebar colapsável em telas menores)

### 2. Contexto Organizacional (Empresa/Filial)
- Context Provider global que armazena empresa e filial selecionados
- Toda tela operacional lê desse contexto
- Troca de empresa reseta a filial automaticamente
- Dados mockados para desenvolvimento (2 empresas, 3 filiais)

### 3. Sistema de Navegação por Módulos
- Estrutura de rotas espelhando a hierarquia do PRD:
  - **Administrativo:** Grupos, Empresas, Filiais, Usuários, Permissões
  - **Cadastros:** Pessoas, Produtos, Categorias, Locais de Estoque
  - **Armazém:** Contratos, Entregas, Estoque
  - **Financeiro:** Contas a Receber, Contas a Pagar
  - **Dashboard** (placeholder)
- Sidebar renderizada dinamicamente a partir de configuração de módulos
- Ícones por módulo (Lucide)

### 4. Página de Listagem Padrão (Template Reutilizável)
- Componente genérico de listagem com:
  - Filtros de empresa/filial (pré-preenchidos do contexto)
  - Filtro de período (date range picker)
  - Campo de busca textual
  - Tabela com ordenação por coluna
  - Paginação
  - Botões de ação (Novo, Editar, Excluir com soft delete)
- Primeira aplicação: tela de listagem de **Empresas**

### 5. Página de Cadastro Padrão (Template Reutilizável)
- Componente genérico de formulário com:
  - Validação via Zod
  - Campos de auditoria exibidos (somente leitura)
  - Botões Salvar / Cancelar
  - Feedback via toast (sucesso/erro)
- Primeira aplicação: formulário de cadastro de **Empresa**

### 6. Dados Mockados e Service Layer
- Camada de serviços com interface preparada para API real
- Dados mock em JSON para todas as entidades da Fase 0 (Grupos, Empresas, Filiais, Usuários)
- Simulação de latência para UX realista
- Troca futura: apenas substituir implementação do service, sem alterar componentes

### 7. Tema e Design System
- Paleta de cores enterprise (tons neutros + verde agro como accent)
- Tipografia consistente
- Estados visuais padronizados (loading, empty, error)
- Dark mode preparado (via next-themes já instalado)

