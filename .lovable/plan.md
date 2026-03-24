

# Plan: Refatorar Conversão de Unidades com Contexto de Produto

## Análise do Documento

O documento propõe 4 mudanças. Avaliei cada uma contra o código existente:

### O que faz sentido implementar

**Mudança 1 — `converterQuantidade` com `produtoId`**: Correta e necessária. Hoje a conversão usa apenas `fatorBase` global, mas produtos como Soja (60kg/SC) e Milho (50kg/SC) têm fatores diferentes para a mesma unidade "SC". A função precisa do contexto do produto para usar `quantidadeEmbalagem` específica ao invés do `fatorBase` genérico.

**Mudança 3 — Renomear campos**: Faz sentido semântico. `quantidadeEmbalagemCompra/Venda` → `quantidadeEmbalagemEntrada/Saida` e `unidadeCompraId/VendaId` → `unidadeEntradaId/unidadeSaidaId`. Reflete melhor o fluxo de estoque. É um rename global em ~6 arquivos.

**Mudança 4 — Usar nova conversão no `finalizar`**: Consequência direta da Mudança 1. Já temos a chamada, apenas precisa passar o `produtoId`.

### O que precisa de ajuste vs o documento

**Mudança 2 — Defaults no novo produto**: O código já pré-preenche `quantidadeEmbalagem` com 1. O documento sugere adicionar validação visual (borda vermelha) se os campos ainda estiverem com valores padrão ao salvar — isso é um UX enhancement válido mas menor.

### Inconsistências do documento (ignoradas)
- O documento não usa UUID nem auditoria/soft-delete nas interfaces simplificadas — mantemos o padrão existente.
- A lógica de fallback para `fatorBase` global no documento está invertida na fórmula (linha 69-70). Corrigiremos.

---

## Modificações Planejadas

### 1. Renomear campos na interface `Produto` (mock-data.ts)
- `unidadeCompraId` → `unidadeEntradaId`
- `unidadeVendaId` → `unidadeSaidaId`
- `quantidadeEmbalagemCompra` → `quantidadeEmbalagemEntrada`
- `quantidadeEmbalagemVenda` → `quantidadeEmbalagemSaida`

### 2. Refatorar `converterQuantidade` (services.ts)
Adicionar parâmetro opcional `produtoId?: string`. Lógica hierárquica:
```text
1. Se origem === destino → retorna valor
2. Converte origem → unidadeBase do produto:
   - Se origem === unidadeEntradaId → valor * quantidadeEmbalagemEntrada
   - Se origem === unidadeSaidaId → valor * quantidadeEmbalagemSaida
   - Senão → fallback: (valor * fatorOrigem) / fatorBase
3. Converte unidadeBase → destino:
   - Se destino === unidadeEntradaId → valorBase / quantidadeEmbalagemEntrada
   - Se destino === unidadeSaidaId → valorBase / quantidadeEmbalagemSaida
   - Senão → fallback: (valorBase * fatorBase) / fatorDestino
```

### 3. Atualizar `romaneioService.finalizar` (services.ts)
Passar `produto.id` nas chamadas a `converterQuantidade`.

### 4. Atualizar referências em todos os arquivos
Rename global em:
- `src/lib/mock-data.ts` — interface + dados mock
- `src/lib/services.ts` — produtoService, movimentacaoService, contratoService, estaEmUso
- `src/pages/produtos-estoque/ProdutosPage.tsx` — form schema, labels, validação
- `src/pages/produtos-estoque/MovimentacaoEstoquePage.tsx` — lógica de conversão inline
- `src/pages/comercial/ContratosPage.tsx` — herança de unidade

### 5. Validação visual no ProdutosPage
Adicionar indicador visual (borda amarela/aviso) nos campos de unidade quando ainda estiverem com valor padrão "UND" ao tentar salvar.

## Arquivos Modificados
1. `src/lib/mock-data.ts`
2. `src/lib/services.ts`
3. `src/pages/produtos-estoque/ProdutosPage.tsx`
4. `src/pages/produtos-estoque/MovimentacaoEstoquePage.tsx`
5. `src/pages/comercial/ContratosPage.tsx`

