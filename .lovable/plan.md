

# Módulo de Duplicatas Provisórias — Plano de Implementação

## Resumo

Adicionar ao fluxo de contratos a geração automática de "duplicatas provisórias" ao criar contratos FIXO (modal automático pós-criação), painel "Saldo a Fixar" para contratos A_FIXAR com fixação de preço, coluna visual "Duplicatas?" na listagem de contratos, e seção de previsão de fluxo de caixa no Dashboard.

## O que já existe e será aproveitado

- `gerarContasDeContrato()` em services.ts — cria conta + parcelas + transiciona para FATURADO
- Modal "Gerar Contas" na aba Financeiro do ContratosPage — formulário completo com frequência, pré-visualização editável
- Aba Financeiro do Contrato — 3 cenários (ABERTO/PARCIAL, FINALIZADO, FATURADO/LIQUIDADO) com tabela de parcelas
- `FinanceiroConta`, `FinanceiroParcela`, `FinanceiroBaixa` — interfaces e mock data
- `ContratoFixacao` e painel de fixação existente — para contratos A_FIXAR
- ContasPage com listagem de parcelas, badges, status VENCIDA
- Recharts já instalado (chart.tsx existe)

## Plano de Implementação

### Etapa 1 — Interface e Mock Data (mock-data.ts)

- Adicionar `duplicatasGeradas: boolean` à interface `Contrato`
- Atualizar mock data de contratos existentes com `duplicatasGeradas: false`
- Sem novas interfaces — reutilizar `FinanceiroConta` e `FinanceiroParcela` existentes

### Etapa 2 — Service (services.ts)

- Em `gerarContasDeContrato`: setar `contrato.duplicatasGeradas = true` além de `status = "FATURADO"`
- Novo: `contratoService.salvar` — após salvar contrato FIXO **novo** (sem `id` prévio), retornar flag `{ novoContratoFixo: true }` para o frontend abrir modal
- Novo método `financeiroParcelaService.listarPrevisoesFluxo(grupoId)` — retorna parcelas PENDENTE/VENCIDA agrupadas por mês para o dashboard

### Etapa 3 — ContratosPage.tsx — Modal automático pós-criação FIXO

- Em `onSaveContrato`, após salvar contrato **novo** com `tipoPreco === "FIXO"`:
  - Salvar referência do contrato recém-criado
  - Abrir automaticamente o modal "Gerar Duplicatas Provisórias" (reutilizar o modal existente de Gerar Contas)
  - Adicionar botão "Pular por Agora" ao modal para fechar sem gerar
- O modal **não** abre ao editar, apenas ao criar
- O modal **não** abre para contratos A_FIXAR

### Etapa 4 — ContratosPage.tsx — Aba Financeiro: Painel Saldo a Fixar (A_FIXAR)

- Nos cenários ABERTO/PARCIAL da aba Financeiro, quando `tipoPreco === "A_FIXAR"`:
  - Exibir painel "Saldo a Fixar" com:
    - Total Contratado (SC)
    - Total Entregue (soma romaneios finalizados)
    - Total Fixado (soma fixações existentes com preço médio)
    - Saldo a Fixar
  - Botão `[Fixar Preço]` se saldo > 0 (redireciona para aba/modal de fixação existente)
  - Botão `[Gerar Duplicatas]` habilitado após fixação completa (todo volume fixado)
- Quando `tipoPreco === "FIXO"` e status ABERTO/PARCIAL: manter mensagem existente + adicionar botão "Gerar Duplicatas de Previsão" (mesmo modal)

### Etapa 5 — ContratosPage.tsx — Coluna "Duplicatas?" na listagem

- Adicionar coluna na tabela de contratos após "Status":
  - `✅` verde se `duplicatasGeradas === true` ou status FATURADO/LIQUIDADO
  - `❌` cinza se `duplicatasGeradas === false`
- Tooltip: "Duplicatas geradas" ou "Sem duplicatas"

### Etapa 6 — Aba Financeiro: Movimentações expansíveis nas parcelas

- Na tabela de parcelas vinculadas (cenário 3 FATURADO/LIQUIDADO), adicionar expansão por linha:
  - Ao clicar na linha, expandir mostrando movimentações (baixas) da parcela
  - Colunas: Data, Tipo (ADT/PAGT/EST), Valor, Documento, Usuário
  - Se vazio: "Nenhuma movimentação registrada"

### Etapa 7 — DashboardPage.tsx — Previsão de Fluxo de Caixa

- Expandir o Dashboard com nova seção "Previsão de Fluxo de Caixa":
  - 2 cards resumo:
    - **Previsões** (parcelas PENDENTE, amarelo): Total previsto + próximos 3 vencimentos
    - **A Pagar/Vencidas** (parcelas VENCIDA, vermelho): Total vencido + próximos vencimentos
  - Gráfico de barras (Recharts BarChart): Eixo X = meses, Série Azul = Previsões, Série Vermelha = A Pagar, Série Verde = Pago
  - Dados vindos de `financeiroParcelaService.listarTodas()`

---

## Arquivos Afetados

| Arquivo | Mudança |
|---|---|
| `src/lib/mock-data.ts` | Adicionar `duplicatasGeradas` à interface `Contrato` e mock data |
| `src/lib/services.ts` | Flag pós-criação, `listarPrevisoesFluxo`, setar `duplicatasGeradas` |
| `src/pages/comercial/ContratosPage.tsx` | Modal automático pós-criação FIXO, painel Saldo a Fixar para A_FIXAR, coluna Duplicatas?, parcelas expansíveis |
| `src/pages/DashboardPage.tsx` | Seção de previsão de fluxo de caixa com cards e gráfico |

## O que NÃO muda

- Módulo de Romaneios
- ContasPage.tsx (tela de Contas a Pagar/Receber)
- Módulo Caixa/Bancos/Movimentações
- Layout geral e navegação
- Lógica de liquidação existente

