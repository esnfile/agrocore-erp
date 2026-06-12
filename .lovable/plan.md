# Formas de Pagamento Expandidas — Cheque, Cartão, Adiantamento

Mesmo padrão visual e arquitetural já entregue para "Dinheiro": campo principal READ-ONLY com botão `...`, popup com grid dinâmico, total recalculado em tempo real, validações e persistência. Nada do que já existe é quebrado — `formas.dinheiro/cheque/cartao/adiantamento` continuam sendo a fonte da soma exibida no campo principal, agora alimentados também pelas novas composições.

---

## 1. Novos cadastros mínimos

### Tabela mock `financeiroCheques` (`FinanceiroCheque`)
Campos: `id, empresaId, filialId, numero, banco, agencia, conta, titular, valor, dataEmissao, dataVencimento, status: 'DISPONIVEL' | 'UTILIZADO' | 'COMPENSADO' | 'DEVOLVIDO', ativo, deletadoEm + auditoria padrão`.

- Página `src/pages/financeiro/ChequesPage.tsx` (CRUD via `SimpleCrudPage`, listando apenas `deletadoEm=null`).
- Serviço `financeiroChequeService` com `listar`, `listarDisponiveis(empresa,filial)` (filtra `status='DISPONIVEL'` e `ativo`).
- Entrada no menu "Financeiro" (mesmo bloco de Formas de Pagamento).
- Seeds: 3-4 cheques de exemplo.

### Tabela mock `financeiroCartoes` (`FinanceiroCartao`)
Campos: `id, empresaId, filialId, bandeira, ultimos4, titular, valorLimite, valorDisponivel, status: 'DISPONIVEL' | 'UTILIZADO', ativo, deletadoEm + auditoria`.

- Página `src/pages/financeiro/CartoesPage.tsx` análoga.
- Serviço `financeiroCartaoService` com `listar` e `listarDisponiveis`.
- Seeds: 2-3 cartões.

Esses cadastros são **estáticos** nesta entrega: o popup de PAGAMENTO consome a lista, mas baixar/atualizar status do cheque/cartão após uso fica fora desta entrega (ficam como TODO comentado no `services.ts` para entrega futura, mantendo regra alinhada com o padrão atual de mocks).

---

## 2. Tipos e estado do form

`src/pages/financeiro/lancamento/types.ts`:

```ts
export interface ComposicaoChequeItem {
  chequeId?: string;   // PAGAMENTO
  numero?: string;     // RECEBIMENTO
  banco?: string;      // RECEBIMENTO (opcional)
  valor: number;
}
export interface ComposicaoCartaoItem {
  cartaoId?: string;   // PAGAMENTO
  numero?: string;     // RECEBIMENTO
  bandeira?: string;   // RECEBIMENTO
  valor: number;
}
export interface ComposicaoAdiantamentoItem {
  adiantamentoId: string;
  valor: number;
}
```

Adicionar em `LancamentoFormState`: `composicaoCheque`, `composicaoCartao`, `composicaoAdiantamento` (defaults `[]`). Helpers `sumComposicaoCheque/Cartao/Adiantamento`.

---

## 3. Persistência (`FinanceiroMovimentacao`)

Adicionar 3 colunas opcionais na entidade e no service `registrar` / `registrarBaixaDuplicatas`:

```ts
composicaoCheque?: Array<{ chequeId?: string; numero?: string; banco?: string; valor: number }> | null;
composicaoCartao?: Array<{ cartaoId?: string; numero?: string; bandeira?: string; valor: number }> | null;
composicaoAdiantamento?: Array<{ adiantamentoId: string; valor: number }> | null;
```

`MovimentacoesPage` expande cada composição em sua própria lista (mesma UI já usada para Dinheiro).

---

## 4. Popups novos (em `src/pages/financeiro/lancamento/`)

### `ComposicaoChequeModal.tsx`
- Prop `modo: 'RECEBIMENTO' | 'PAGAMENTO'` derivada de `tipoMovimento` (ENTRADA → RECEBIMENTO, SAIDA → PAGAMENTO).
- **RECEBIMENTO**: grid editável com `Número` (text obrigatório), `Banco` (text opcional), `Valor` (number > 0), botão X, "+ Adicionar Cheque".
- **PAGAMENTO**: dropdown `Cheque` (shadcn `Select` portalizado, mesmo padrão da `ComposicaoDinheiroModal` para evitar clipping) listando `chequeService.listarDisponiveis`. Ao selecionar, `valor` autopreenche e fica READ-ONLY.
- Total READ-ONLY em tempo real, Confirmar/Cancelar, validações com toast.

### `ComposicaoCartaoModal.tsx`
Mesma estrutura, dropdown lista `cartaoService.listarDisponiveis` e exibe `Bandeira #ultimos4`.

### `ComposicaoAdiantamentoModal.tsx`
**Reutiliza** o `SelecionarAdiantamentoModal` existente (já consome saldos, filtra por `pessoaId` e respeita `tipoMovimento`). Apenas exposto via botão `...` em `FormasPagamentoSection`. Para categorias onde o campo já é alimentado por outro fluxo (REC/PAG_DUPLICATA já abre o seletor próprio), o botão `...` apenas reabre o mesmo modal — sem duplicar lógica nem alterar o débito em `saldoRestante`.

---

## 5. `FormasPagamentoSection.tsx`

Os 4 campos viram READ-ONLY com botão `...` (já é assim em Dinheiro). Para cada um:

- Recebe a composição atual + handler `onChangeComposicao*`.
- Ao confirmar, atualiza `composicao*` E `formas.<canal> = sum(composicao)` no mesmo `update`.
- Mostra `N item(s) detalhado(s)` abaixo do campo quando preenchido.

`adiantamentoReadOnly` continua valendo para REC/PAG_DUPLICATA (botão `...` ainda abre, mas usa o seletor já vinculado às parcelas).

---

## 6. `LancamentoCaixaModal.tsx`

- Recebe `tipoMovimento` do tipo selecionado (já tem) e propaga aos popups via `modo`.
- Carrega `cheques` e `cartoes` via novos services (junto do `useEffect` que já carrega `formasPagto`).
- Passa `composicao*` aos `salvarGeral / salvarBaixaDuplicatas / salvarProlabore / salvarAdiantCliente / salvarAdiantFornecedor`.
- Transferência continua sem Formas de Pagamento (regra atual preservada).

---

## 7. Validação global (preservada e ampliada)

`sumFormas(state.formas)` já é a soma dos 4 canais. Validação adicional ao salvar: para cada canal preenchido, `sum(composicao) === formas.<canal>` (proteção contra divergência manual). Mantém validação de saldo CAIXA/BANCO existente.

---

## 8. Detalhes técnicos

| Item | Decisão |
|---|---|
| Dropdown clipping | Usar `Select` shadcn portalizado (mesmo fix já aplicado em Dinheiro). |
| Detecção de modo | `tipoLancamento.tipoMovimento === 'ENTRADA' ? 'RECEBIMENTO' : 'PAGAMENTO'`. |
| Sem `tipoMovimento` selecionado | Botão `...` desabilitado com tooltip "Selecione o tipo de lançamento". |
| Reabrir popup | Sempre repopula com `composicao*` atual do form. |
| Cancelar | Descarta draft, não toca em `formas.*`. |
| Reset do form | Limpa as 3 novas composições. |
| Mocks de Cheque/Cartão | Status NÃO é atualizado ao usar (TODO documentado). |

---

## 9. Arquivos

**Criar:**
- `src/pages/financeiro/ChequesPage.tsx`
- `src/pages/financeiro/CartoesPage.tsx`
- `src/pages/financeiro/lancamento/ComposicaoChequeModal.tsx`
- `src/pages/financeiro/lancamento/ComposicaoCartaoModal.tsx`
- `src/pages/financeiro/lancamento/ComposicaoAdiantamentoModal.tsx` (wrapper fino sobre o existente)

**Editar:**
- `src/lib/mock-data.ts` — tipos `FinanceiroCheque`, `FinanceiroCartao`, seeds, novos campos em `FinanceiroMovimentacao`.
- `src/lib/services.ts` — `financeiroChequeService`, `financeiroCartaoService`, persistência das composições.
- `src/lib/modules.ts` + `AppSidebar.tsx` — entradas de menu.
- `src/App.tsx` — rotas.
- `src/pages/financeiro/lancamento/types.ts` — novos tipos e helpers.
- `src/pages/financeiro/lancamento/FormasPagamentoSection.tsx` — 3 novos botões `...`.
- `src/pages/financeiro/lancamento/LancamentoCaixaModal.tsx` — wiring.
- `src/pages/financeiro/MovimentacoesPage.tsx` — exibição expandida.
- `.lovable/memory/features/lancamento-caixa.md` — atualizar nota das 4 composições.

---

## 10. O que NÃO entra nesta entrega

- Baixa automática de status do cheque/cartão ao consumir (vai para próxima iteração junto com fluxo de compensação).
- Edição cruzada (ex: remover um cheque já usado em outra movimentação).
- Relatórios consolidados por composição.

## 11. Riscos / impactos

- `formas.*` continua sendo a fonte exibida em `MovimentacoesPage`; nenhum cálculo existente quebra.
- `SelecionarAdiantamentoModal` é apenas embrulhado — comportamento de débito em `saldoRestante` permanece idêntico.
- Validação extra `sum(composicao) === formas.<canal>` pode pegar lançamentos antigos editados manualmente; tratamento: se composição vazia, validação é ignorada (compatibilidade retroativa).
