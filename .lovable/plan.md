## Objetivo

Transformar o campo **Dinheiro** do Caixa em um valor READ-ONLY composto por múltiplas formas (Dinheiro Físico, PIX, Transferência, Depósito, Cheque Compensado etc.), especificadas em um popup. Cheque, Cartão e Adiantamento permanecem como hoje.

## Viabilidade

Sim — é viável e não quebra nada relevante:

- A tabela `financeiroFormasPagto` (com `tipo: DINHEIRO | BANCARIO | ELETRONICO` e flag `ativo`) já existe e tem service.
- O campo `formas.dinheiro` já existe em `LancamentoFormState` e é persistido em `formasPagamentoDetalhe.dinheiro` na movimentação — vamos manter esse campo como **soma agregada**, então toda a lógica downstream (validação de saldo, salvar movimentação, exibição em `MovimentacoesPage`) continua funcionando sem alteração.
- A composição detalhada é UI-only nesta entrega (não persiste no backend mock para não quebrar contrato da movimentação). Caso queira persistir depois, adicionamos campo opcional em outra rodada.

## Mudanças

### 1. `src/pages/financeiro/lancamento/types.ts`

- Adicionar tipo `ComposicaoDinheiroItem = { formaId: string; valor: number }`.
- Adicionar `composicaoDinheiro: ComposicaoDinheiroItem[]` ao `LancamentoFormState` (default `[]`).
- Helper `sumComposicao(itens)`.

### 2. Novo: `src/pages/financeiro/lancamento/ComposicaoDinheiroModal.tsx`

- Dialog (mesmo padrão dos outros modais do Caixa) com título "Composição de Formas de Pagamento".
- Carrega formas via `financeiroFormaPagtoService.listar(...)` filtrando `ativo === true && deletadoEm === null`, ordenado por descrição.
- Se lista vazia: mensagem "Nenhuma forma de pagamento disponível. Cadastre formas antes de continuar."
- Grid com colunas: **Forma** (SearchableSelect com formas), **Valor** (input BRL), botão **X** para remover linha.
- Botão **+ Adicionar Forma** abaixo da grid.
- Rodapé fixo: total READ-ONLY (recalculado em tempo real) + botões **Cancelar** / **Confirmar**.
- Estado interno (rascunho) que só é propagado ao confirmar; cancelar descarta.
- Validações no Confirmar:
  - Toda linha precisa ter `formaId` selecionada.
  - Toda linha precisa ter `valor > 0`.
  - Erros via toast (padrão do app).
- Ao confirmar: chama `onConfirm(itens, total)` e fecha. O parent atualiza `composicaoDinheiro` e `formas.dinheiro = total`.

### 3. `src/pages/financeiro/lancamento/FormasPagamentoSection.tsx`

- O campo **Dinheiro** vira READ-ONLY (input bloqueado, classes `bg-muted`) com um botão `...` (ícone `MoreHorizontal`) à direita, dentro do mesmo agrupamento, abrindo o `ComposicaoDinheiroModal`.
- Demais campos (Cheque, Cartão, Adiantamento) inalterados.
- Recebe via props: `composicaoDinheiro`, `onChangeComposicao`.
- Reabrir o modal mostra os itens anteriores (persistência em state do form).

### 4. `src/pages/financeiro/lancamento/LancamentoCaixaModal.tsx`

- Passar `state.composicaoDinheiro` e handler para `FormasPagamentoSection` (que repassa ao popup).
- Handler atualiza `composicaoDinheiro` e seta `formas.dinheiro = soma` no mesmo `update`.
- Ao trocar de categoria/limpar formulário, resetar `composicaoDinheiro` junto (já coberto por `initialFormState`).
- **Nenhuma mudança** em `salvarGeral/Transferencia/Prolabore/Adiantamento/Duplicatas`: continuam usando `formas.dinheiro` (que agora reflete a soma da composição). Validação de total existente em `FormasPagamentoSection` (soma das 4 formas vs valor esperado) continua valendo.

### 5. Sem mudanças

- `services.ts`, `mock-data.ts` (estrutura de movimentação), `MovimentacoesPage.tsx`, `saldo-utils.ts`: intocados.

## Regras preservadas (sem regressão)

- Cheque / Cartão / Adiantamento: comportamento atual mantido.
- Validação "soma das formas = valor esperado": mantida.
- Validação de saldo (CAIXA/BANCO + limite): mantida — usa `formas.dinheiro` agregado.
- Persistência da movimentação: mantida (campo `formasPagamentoDetalhe.dinheiro`).

## Trade-off explícito

A composição detalhada (qual parte foi PIX, qual foi espécie etc.) **vive apenas no estado do formulário** durante o preenchimento. Quando a movimentação é gravada, persiste apenas o total em "Dinheiro" — exatamente como hoje. Se quiser persistir a quebra por forma na movimentação (para relatórios), é uma segunda etapa que envolve alterar o contrato do `financeiroMovimentacaoService` e o tipo `FinanceiroMovimentacao`. **Pergunta:** seguimos só com UI agora ou já incluo a persistência da quebra?  
  
Se quiser implementar essa parte por agora e deixar para implementarmos a separação depois, mas eu quero que haja o detalhamento quebrado, tipo 10k em dinheiro (5k em pix e 5k em transferência) Isso precisa ter rastreio, senão não tem sentido não acha?  
  
  
