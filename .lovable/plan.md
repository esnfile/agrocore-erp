

## Plano: Correções Estruturais Pré-Contratos

### 1. Moedas e Cotações — `src/lib/mock-data.ts`

**Interface `Moeda`:** id, codigo (string 3), descricao (string 50), simbolo (string 5), ativo, grupoId, empresaId, filialId, auditoria completa.

**Interface `CotacaoMoeda`:** id, moedaOrigemId, moedaDestinoId, valorCompra, valorVenda, variacao, variacaoPercentual, valorMaximo, valorMinimo, dataHoraCotacao, fonte, grupoId, empresaId, filialId, auditoria completa.

**Mock data:** 3 moedas (BRL, USD, EUR). Cotações iniciais: USD/BRL e EUR/BRL com valores simulados.

### 2. Serviço Mock de Cotação — `src/lib/services.ts`

**`moedaService`:** CRUD padrão (listar, salvar, excluir).

**`cotacaoMoedaService`:** listar, obterUltima (por par de moedas), simularAtualizacao — gera valores aleatórios com variação ±2% sobre o valor anterior, salva novo registro.

### 3. Cotação no Header — `src/components/AppHeader.tsx`

Adicionar entre os seletores e o spacer um componente inline que:
- Carrega últimas cotações USD/BRL e EUR/BRL via `cotacaoMoedaService`
- Exibe: `USD: 5.02 ▲ +0.40%` / `EUR: 5.43 ▼ -0.15%`
- Seta verde (▲) se variação positiva, vermelha (▼) se negativa
- `useEffect` com `setInterval` de 10 min chamando `simularAtualizacao`
- Texto pequeno, sem quebrar layout do header

### 4. Vínculo Tipo Produto ↔ Ponto de Estoque — `src/lib/mock-data.ts`

**Interface `PontoEstoqueTipoProduto`:** id, pontoEstoqueId, tipoProdutoId, grupoId, empresaId, filialId, auditoria completa.

**Mock array:** inicialmente vazio.

**Service** (`src/lib/services.ts`): `pontoEstoqueTipoProdutoService` — listarPorPonto, salvar, excluir.

### 5. Aba "Tipos de Produtos Permitidos" — `src/pages/produtos-estoque/PontosEstoquePage.tsx`

No modal de cadastro/edição de Ponto de Estoque:
- Adicionar `Tabs` com duas abas: "Dados Gerais" (formulário atual) e "Tipos de Produtos Permitidos"
- Na aba de tipos: grid com checkbox multi-select listando todos os tipos de produto ativos
- Ao salvar, persiste os vínculos via `pontoEstoqueTipoProdutoService`

### 6. Campo `tipoProdutoId` no Produto — `src/lib/mock-data.ts` + `src/pages/produtos-estoque/ProdutosPage.tsx`

**mock-data.ts:** Adicionar `tipoProdutoId: string` (obrigatório) na interface `Produto`. Atualizar mock existente (`prod1`) com `tipoProdutoId: "tp1"`.

**services.ts:** Adicionar `tipoProdutoId` no `produtoService.salvar`.

**ProdutosPage.tsx:**
- Adicionar `tipoProdutoId` ao schema Zod (obrigatório)
- Adicionar Select de Tipo de Produto como **primeiro campo** do formulário (acima de código e descrição)
- Carregar lista de tipos via `tipoProdutoService`
- Preencher no openEdit

### 7. Empresa/Filial na Movimentação de Estoque — `src/pages/produtos-estoque/MovimentacaoEstoquePage.tsx`

Adicionar no topo do formulário (antes dos campos de produto):
- Select **Empresa** (preenchido automaticamente com `empresaAtual`, permite alteração manual, lista empresas do grupo)
- Select **Filial** (preenchido automaticamente com `filialAtual`, atualiza ao trocar empresa, lista filiais da empresa selecionada)
- Ao trocar empresa/filial: recarregar pontos de estoque e produtos filtrados

### Arquivos Modificados

| Arquivo | Ação |
|---|---|
| `src/lib/mock-data.ts` | Adicionar Moeda, CotacaoMoeda, PontoEstoqueTipoProduto; adicionar tipoProdutoId em Produto |
| `src/lib/services.ts` | Adicionar moedaService, cotacaoMoedaService, pontoEstoqueTipoProdutoService; atualizar produtoService |
| `src/components/AppHeader.tsx` | Adicionar widget de cotação com atualização automática |
| `src/pages/produtos-estoque/PontosEstoquePage.tsx` | Adicionar aba "Tipos de Produtos Permitidos" com multi-select |
| `src/pages/produtos-estoque/ProdutosPage.tsx` | Adicionar campo obrigatório Tipo de Produto no topo do formulário |
| `src/pages/produtos-estoque/MovimentacaoEstoquePage.tsx` | Adicionar seletores Empresa/Filial no topo |

