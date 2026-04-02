# Refatoração: Eliminar `fatorBase` — Produto como Fonte Única de Conversão

## Contexto

Hoje o campo `fatorBase` na tabela de unidades gera confusão e bugs. A Saca (SC) tem `fatorBase: 1`, o que faz o sistema tratar 1 SC = 1 KG. O fator real de conversão depende do **produto** (Soja: 1 SC = 60 KG, Milho: 1 SC = 50 KG), e já existe no cadastro do produto via `quantidadeEmbalagemEntrada` e `quantidadeEmbalagemSaida`.

## Nova Arquitetura de Unidades

### Princípio

- A unidade de medida tem apenas: `codigo`, `descricao`, `tipo` (PESO/VOLUME/UNIDADE), `ativo`
- **Não existe mais `fatorBase**` — removido completamente
- O **tipo** da unidade define implicitamente a unidade base de armazenamento:
  - PESO → KG
  - VOLUME → LT
  - UNIDADE → UND
- O campo `unidadeBaseId` do produto **deixa de ser selecionável** — é derivado automaticamente do tipo da unidade selecionada
- `unidadeEntradaId` e `unidadeSaidaId` só listam unidades do mesmo tipo
- **Toda conversão** usa exclusivamente `quantidadeEmbalagemEntrada` ou `quantidadeEmbalagemSaida` do produto

### Mapeamento Tipo → Unidade Base

```text
Tipo       Unidade Base    ID (mock)
─────────  ──────────────  ─────────
PESO       KG              um1
VOLUME     LT              um4
UNIDADE    UND             (criar um6)
```

## Mudanças por Arquivo

### 1. `src/lib/mock-data.ts` — Interface e Dados

- **Remover** `fatorBase` da interface `UnidadeMedida`
- **Remover** `fatorBase` de todos os registros mock (um1 a um7)
- **Remover** `unidadeBaseId` da interface `Produto`
- **Adicionar** `tipoUnidade: TipoUnidadeMedida` na interface `Produto` (PESO/VOLUME/UNIDADE)
- Atualizar produtos mock: `prod1` e `prod2` recebem `tipoUnidade: "PESO"` em vez de `unidadeBaseId: "um1"`
- Criar unidade `um6` (UND) se não existir

### 2. `src/lib/services.ts` — Lógica de Conversão

`**unidadeMedidaService.converterQuantidade()**` — reescrever:

- Recebe `(valor, unidadeOrigemId, unidadeDestinoId, produtoId)` — `produtoId` **obrigatório**
- Busca produto → determina unidade base pelo `tipoUnidade` (PESO→KG, VOLUME→LT, UND→UND)
- Se origem = base → `valorBase = valor`
- Se origem = `unidadeEntradaId` → `valorBase = valor × quantidadeEmbalagemEntrada`
- Se origem = `unidadeSaidaId` → `valorBase = valor × quantidadeEmbalagemSaida`
- Se origem não coincide com nenhuma → **erro** (não há fallback)
- Mesma lógica inversa para destino
- **Zero fallback para `fatorBase**` — se não conseguir resolver via produto, lança erro

`**contratoService.salvar()**` (~linha 1594-1598):

- Remover cálculo via `fatorBase`
- Usar `converterQuantidade(quantidadeTotal, unidadeNegociacaoId, unidadeBaseDoTipo, produtoId)`

`**entregaContratoService.registrar()**` (~linha 1673-1677):

- Mesmo ajuste: remover `fatorBase`, usar `converterQuantidade`

`**unidadeMedidaService.salvar()**`:

- Remover referências a `fatorBase` na criação/edição

`**unidadeMedidaService.estaEmUso()**`:

- Remover checagem de `unidadeBaseId` (campo não existe mais)

### 3. `src/pages/romaneios/romaneio-types.ts` — Helpers de Contrato

`**resolveContratoUnidadeInfo()**` — reescrever:

- Receber `contrato` + buscar o produto internamente
- Determinar fator via `quantidadeEmbalagemEntrada` ou `quantidadeEmbalagemSaida` do produto
- Se `unidadeNegociacaoId === unidadeEntradaId` → fator = `quantidadeEmbalagemEntrada`
- Se `unidadeNegociacaoId === unidadeSaidaId` → fator = `quantidadeEmbalagemSaida`
- `isKg` = `unidadeNegociacaoId` é a unidade base do tipo (KG para PESO)
- Sem fallback para `fatorBase`

### 4. `src/pages/produtos-estoque/ProdutosPage.tsx` — Formulário do Produto

- Substituir campo "Unidade Base" por campo **"Tipo de Unidade"** (select: PESO/VOLUME/UNIDADE)
- A unidade base é derivada automaticamente e exibida como texto informativo: "Unidade base: KG"
- Filtrar `unidadeEntradaId` e `unidadeSaidaId` pelo tipo selecionado
- Ao trocar tipo: limpar entrada e saída
- Remover `unidadeBaseId` do schema zod, adicionar `tipoUnidade`  
Tornar obrigatório selecionar tipo de unidade, unidadeEntrada e undiadeSaida no cadastro de produto, caso não esteja selecionada, deve emitir critica e não aceitar salvar. Ao selecionar a unidadeEntrada, preencher o campo quantidadeEmbalagemEntrada = 1 , e ao selecionar a unidadeSaida, preencher o campo quantidadeEmbalagemSaida = 1 . Pensei em criar um texto abaixo do campo quantidadeEmbalagemEntrada e quantidadeEmbalagemSaida a conversão expressa, por exemplo:   
Tipo de Unidade: PESO -> unidade base: KG  
unidadeEntrada = SC  
quatidadeEmbalagemEntrada = 60  
Daí mostra um texto informando como será a movimentação de estoque, exemplo:  1 SACA = 60KG, só para o usuario ficar ciente do que está digitando

### 5. `src/pages/produtos-estoque/UnidadesMedidaPage.tsx` — Cadastro de Unidades

- Remover coluna `fatorBase` da tabela
- Remover campo `fatorBase` do formulário
- Remover `fatorBase` do schema zod

### 6. Demais arquivos que referenciam `fatorBase` ou `unidadeBaseId`

- `ConsultaEstoquePage.tsx`: trocar `produto.unidadeBaseId` por helper que resolve unidade base via `tipoUnidade`
- `MovimentacaoEstoquePage.tsx`: filtrar unidades compatíveis via `tipoUnidade` em vez de `unidadeBaseId`
- `StepIdentificacao.tsx`, `StepVinculo.tsx`, `StepFechamento.tsx`: já usam `resolveContratoUnidadeInfo` — corrigido automaticamente pela mudança no helper

### 7. Helper Global: `getUnidadeBaseParaTipo()`

Criar função utilitária:

```text
getUnidadeBaseParaTipo(tipo: TipoUnidadeMedida): string
  PESO → "um1" (KG)
  VOLUME → "um4" (LT)  
  UNIDADE → "um6" (UND)
```

Usada em todo lugar que antes buscava `produto.unidadeBaseId`.

## O que NÃO muda

- Stepper do romaneio, classificação, pesagens — intactos
- Romaneio continua operando em KG
- Cadastro de unidades continua existindo (só perde o campo `fatorBase`)
- Lógica de status, travas, read-only — intacta

## Resultado Esperado

- Contrato de 1000 SC de Soja → armazenado como 60.000 KG → exibido como "1.000 SC / 60.000 KG"
- Contrato de 1000 SC de Milho → armazenado como 50.000 KG → exibido como "1.000 SC / 50.000 KG"
- Nenhum fallback genérico — se o produto não tem a unidade configurada, o sistema **recusa** a operação
- Saldo contratual comparado corretamente em KG no fechamento do romaneio   
  
Obrigatório selecionar TipoUnidade, unidadeEntrada, quantidadeEmbalagemEntrada, unidadeSaida, quantidadeEmbalagemSaida no cadstro de produto   
