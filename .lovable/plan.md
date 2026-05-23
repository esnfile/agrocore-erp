# Fase 2 — DetalhesGeral (Despesas/Receitas Operacionais) — v2

Plano revisado com o feedback aprovado.

## Escopo

- Novo componente `src/pages/financeiro/lancamento/DetalhesGeral.tsx`.
- Roteamento da categoria `GERAL` no `LancamentoCaixaModal.tsx` + novo handler `salvarGeral()`.
- Extensões em `types.ts` (campos `multa`, `juros`, `descontos`, `totalGeral`).
- Limpeza de estado ao trocar de Tipo de Lançamento no `DadosBaseSection`/modal.
- Seed de 3 tipos `GERAL` em `src/lib/mock-data.ts` (Energia, Manutenção, Combustível).
- Sem mudar telas de Prolabore/Adiantamentos/Duplicatas.

## Componente DetalhesGeral

Layout responsivo (`grid-cols-1 md:grid-cols-12`):

```text
┌─ Valor (3) ─┬─ Multa (2) ─┬─ Juros (2) ─┬─ Descontos (2) ─┬─ Total READ-ONLY (3) ─┐
├─ Conta Contábil READ-ONLY (linha inteira, só se exigePlanoContas) ────────────────┤
└─ Centro de Custo (linha inteira, label dinâmica) ─────────────────────────────────┘
```

Notas:
- O Tipo de Lançamento continua no `DadosBaseSection`. Adicionamos `"GERAL"` em `categoriasImplementadas` para liberar tipos GERAL no dropdown.
- Espécies `SAIDA` e `ENTRADA` compartilham a mesma UI; o sinal é dado pela espécie do Tipo.

### Campos

| Campo | Tipo | Estado | Obrigatório |
|---|---|---|---|
| Valor | `Input` number step 0.01 | `valorDetalhe` | sim (>0) |
| Multa | idem | `multa` (novo) | não, default 0 |
| Juros | idem | `juros` (novo) | não, default 0 |
| Descontos | idem | `descontos` (novo) | não, default 0 |
| Total | read-only formatado BRL | derivado + `totalGeral` espelhado | — |
| Conta Contábil | read-only "código - nome" | `tipoSel.contaContabilId`/`Nome` | só renderiza se `tipoSel.exigePlanoContas` |
| Centro de Custo | `Select` | `centroCustoId` | dinâmico (label com `*` se `tipoSel.exigeCentroCusto`) |

### Cálculo do Total

```ts
const totalCalculado = (valor || 0) + (multa || 0) + (juros || 0) - (descontos || 0);
const totalGeral = Math.max(0, totalCalculado);
const negativo = totalCalculado < 0;
```

- Aviso vermelho inline abaixo do Total quando `negativo`: "Descontos maiores que Valor + Multa + Juros."
- `update({ totalGeral })` via `useEffect` para o modal calcular as Formas.

## Mudanças em `types.ts`

```ts
// novos campos no LancamentoFormState
multa: number;
juros: number;
descontos: number;
totalGeral: number; // derivado; persistido para o modal
```

- `initialFormState` zera os 4.
- `categoriasImplementadas` ganha `"GERAL"`.

## Mudanças em `LancamentoCaixaModal.tsx`

1. `renderDetalhes`: branch para `GERAL` → `<DetalhesGeral .../>`.
2. `valorEsperado`: incluir `GERAL` e usar `state.totalGeral` (resto continua usando `valorDetalhe`).
3. `adiantamentoReadOnly` / `permitirParcial`: false para `GERAL`.
4. **Limpeza ao trocar de Tipo** (`DadosBaseSection` já dispara `update({ tipoLancamentoId })`):
   - Interceptar o update no modal (via wrapper `handleTipoChange`) e zerar:
     - `socioId`, `pessoaId`, `solicitacaoAdiantamentoId`, `referenciaMotivo`
     - `valorDetalhe`, `multa`, `juros`, `descontos`, `totalGeral`
     - `parcelasSelecionadas`, `adiantamentosSelecionados`
     - `formas` (zera tudo)
   - Mantém: `empresaId`, `filialId`, `contaFinanceiraId`, `dataMovimento`, `centroCustoId`, `historico`.
5. `handleSave`: rota nova `if (tipoSel.categoria === "GERAL") return salvarGeral();`.

### `salvarGeral()`

Validações:
- `state.valorDetalhe > 0` → "Valor deve ser maior que zero".
- `totalCalculado >= 0` → senão "Descontos não podem ser maiores que o valor total. Corrija e tente novamente."
- `tipoSel.exigeCentroCusto && !state.centroCustoId` → "Centro de Custo é obrigatório para este tipo".
- `validarTotalFormas(state.totalGeral)`.

Persistência via `financeiroMovimentacaoService.registrar(...)`:
- `valor: state.totalGeral`
- `planoContaId: tipoSel.contaContabilId ?? null`
- `centroCustoId: state.centroCustoId || null`
- `pessoaId: null`
- `historico: state.historico || tipoSel.descricao`
- `numeroDocumento: \`GER-${Date.now()}\``

Toast sucesso: "Lançamento registrado com sucesso".

## Seed em `mock-data.ts`

Adicionar 3 tipos `categoria: "GERAL"`, `especie: "SAIDA"`, com `contaContabilId`/`contaContabilNome` apontando para contas do plano de contas existente (resolver IDs reais ao implementar):

- "Energia Elétrica" — `exigePlanoContas: true`, `exigeCentroCusto: false`
- "Manutenção de Máquinas" — `exigePlanoContas: true`, `exigeCentroCusto: true`
- "Combustível" — `exigePlanoContas: true`, `exigeCentroCusto: true`

(Os 2 tipos GERAL hoje existentes ficam intocados.)

## Casos de teste

| Cenário | Esperado |
|---|---|
| Tipo GERAL sem `exigePlanoContas` | Linha Conta Contábil oculta |
| Tipo GERAL com `exigePlanoContas` | Linha Conta Contábil visível, read-only |
| `exigeCentroCusto=true`, salvar sem centro | Erro "Centro de Custo é obrigatório" |
| Valor=100, Multa=10, Juros=5, Desc=15 | Total = 100 |
| Desc > Valor+Multa+Juros | Aviso inline + bloqueia salvar |
| Valor=0 | Erro "Valor deve ser maior que zero" |
| Trocar GERAL → PROLABORE | Campos zerados, sem herança |
| Trocar PROLABORE → GERAL | `socioId` zerado, novos campos zerados |

## Análise mantida

A estratégia atual do Caixa (header + Detalhes por categoria + Formas + Histórico) continua escalando bem. Cada nova categoria entra como um arquivo isolado. A "union discriminada implícita" no `LancamentoFormState` fica como tech debt aceito até passar de ~6 categorias; quando isso acontecer, refatoramos para o `detalhes: { tipo, ... }` discriminado. Migração para tabelas filhas no backend é transparente para o frontend.

## Fora de escopo

- Rateio de centro de custo.
- Pessoa vinculada à despesa genérica.
- Coluna de Conta Contábil na listagem de Movimentações.
- Refatoração da union discriminada.
