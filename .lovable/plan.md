# Refatoração: Módulo Contas a Pagar/Receber — Parcelas como Verdade Absoluta

## Resumo

Reestruturar o módulo financeiro de Contas para operar com parcelas como entidade central. A listagem principal passa a exibir **parcelas** (não contas), a conta vira um container agrupador, e novos status são adicionados (FATURADO, LIQUIDADO no contrato; VENCIDA na parcela). A geração de contas passa a ser disparada a partir da aba Financeiro do Contrato.

## Estado Atual

O que já existe e será aproveitado:

- `FinanceiroConta`, `FinanceiroParcela`, `FinanceiroBaixa` — interfaces e mock data
- `financeiroContaService`, `financeiroParcelaService` — CRUD + geração de parcelas customizadas com pré-visualização editável
- `ContasPage.tsx` — tela funcional com abas (Dados, Parcelas, Pagamentos), gerador de parcelas avançado, filtros
- Aba Financeiro no `ContratosPage.tsx` — resumo financeiro, parcelas, histórico de baixas
- `atualizarStatus` na conta — transição automática baseada em parcelas
- Liquidação de contrato já gera/ajusta contas financeiras

O que precisa mudar:

- **StatusConta**: adicionar `LIQUIDADO`
- **StatusParcela**: adicionar `VENCIDA` e `CANCELADA`
- **StatusContrato**: adicionar `FATURADO`
- **FinanceiroConta**: adicionar campos `contratoId`, `valorTotalReal`, `dataFaturamento`, `dataLiquidacao`
- **FinanceiroParcela**: adicionar `totalParcelas`, `valorReal`
- **Listagem principal**: trocar de contas para parcelas como view principal
- **Aba Financeiro do Contrato**: adicionar botão "Gerar Contas" com transição FINALIZADO → FATURADO
- **ContasPage modal**: implementar matriz de bloqueios por status/origem

---

## Plano de Implementação

### Etapa 1 — Interfaces e Types (mock-data.ts)

**StatusConta**: `"ABERTO" | "PARCIAL" | "PAGO" | "CANCELADO"` → `"ABERTO" | "PARCIAL" | "LIQUIDADO" | "CANCELADO"`

**StatusParcela**: `"PENDENTE" | "PARCIAL" | "PAGO"` → `"PENDENTE" | "PARCIAL" | "PAGO" | "VENCIDA" | "CANCELADA"`

**StatusContrato**: adicionar `"FATURADO"` entre FINALIZADO e LIQUIDADO

**FinanceiroConta** — novos campos:

- `contratoId?: string | null`
- `valorTotalReal: number` (valor pós-liquidação do contrato não da conta, se houve algum desconto após a pesagem e lançamento dos romaneios, então no valor total teremos o valor bruto do contrato e no valor real teremos o valor apurado com os descontos ou acrescimos se houver)
- `dataFaturamento?: string | null`
- `dataLiquidacao?: string | null`

**FinanceiroParcela** — novos campos:

- `totalParcelas: number`
- `valorReal: number` (valor ajustado)

Atualizar mock data existentes para incluir novos campos com defaults.

### Etapa 2 — Services (services.ts)

`**financeiroContaService**`:

- `atualizarStatus`: adicionar lógica para `LIQUIDADO` (todas parcelas PAGO → LIQUIDADO)
- `listarPorContrato`: usar `contratoId` em vez de `documentoReferencia`
- Novo: `gerarContasDeContrato(contratoId, parcelasConfig, ctx)` — cria conta + parcelas + transiciona contrato para FATURADO

`**financeiroParcelaService**`:

- Novo: `listarTodas(empresaId, filialId, filtros)` — para listagem principal de parcelas
- Lógica de VENCIDA: parcela PENDENTE com `dataVencimento < hoje`

### Etapa 3 — ContasPage.tsx (Refatoração completa)

**Listagem principal**: trocar de contas para **parcelas** como entidade listada

- Colunas: Tipo (Pagar/Receber), Pessoa, Contrato/Parcela, Vencimento, Valor, Pago, Saldo, Status, Ações
- Filtros: Tipo, Status (incluindo VENCIDA), Pessoa, Período, Busca
- Cards resumo no topo: Total a Pagar Vencido, Total a Pagar Pendente, Total a Receber Pendente, Saldo Total
- Status VENCIDA: badge vermelho (parcelas pendentes com vencimento passado)
- Botão "+ Nova Conta Manual" mantido

**Modal Editar Conta** — 3 abas:

- **Aba Dados**: grid 3 colunas com campos Tipo, Origem (badge read-only), Status (badge read-only), Pessoa, Data Emissão, Valor Provisão, Valor Real, Documento Ref, Observações
  - Matriz de bloqueios conforme status e origem (MANUAL permite editar pessoa/tipo; CONTRATO bloqueia)
- **Aba Parcelas**: tabela read-only com expansão por linha mostrando movimentos vinculados; colunas: #, Vencimento, Valor Original, Valor Real, Pago, Saldo, Status
- **Aba Pagamentos**: 100% read-only, aviso informativo no topo, tabela de movimentações com tipo (ADT/PAGT/EST)

### Etapa 4 — Aba Financeiro do Contrato (ContratosPage.tsx)

Reestruturar a aba Financeiro com 3 cenários:

1. **Contrato ABERTO/PARCIAL**: mensagem informativa "Para gerar parcelas, finalize todos os romaneios"
2. **Contrato FINALIZADO**: botão `[Gerar Contas a Pagar/Receber]` habilitado — abre modal de configuração de parcelas (reutilizar o gerador existente com campos pré-preenchidos do contrato)
3. **Contrato FATURADO/LIQUIDADO**: botão desabilitado, exibe parcelas vinculadas em read-only, link "Ir para Contas a Pagar/Receber"

Ao clicar "Gerar":

- Criar `FinanceiroConta` com `contratoId`, `origem: "CONTRATO"`, tipo detectado do contrato (COMPRA → PAGAR, VENDA → RECEBER)
- Criar N parcelas
- Transicionar contrato: FINALIZADO → FATURADO
- Atualizar UI

### Etapa 5 — Cores e Badges

**Status Conta**: ABERTO 🟡, PARCIAL 🟠, FATURADO 🟢verde escuro, LIQUIDADO 🔵, CANCELADO 🔴

**Status Parcela**: PENDENTE 🟡, PARCIAL 🟠, PAGO 🟢, VENCIDA 🔴, CANCELADA cinza

---

## Arquivos Afetados


| Arquivo                                 | Mudança                                                                |
| --------------------------------------- | ---------------------------------------------------------------------- |
| `src/lib/mock-data.ts`                  | Interfaces, types, mock data                                           |
| `src/lib/services.ts`                   | Services de conta, parcela, geração de contrato                        |
| `src/pages/financeiro/ContasPage.tsx`   | Refatoração completa: listagem por parcelas, modal com bloqueios, abas |
| `src/pages/comercial/ContratosPage.tsx` | Aba Financeiro: 3 cenários, botão Gerar Contas                         |


## O que NÃO muda

- Módulo de Romaneios (nenhuma alteração)
- Módulo de Caixa/Bancos/Movimentações
- Lógica de liquidação existente (será complementada, não substituída)
- Layout geral e navegação do sistema
- Demais módulos financeiros (Bancos, Plano de Contas, etc.)