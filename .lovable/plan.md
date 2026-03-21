

# Plan: Correções Arquiteturais — 4 Furos Críticos do AgroERP

## Contexto: O que JA EXISTE vs O que FALTA

Após análise completa do código atual, a base já possui a maioria das interfaces e estruturas necessárias. O documento gerado pela IA Claude contém inconsistências (IDs simples ao invés de UUID, falta de auditoria/soft-delete, interfaces simplificadas) que serão ignoradas em favor da arquitetura já estabelecida.

### Ja existe no codigo:
- `UnidadeMedida` com `fatorBase` e `tipo` (com auditoria completa)
- `Produto` com `unidadeBaseId`, `unidadeCompraId`, `unidadeVendaId`, `quantidadeEmbalagemCompra/Venda`
- `Contrato` com `unidadeNegociacaoId`, `quantidadeBaseTotal`, conversao na criacao
- `RomaneioClassificacao` interface e array mock (vazio)
- `romaneioClassificacaoService` com `salvarPorRomaneio`
- `EstoqueTransito` com service e criacao automatica ao criar contrato
- `recalcularPesos` com logica ENTRADA/SAIDA (corrigida anteriormente)

### O que FALTA (os 4 furos reais):

**Furo 1 - Classificacao nao persiste na finalizacao:** `romaneioService.finalizar` nao invoca `romaneioClassificacaoService.salvarPorRomaneio` nem calcula `pesoLiquidoSecoLimpo` com base nos descontos da tabela.

**Furo 2 - Conversao de unidades na finalizacao:** O peso final e tratado diretamente como a unidade base. O romaneio nao tem campo `unidadeRomaneioId`. A conversao `unidadeRomaneio → unidadeBase` nao e aplicada antes de atualizar estoque/contrato.

**Furo 3 - Estoque em transito sem conversao:** `estoqueTransitoService.registrarMovimento` recebe o peso bruto sem converter para a unidade do contrato.

**Furo 4 - Heranca de unidade parcialmente implementada:** A criacao do contrato aceita `unidadeNegociacaoId` do form, mas nao pre-preenche automaticamente com base no tipo (COMPRA→unidadeCompra, VENDA→unidadeVenda).

---

## Modificacoes Planejadas

### 1. Adicionar `unidadeRomaneioId` ao Romaneio (mock-data.ts)

Adicionar campo `unidadeRomaneioId: string` na interface `Romaneio` para identificar em qual unidade as pesagens foram feitas. Default sera a unidade base do produto ao criar o romaneio.

### 2. Implementar `converterQuantidade` no `unidadeMedidaService` (services.ts)

Adicionar metodo sincrono ao service existente:
```text
converterQuantidade(valor, unidadeOrigemId, unidadeDestinoId) → number
- Valida que ambas unidades existem e sao do mesmo tipo
- Formula: (valor * fatorOrigem) / fatorDestino
```

### 3. Refatorar `romaneioService.finalizar` (services.ts)

O metodo atual (linhas 2751-2814) sera expandido para:

1. **Persistir classificacoes**: Buscar as classificacoes ja salvas pelo `romaneioClassificacaoService` (que ja e chamado pela UI). Se nao existirem, usar os campos `classificacaoUmidade/Impureza/Ardidos/Avariados` do romaneio como fallback.

2. **Calcular `pesoLiquidoSecoLimpo`**: Buscar a tabela de descontos (`classificacaoDescontos`) do produto para cada tipo de classificacao. Somar os percentuais de desconto aplicaveis e calcular:
   ```text
   totalDesconto% = soma dos descontos por tipo
   pesoLiquidoSecoLimpo = pesoLiquido * (1 - totalDesconto/100)
   ```

3. **Converter para unidade base antes de movimentar estoque**:
   ```text
   quantidadeEstoque = converterQuantidade(pesoLiquidoSecoLimpo, unidadeRomaneioId, produto.unidadeBaseId)
   ```

4. **Converter para unidade do contrato antes de atualizar saldo**:
   ```text
   quantidadeContrato = converterQuantidade(pesoLiquidoSecoLimpo, unidadeRomaneioId, contrato.unidadeNegociacaoId)
   ```

5. **Registrar movimento de estoque com quantidade convertida** (em unidade base).

6. **Atualizar contrato com quantidade convertida** (em unidade de negociacao).

### 4. Atualizar `estoqueTransitoService.registrarMovimento` (services.ts)

Receber a quantidade ja convertida para a unidade do contrato (a conversao ocorre no `finalizar`).

### 5. Pre-preencher `unidadeNegociacaoId` na criacao de contrato (services.ts + UI)

No `contratoService.salvar`, se `unidadeNegociacaoId` nao for informada:
- COMPRA → usar `produto.unidadeCompraId`
- VENDA → usar `produto.unidadeVendaId`

Na UI (`ContratosPage.tsx`), ao selecionar produto e tipo, pre-preencher o campo de unidade.

### 6. Atualizar `romaneioService.salvar` (services.ts)

Ao criar romaneio, definir `unidadeRomaneioId` a partir da `unidadeBaseId` do produto selecionado.

---

## Arquivos Modificados

1. **`src/lib/mock-data.ts`** — Adicionar `unidadeRomaneioId` na interface `Romaneio` e nos dados mock
2. **`src/lib/services.ts`** — `unidadeMedidaService.converterQuantidade`, refatorar `romaneioService.finalizar`, `romaneioService.salvar`, `contratoService.salvar`
3. **`src/pages/romaneios/RomaneiosPage.tsx`** — Exibir unidade do romaneio, ajustar mensagem de finalizacao com conversoes
4. **`src/pages/comercial/ContratosPage.tsx`** — Pre-preencher unidade ao selecionar produto/tipo

## Regras Mantidas (ignorando inconsistencias do documento)
- Todos os IDs seguem padrao UUID (mock usa prefixos temporarios)
- Todas as tabelas mantem auditoria completa (criadoEm/Por, atualizadoEm/Por)
- Exclusao sempre via soft-delete (deletadoEm/Por)
- Escopo multi-empresa/filial preservado

