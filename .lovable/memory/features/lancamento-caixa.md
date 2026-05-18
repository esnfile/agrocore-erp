---
name: Lançamento de Caixa
description: Tela multi-tipo de movimentação de caixa/bancos com accordions (Dados Base, Detalhes dinâmico, Formas de Pagamento, Histórico). Cada tipo de lançamento tem uma categoria que dispara o bloco de detalhes correspondente.
type: feature
---

## Arquitetura

Tela `MovimentacoesPage` lista as movimentações e abre `LancamentoCaixaModal` (em `src/pages/financeiro/lancamento/`).

O modal é composto por 4 accordions:
- **Dados Base** (sempre aberto inicialmente): Empresa, Filial, Conta Financeira, Data, Tipo de Lançamento
- **Detalhes** (abre automaticamente ao selecionar o tipo): conteúdo varia por `tipo.categoria`
- **Formas de Pagamento**: Dinheiro, Cheque, Cartão, Adiantamento + TOTAL + alerta de divergência
- **Histórico**: Textarea máx 500 chars

## Tipo de Lançamento — categoria

Campo `categoria: CategoriaTipoLancamento` em `FinanceiroTipoLancamento` controla o bloco de detalhes:
PROLABORE, REC_DUPLICATA, PAG_DUPLICATA, ADIANT_FORNECEDOR, ADIANT_CLIENTE, FUNCIONARIO, DEPOSITO_DINHEIRO, DEPOSITO_CHEQUE, TRANSFERENCIA, GERAL, AUTOMATICO.

Outros flags relevantes:
- `apareceNaPesquisa: boolean` — tipos `AUTOMATICO` (ex: "BAIXA CONTA RECEBER" gerada pelo sistema) ficam ocultos no select de lançamento.
- `exigeCentroCusto`, `exigePlanoContas` — tornam os campos obrigatórios na tela.

## Regra TOTAL = Valor

Para tipos com valor único (Prolabore, etc.), a soma das 4 formas de pagamento deve ser igual ao valor informado em Detalhes. Bloqueia salvar.

## Sócio

Pessoas marcadas como sócio têm `"Sócio"` em `relacaoComercial: string[]`. O dropdown de Sócio na tela de Prolabore filtra por isso.

## Persistência de Prolabore

Cada forma de pagamento com valor > 0 gera **uma** `FinanceiroMovimentacao` separada, todas amarradas por um mesmo `numeroDocumento` (`PRO-{timestamp}`). Permite refletir corretamente o caixa real (dinheiro entra em Caixa, cheque sai do Banco, etc.) no futuro.

## Próximos tipos a implementar

Ordem prevista: Recebimento de Duplicatas → Saída para Depósito (Dinheiro/Cheque) → Pagamento de Funcionários → Adiantamentos → Transferências → Geral. Cada um vira um componente `Detalhes*.tsx` na pasta `lancamento/` e um caso no switch do modal.
