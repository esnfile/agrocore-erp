

## Plano: Estrutura de Estoque (Quantidade + Controle de Negativo)

### 1. Atualizar `ParametroComercial` — `src/lib/mock-data.ts`

Adicionar campo `permitirEstoqueNegativo: boolean` na interface e no mock data (default `false`).

### 2. Novas Interfaces e Mock Data — `src/lib/mock-data.ts`

**`PontoEstoque`:**
- id, grupoId, empresaId, filialId, descricao, principal (boolean), tipo ("PROPRIO" | "TERCEIRO"), ativo, auditoria completa

**`Estoque`:**
- id, grupoId, empresaId, filialId, produtoId, pontoEstoqueId, quantidadeAtual (decimal), custoMedioAtual (nullable), valorTotalEstoque (nullable)

**`MovimentacaoEstoque`:**
- id, grupoId, empresaId, filialId, produtoId, pontoEstoqueId, tipoMovimento ("ENTRADA" | "SAIDA" | "AJUSTE"), quantidadeInformada, unidadeMovimentacaoId, quantidadeConvertidaBase, dataMovimentacao, observacao, auditoria completa

Mock data: 1 ponto de estoque (principal, PROPRIO), 1 registro de estoque para prod1, 0 movimentações iniciais.

### 3. Novos Services — `src/lib/services.ts`

**`pontoEstoqueService`:** listar (por empresa+filial), salvar (validar unicidade de principal por empresa+filial), excluir (soft delete).

**`estoqueService`:** listarPorEmpresaFilial, obterSaldo (por produto+ponto), atualizarSaldo.

**`movimentacaoEstoqueService`:** listar (com filtros), registrar — contém toda a lógica central:
1. Validar tipo da unidade (mesmo tipo da unidade_base do produto)
2. Converter quantidade para unidade_base usando fatorBase
3. Calcular novo saldo (ENTRADA: +, SAIDA: -, AJUSTE: = valor)
4. Verificar `permitirEstoqueNegativo` se saldo < 0
5. Atualizar registro de estoque
6. Inserir movimentação

### 4. Atualizar Menu — `src/lib/modules.ts`

Dentro de "Auxiliares", adicionar/ajustar:
- Pontos de Estoque (já existe placeholder)
- Movimentação de Estoque (novo item)
- Consulta de Estoque (novo item)

### 5. Novas Páginas

**`src/pages/produtos-estoque/PontosEstoquePage.tsx`:**
- CRUD com listagem, novo, editar, soft delete
- Campos: descrição, tipo (PROPRIO/TERCEIRO), principal (toggle), ativo
- Validação: apenas 1 principal por empresa+filial

**`src/pages/produtos-estoque/MovimentacaoEstoquePage.tsx`:**
- Formulário: Produto (select), Ponto de Estoque (select), Tipo Movimento (ENTRADA/SAIDA/AJUSTE), Unidade (select filtrada por tipo da unidade_base), Quantidade, Data, Observação
- Exibir "Quantidade convertida para unidade base: XXX [codigo]" em tempo real
- Ao confirmar: chamar service que faz conversão, validação de negativo e atualização de saldo
- Toast de sucesso/erro
- Listagem de movimentações recentes abaixo do formulário

**`src/pages/produtos-estoque/ConsultaEstoquePage.tsx`:**
- Grid: Produto, Ponto, Quantidade Atual, Unidade Base
- Filtros: Produto, Ponto
- Saldo negativo destacado em vermelho

### 6. Rotas — `src/App.tsx`

Substituir placeholders por componentes reais:
- `/produtos-estoque/pontos-estoque` → PontosEstoquePage
- `/produtos-estoque/movimentacao-estoque` → MovimentacaoEstoquePage (nova rota)
- `/produtos-estoque/consulta-estoque` → ConsultaEstoquePage (nova rota)

### Arquivos Modificados

| Arquivo | Ação |
|---|---|
| `src/lib/mock-data.ts` | Adicionar interfaces, types, mock arrays, campo em ParametroComercial |
| `src/lib/services.ts` | Adicionar pontoEstoqueService, estoqueService, movimentacaoEstoqueService |
| `src/lib/modules.ts` | Adicionar itens de menu (Movimentação, Consulta) |
| `src/App.tsx` | Adicionar imports e rotas |
| `src/pages/produtos-estoque/PontosEstoquePage.tsx` | Criar |
| `src/pages/produtos-estoque/MovimentacaoEstoquePage.tsx` | Criar |
| `src/pages/produtos-estoque/ConsultaEstoquePage.tsx` | Criar |

