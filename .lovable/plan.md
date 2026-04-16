# Correções de UI + Estratégia de Transição Duplicatas Provisórias → Definitivas

## Correções de UI

### Correção 1 — Ícone de Duplicatas mais visível

Substituir o `DollarSign` simples por um ícone circular estilizado (circle com "$" dentro), inspirado na imagem enviada:

- **Com duplicatas**: Círculo verde com "$" branco (bg-primary rounded-full)
- **Sem duplicatas**: Círculo cinza claro com "$" cinza apagado (bg-muted rounded-full)
- Usar um `div` com classes Tailwind para simular o ícone circular da imagem

### Correção 2 — Aba Financeiro: listar duplicatas previstas

- Quando status ABERTO/PARCIAL e `duplicatasGeradas === true`, exibir tabela de parcelas previstas (status PREVISTO) logo abaixo da mensagem "Duplicatas Provisórias: ✅ Geradas"
- Mover a mensagem sobre "gerar parcelas definitivas" para exibir apenas no cenário FINALIZADO (já existe lá)
- Reutilizar o mesmo formato de tabela de parcelas com expansão que já existe no cenário 3

---

## Estratégia: Transição de Duplicatas Previstas → Definitivas

Aqui está minha sugestão para o fluxo completo:

### O Problema

Temos duplicatas com status `PREVISTO` (previsão de caixa). Precisamos definir **quando e como** elas se tornam duplicatas reais (`PENDENTE`/`ABERTO`) para receber movimentações.

### Proposta de Fluxo

```text
CONTRATO FIXO:
  Criação → Modal automático → Duplicatas PREVISTO (previsão)
       ↓
  Romaneios finalizados → Status FINALIZADO
       ↓
  Aba Financeiro → Botão [Efetivar Duplicatas]
       ↓
  Sistema compara: valor previsto vs valor real (com descontos QC)
       ↓
  Modal de confirmação mostra diferenças:
    "Valor Previsto: R$ 120.000 → Valor Real: R$ 118.500 (descontos)"
       ↓
  Opções:
    [Efetivar com valor previsto] — mantém valores originais
    [Efetivar com valor real]    — ajusta parcelas proporcionalmente
    [Reconfigurar parcelas]      — abre modal de geração novamente
       ↓
  Ao efetivar:
    - Parcelas mudam de PREVISTO → PENDENTE
    - Contrato muda de FINALIZADO → FATURADO
    - Duplicatas passam a aceitar movimentações (pagamentos, adiantamentos)

CONTRATO A_FIXAR:
  Criação → Sem duplicatas (aguarda fixação)
       ↓
  Fixação de preço → Botão [Gerar Duplicatas de Previsão]
       ↓
  Duplicatas PREVISTO criadas (mesma lógica do FIXO)
       ↓
  Romaneios finalizados → FINALIZADO → [Efetivar] → FATURADO
```

### Resumo da Lógica de Efetivação


| Situação                                 | Ação disponível                                       |
| ---------------------------------------- | ----------------------------------------------------- |
| ABERTO/PARCIAL + sem duplicatas          | Gerar Duplicatas de Previsão                          |
| ABERTO/PARCIAL + com duplicatas PREVISTO | Visualizar previsão (read-only)                       |
| FINALIZADO + com duplicatas PREVISTO     | **[Efetivar Duplicatas]** (transiciona para PENDENTE) |
| FINALIZADO + sem duplicatas              | **[Gerar Contas Definitivas]** (direto como PENDENTE) |
| FATURADO                                 | Visualizar parcelas + movimentações (read-only)       |


### Vantagens dessa abordagem

1. **Previsão de caixa** funciona desde a criação do contrato
2. **Valor real** pode ser ajustado na efetivação (após descontos de qualidade)
3. **Separação clara**: PREVISTO = previsão, PENDENTE = real
4. **Sem duplicação**: as mesmas parcelas são "promovidas", não recriadas
5. **Flexibilidade**: usuário pode reconfigurar parcelas na efetivação se necessário

---

## Arquivos Afetados


| Arquivo                                 | Mudança                                                         |
| --------------------------------------- | --------------------------------------------------------------- |
| `src/pages/comercial/ContratosPage.tsx` | Ícone circular, listagem de parcelas previstas, botão Efetivar  |
| `src/lib/services.ts`                   | Novo método `efetivarDuplicatas()` que muda PREVISTO → PENDENTE |


## O que NÃO muda

- ContasPage.tsx, DashboardPage.tsx
- Lógica de romaneios, qualidade
- Mock data structures (apenas lógica de transição)  
  
Achei perfeita sua sugestão, só quero que ao ter uma duplicata de previsão, nós poderemos receber adiantamento referente a essa conta, pois já podemos provisionar os adiantamentos diretamente nessas contas