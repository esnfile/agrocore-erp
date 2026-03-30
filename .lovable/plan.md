

# Plan: Ajustar Menu Comercial e Refinar Telas

## Estado Atual

O menu COMERCIAL **ja esta com a estrutura correta** em `modules.ts`:
- Contratos (rota funcional, pagina completa com 2000+ linhas)
- Gestao de Descontos > Condicoes e Descontos (pagina basica com tabs, sem CRUD real)
- Configuracoes Gerais > Moedas e Cotacoes (pagina basica com tabs, sem CRUD real)

**O que precisa mudar:**

### 1. CondicoesDescontosPage — Refatorar completamente
A pagina atual e muito simples: apenas 3 tabs com DataTable estatica, sem modal de edicao, sem filtros, sem abas inline de configuracao, relacionamentos por nome ao inves de UUID.

**Alteracoes:**
- Adicionar filtros no topo (empresa, tipo, aplicacao, status)
- Mudar mock data para usar UUIDs e `empresaId` ao inves de nome de empresa
- Listagem principal unificada de tipos de desconto com colunas: tipo, descricao, empresa, valor padrao, aplicacao (contrato/romaneio/ambos), obrigatorio, status
- Mock data com tipos agro reais: FETHAB, FUNRURAL, TAXA_ARMAZEM, CLASSIFICACAO, IMPUREZA, UMIDADE, ARDIDOS, AVARIADOS
- Modal de edicao com **3 abas inline**:
  - **Dados Basicos**: nome, descricao, categoria, tipo (percentual/fixo unitario/fixo total), ordem aplicacao, ativo
  - **Configuracao por Empresa**: tabela empresa permitida, valor padrao, obrigatorio, aplicacao, ativo, observacoes
  - **Historico**: tabela read-only de alteracoes (mock)
- Acoes por linha: editar, excluir (soft delete)

### 2. MoedasCotacoesPage — Refinar
A pagina atual e funcional mas basica. Precisa de:
- Adicionar filtros (moeda, status, periodo)
- Coluna "cotacao atual" na aba Moedas
- Acoes por linha: editar, excluir
- Modal CRUD para moedas
- Ao selecionar moeda na listagem, filtrar cotacoes automaticamente

### 3. ContratosPage — Ja esta completa
A pagina de Contratos ja tem 2000+ linhas com modal multi-abas, fixacao, liquidacao, romaneios read-only, filtros e validacoes. **Nenhuma alteracao necessaria** — ja atende todos os requisitos.

### 4. Menu modules.ts — Ja correto
A estrutura ja e exatamente a solicitada. Nenhuma alteracao necessaria.

## Arquivos Modificados

1. `src/pages/comercial/CondicoesDescontosPage.tsx` — reescrita completa com modal 3 abas, filtros, mock agro, CRUD
2. `src/pages/comercial/MoedasCotacoesPage.tsx` — adicionar filtros, modal CRUD, acoes por linha

## Estimativa
~2 arquivos, foco em UI/navegacao, dados mockados, sem logica de negocio.

