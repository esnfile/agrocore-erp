---
name: Lançamento de Caixa
description: Tela multi-tipo de movimentação. Categorias implementadas: PROLABORE, ADIANT_FORNECEDOR, ADIANT_CLIENTE, REC_DUPLICATA, PAG_DUPLICATA, GERAL, TRANSFERENCIA. Filtro Tipo↔Conta por compatibilidade. Baixa multi-parcela com distribuição sequencial por vencimento.
type: feature
---

## Arquitetura

`MovimentacoesPage` lista as movimentações e abre `LancamentoCaixaModal` (em `src/pages/financeiro/lancamento/`).

O modal tem 4 seções: Dados Base, Detalhes (varia por `tipo.categoria`), Formas de Pagamento (Dinheiro, Cheque, Cartão, Adiantamento + TOTAL), Histórico.

## Categorias implementadas

- **PROLABORE** — `DetalhesProlabore.tsx`, gera 1 movimentação com `formasPagamentoDetalhe`.
- **ADIANT_FORNECEDOR** — `DetalhesAdiantFornecedor.tsx`, consome `AdiantamentoSolicitacao` aprovada e cria `FinanceiroAdiantamento` (SAIDA).
- **ADIANT_CLIENTE** — `DetalhesAdiantCliente.tsx`, cria `FinanceiroAdiantamento` (ENTRADA) com motivo obrigatório + autorização supervisor (`REQUER_AUTORIZACAO_ADIANT_CLIENTE`).
- **REC_DUPLICATA / PAG_DUPLICATA** — `DetalhesDuplicatas.tsx` (componente único parametrizado por `tipoConta: RECEBER|PAGAR`) + `SelecionarAdiantamentoModal.tsx`.

## REC/PAG_DUPLICATA — Baixa multi-parcela

**Service:** `financeiroMovimentacaoService.registrarBaixaDuplicatas()` (atômico).

**Regra de distribuição sequencial:** parcelas selecionadas são ordenadas por `dataVencimento ASC, id ASC`; o `valorTotal` informado é aplicado liquidando totalmente as mais antigas e deixando PARCIAL apenas a última que sobrar. Status PAGO/CANCELADA/PREVISTO não podem ser selecionadas; VENCIDA pode (badge visual).

**Fonte da verdade:** o próprio `FinanceiroMovimentacao` carrega:
- `parcelasLiquidadas: [{ parcelaId, valorLiquidado, statusAntes, statusDepois }]`
- `adiantamentosUsados: [{ adiantamentoId, valor }]`

Não existem tabelas `liquidacoes_duplicata`/`liquidacoes_adiantamento` — auditoria é feita em 1 query na movimentação. Adiantamentos têm `saldoRestante` debitado e status atualizado para PARCIAL/LIQUIDADO.

**Validações:** ≥1 parcela; `valorTotal > 0`; `valorTotal ≤ soma dos saldos`; `soma formas = valorTotal`; cada adiantamento usado ≤ `saldoRestante`.

**UI:** campo "Adiantamento" em `FormasPagamentoSection` vira READ-ONLY nessas categorias — preenchido automaticamente pela soma da seleção no `SelecionarAdiantamentoModal`. Listagem expande mostrando parcelas liquidadas (status antes→depois) e adiantamentos consumidos.

## Tipo de Lançamento — flags

- `categoria: CategoriaTipoLancamento` controla o bloco de detalhes.
- `apareceNaPesquisa: false` oculta tipos AUTOMATICO no select.
- `exigeCentroCusto`, `exigePlanoContas` — obrigatoriedade no form.

## Próximos tipos

Funcionário, Depósito (Dinheiro/Cheque), Transferência, Geral. Cada um vira um `Detalhes*.tsx` + caso no switch.
