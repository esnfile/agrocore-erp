# Fase 1 — Conta Contábil no Tipo de Lançamento

Pré-requisito para o futuro `DetalhesGeral`. Adiciona vínculo opcional/obrigatório entre `FinanceiroTipoLancamento` e `FinanceiroPlanoConta`, com filtro dinâmico por espécie (Entrada/Saída).

## Escopo

Apenas o modal/cadastro de Tipos de Lançamento (`src/pages/financeiro/TiposLancamentoPage.tsx`) e os tipos/serviços que o suportam. Nenhuma alteração em telas de lançamento de caixa, duplicatas, prolabore ou adiantamentos.

## Mudanças nos dados (mock)

`src/lib/mock-data.ts` — interface `FinanceiroTipoLancamento`:

- Adicionar `contaContabilId?: string`
- Adicionar `contaContabilNome?: string` (denormalizado para exibição rápida)

Registros mock existentes ficam com os campos `undefined` (compatível).

## Mapeamento Espécie ↔ Tipo da Conta

`FinanceiroPlanoConta.tipo` hoje é `"RECEITA" | "DESPESA"`. O Tipo de Lançamento usa `TipoMovimentoFinanceiro = "ENTRADA" | "SAIDA" | "TRANSFERENCIA"`. Mapeamento usado no filtro:

- `ENTRADA` → mostra contas com `tipo = "RECEITA"`
- `SAIDA` → mostra contas com `tipo = "DESPESA"`
- `TRANSFERENCIA` → campo Conta Contábil não se aplica; se `exigePlanoContas` estiver marcado junto com `TRANSFERENCIA`, exibir aviso e tratar como não aplicável (campo oculto).

Filtro final no dropdown: `ativo === true` + tipo compatível com a espécie atual.

## UI — `TiposLancamentoPage.tsx`

1. Novo estado: `contaContabilId: string | null`.
2. Carregar lista de planos de contas via `financeiroPlanoContaService.listar(empresaId, filialId)` no `carregar()`.
3. Renderizar o campo "Qual Conta Contábil *" logo abaixo do toggle "Exige Plano de Contas" e antes do toggle "Aparece na Pesquisa", apenas quando:
  - `exigePlanoContas === true` E
  - `tipoMovimento !== "TRANSFERENCIA"`
4. Componente: `Select` (shadcn) com opções `"{codigo} - {nome}"`, placeholder "Selecione uma conta...".
5. Comportamentos reativos:
  - Ao desmarcar `exigePlanoContas` → limpa `contaContabilId`.
  - Ao mudar `tipoMovimento` → se a conta atual não pertence mais ao tipo compatível, limpa `contaContabilId`.
6. `openEdit` carrega `contaContabilId` da linha; `reset` zera.

## Validação ao salvar

Em `handleSave`, antes de chamar o service:

- Se `exigePlanoContas && tipoMovimento !== "TRANSFERENCIA"`:
  - Bloquear se `!contaContabilId` → toast "Selecione uma Conta Contábil".
  - Bloquear se a conta selecionada não corresponder ao tipo mapeado da espécie → toast "Conta Contábil não compatível com a Espécie".
- Resolver `contaContabilNome` a partir da lista carregada e enviar ambos no payload.

## Service

`financeiroTipoLancamentoService.salvar` em `src/lib/services.ts`:

- Persistir `contaContabilId` e `contaContabilNome` (tanto no update quanto no create), aceitando `undefined`/`null` para limpar.

## Tabela (listagem)

Sem nova coluna nesta fase para não poluir. O vínculo aparece apenas no modal de edição (mantém a régua atual de 11 colunas).

## Checklist  


- Campos adicionados em `FinanceiroTipoLancamento`
- Service persiste os dois campos
- Dropdown renderiza condicionalmente
- Filtro por espécie (RECEITA/DESPESA) funcionando
- Limpeza automática ao mudar espécie ou desmarcar flag
- Validação obrigatória + cruzada no salvar
- Edição preserva valor existente
- Sem alterações em outras telas

Quando desmarcar o toogle Exige plano de contas, precisa zerar o dropdown Conta contabel e ocultar   
Fora de escopo (próxima fase)

- `DetalhesGeral` consumindo `contaContabilId` para pré-preencher/lockar a conta no lançamento.
- Hierarquia Grupo/SubGrupo/Plano de Contas.