## Correção: Permitir Baixa Parcial de Duplicatas

### Diagnóstico

Hoje a UI força `valorDetalhe = totalSelecionado` (soma dos saldos das parcelas marcadas) via `useEffect` em `DetalhesDuplicatas.tsx`, e `validarTotalFormas` exige `totalFormas === valorDetalhe`. Isso impede qualquer baixa parcial. O service `registrarBaixaDuplicatas` já distribui sequencialmente por vencimento e suporta parcial — nenhuma mudança lá.

### Mudanças (apenas UI / handler, sem mexer no service)

**1. `src/pages/financeiro/lancamento/DetalhesDuplicatas.tsx`**
- Remover o `useEffect` que sobrescreve `valorDetalhe` a cada mudança de seleção.
- Manter `totalSelecionado` apenas como referência exibida ("Valor das Parcelas").
- Adicionar bloco visual abaixo do TOTAL:
  - Aviso amarelo (warning) quando `totalFormas > 0 && totalFormas < totalSelecionado` mostrando "Baixa parcial: pagando X de Y. Saldo restante: Z ficará como PARCIAL na última parcela."
  - Aviso destrutivo quando `totalFormas > totalSelecionado`.
- Inicializar `valorDetalhe` com `totalSelecionado` apenas na primeira marcação de cada parcela (carregar saldo nas formas automaticamente é mantido — comportamento atual de UX), mas o usuário pode editar livremente as formas para um valor menor.

**2. `src/pages/financeiro/lancamento/LancamentoCaixaModal.tsx` — `salvarBaixaDuplicatas`**
Substituir a chamada genérica `validarTotalFormas(state.valorDetalhe)` por validação específica para duplicatas:

```text
totalFormas = sum(formas)
totalParcelas = soma dos saldos das parcelasSelecionadas
- se totalFormas <= 0       → erro "Informe ao menos um valor em Formas de Pagamento"
- se totalFormas > totalParcelas + 0.01 → erro "TOTAL não pode ser maior que o valor das parcelas"
- caso contrário            → permitido (igual ou parcial)
```

Enviar `valorTotal: totalFormas` (não `state.valorDetalhe`) para `registrarBaixaDuplicatas`. A distribuição sequencial do service automaticamente deixa a última parcela atingida em `PARCIAL`.

**3. Toast de sucesso**
Após o save, consultar `result.parcelasLiquidadas` (e o array detalhado já retornado pela movimentação) para diferenciar mensagem:
- Total: "Duplicatas quitadas com sucesso (N baixadas)."
- Parcial: "N duplicatas baixadas — última ficou PARCIAL (saldo restante: R$ X)."

Para isso, expandir o retorno de `registrarBaixaDuplicatas` para incluir `parcelasLiquidadasDetalhe` (já existe internamente como `parcelasLiquidadas` no objeto `mov`) — pequena mudança não-quebrante: adicionar campo opcional ao tipo de retorno e popular com o array já calculado. Nenhum caller existente é afetado.

### Casos de teste (após mudança)
- TOTAL=80, Parcelas=120 → salva, última fica PARCIAL, toast parcial.
- TOTAL=120, Parcelas=120 → salva, todas PAGO, toast total.
- TOTAL=150, Parcelas=120 → bloqueia com erro.
- TOTAL=0 → bloqueia com erro.
- Adiantamento entra normalmente como uma das formas (continua read-only somando os selecionados).

### Garantias de não-regressão
- `validarTotalFormas` continua intocado e segue sendo usado por PROLABORE, ADIANT_FORNECEDOR, ADIANT_CLIENTE (que exigem igualdade).
- Service `registrarBaixaDuplicatas` permanece igual; só o `valorTotal` enviado muda (já era validado contra `somaSaldos`).
- Rastreabilidade (`parcelasLiquidadas`, `adiantamentosUsados`) intacta.
