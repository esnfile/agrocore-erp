

# Plano: Ajuste do Módulo Financeiro

## Resumo

Adicionar 7 novas tabelas auxiliares com interfaces/mock/services, criar 6 novas páginas CRUD, uma página de Movimentação (Caixa e Bancos), ajustar a aba Pagamentos na página Contas (somente leitura), melhorar o gerador de parcelas, criar tabela de adiantamentos, e atualizar o Fluxo de Caixa para usar movimentações.

## Estrutura do Menu Final

```text
FINANCEIRO
├── Contas (existente)
├── Caixa e Bancos (/financeiro/movimentacoes) — NOVA
├── Adiantamentos (/financeiro/adiantamentos) — NOVA
├── Tabelas
│   ├── Bancos (/financeiro/bancos) — NOVA
│   ├── Tipo de Contas (/financeiro/tipo-contas) — NOVA
│   ├── Contas Financeiras (/financeiro/contas-financeiras) — NOVA
│   ├── Tipos de Lançamento (/financeiro/tipos-lancamento) — NOVA
│   ├── Formas de Pagamento (/financeiro/formas-pagamento) — NOVA
│   ├── Plano de Contas (/financeiro/plano-contas) — NOVA
│   └── Centros de Custo (/financeiro/centros-custo) — NOVA
└── Fluxo de Caixa (existente — ajustado)
```

---

## Alterações por Arquivo

### 1. `src/lib/mock-data.ts` — Novas interfaces e dados

**7 novas interfaces + 1 tabela de adiantamentos:**

- `FinanceiroBanco` — id, codigo, descricao, logoBanco (string URL), contexto, auditoria
- `FinanceiroTipoConta` — id, descricao, ativo, contexto, auditoria
- `FinanceiroContaFinanceira` — id, descricao, tipoContaId, saldoAtual, permiteSaldoNegativo, ativo, bancoId (opcional), agencia, contaCorrente, contexto, auditoria
- `FinanceiroTipoLancamento` — id, descricao, tipoMovimento (ENTRADA|SAIDA|TRANSFERENCIA), tipoConta (string[] — tags de tipos de contas), origemSistema, permiteEdicao, permiteExclusao, exigeCentroCusto, contexto, auditoria
- `FinanceiroFormaPagamento` — id, descricao, tipo (DINHEIRO|BANCARIO|ELETRONICO), permiteParcelamento, ativo, contexto, auditoria
- `FinanceiroPlanoConta` — id, codigo, descricao, tipo (RECEITA|DESPESA), ativo, contexto, auditoria
- `FinanceiroCentroCusto` — id, descricao, ativo, contexto, auditoria
- `FinanceiroMovimentacao` — id, contaFinanceiraId, tipoLancamentoId, tipoMovimento, formaPagamentoId, planoContaId, centroCustoId, dataMovimento, valor, numeroDocumento, historico, contaOrigemId, contaDestinoId, parcelaId, contexto, auditoria
- `FinanceiroAdiantamento` — id, pessoaId, contratoId, movimentacaoFinanceiraId, dataAdiantamento, valorAdiantamento, saldoUtilizado, saldoRestante, status (ABERTO|PARCIAL|LIQUIDADO|CANCELADO), contexto, auditoria

**Dados mock pré-criados:**
- 3 bancos (BB, Caixa, Sicredi)
- 3 tipos de conta (Caixa, Banco, Carteira)
- 3 contas financeiras (Caixa Matriz, BB, Sicredi)
- 7 tipos de lançamento padrão (3 sistema + 4 editáveis)
- 9 formas de pagamento
- 6 centros de custo
- Plano de contas com códigos

### 2. `src/lib/services.ts` — Novos services

- `financeiroBancoService` — CRUD
- `financeiroTipoContaService` — CRUD simples
- `financeiroContaFinanceiraService` — CRUD + método `atualizarSaldo(id, delta)`
- `financeiroTipoLancamentoService` — CRUD com bloqueio de edição/exclusão para `origemSistema=true`
- `financeiroFormaPagamentoService` — CRUD
- `financeiroPlanoContaService` — CRUD
- `financeiroCentroCustoService` — CRUD
- `financeiroMovimentacaoService` — CRUD com lógica:
  - Derivar `tipoMovimento` do tipo de lançamento selecionado
  - ENTRADA: `saldoAtual += valor`
  - SAIDA: `saldoAtual -= valor`
  - TRANSFERENCIA: subtrai origem, soma destino
  - Validar saldo negativo quando `permiteSaldoNegativo = false`
  - Se tipo lançamento = "BAIXA CONTA PAGAR/RECEBER": atualizar parcela (valor_pago, saldo, status) e status da conta
  - Se tipo lançamento = "ADIANTAMENTO A FORNECEDOR": criar registro em `financeiroAdiantamentos`
- `financeiroAdiantamentoService` — CRUD + listar por pessoa

### 3. `src/lib/modules.ts` — Reorganizar menu Financeiro

Substituir os 2 itens atuais pela nova estrutura hierárquica com submenus "Tabelas" e itens diretos para Caixa e Bancos e Adiantamentos.

### 4. `src/App.tsx` — Novas rotas

Adicionar 8 novas rotas: bancos, tipo-contas, contas-financeiras, tipos-lancamento, formas-pagamento, plano-contas, centros-custo, movimentacoes, adiantamentos.

### 5. Novas Páginas CRUD simples (6 páginas)

Usando padrão `SimpleCrudPage` ou similar:

- `src/pages/financeiro/BancosPage.tsx` — campos: codigo, descricao, logoBanco (input URL)
- `src/pages/financeiro/TipoContasPage.tsx` — CRUD puro descricao+ativo
- `src/pages/financeiro/FormasPagamentoPage.tsx` — campos: descricao, tipo (select), permiteParcelamento (switch)
- `src/pages/financeiro/PlanoContasPage.tsx` — campos: codigo, descricao, tipo (RECEITA/DESPESA)
- `src/pages/financeiro/CentrosCustoPage.tsx` — CRUD puro descricao+ativo

### 6. `src/pages/financeiro/ContasFinanceirasPage.tsx`

Grid: Descrição, Tipo Conta, Banco, Agência, Conta Corrente, Saldo Atual, Ativo.
Modal: Descrição, Tipo Conta (select da tabela tipo_contas), Banco (select condicional), Agência, Conta Corrente, Permite Saldo Negativo (switch), Ativo. Saldo Atual readonly.

### 7. `src/pages/financeiro/TiposLancamentoPage.tsx`

Grid: Descrição, Tipo Movimento, Tipo Conta (tags), Sistema, Exige Centro Custo.
Registros de sistema não podem ser editados/excluídos.
Campo "Tipo Conta": multi-select com tags dos tipos de conta cadastrados.

### 8. `src/pages/financeiro/MovimentacoesPage.tsx` — Caixa e Bancos

Página principal de movimentação financeira com comportamento dinâmico:

- Seleciona Tipo de Lançamento → `tipoMovimento` preenchido automaticamente (readonly)
- **Lançamento Manual (ENTRADA/SAIDA):** Conta Financeira, Valor, Forma Pagamento, Plano de Contas, Centro de Custo, Documento, Histórico
- **Transferência:** Conta Origem, Conta Destino, Valor, Histórico
- **Baixa Conta Pagar/Receber:** Seleciona parcela pendente (listando contas e suas parcelas), Conta Financeira, Valor, Forma Pagamento, Documento
- Grid de movimentações registradas: Data, Tipo Lançamento, Conta Financeira, Valor, Documento, Histórico

### 9. `src/pages/financeiro/AdiantamentosPage.tsx`

Grid: Pessoa, Contrato, Data, Valor, Saldo Utilizado, Saldo Restante, Status.
Somente visualização — adiantamentos são criados automaticamente via movimentação.

### 10. Ajuste `src/pages/financeiro/ContasPage.tsx`

**Aba Pagamentos:** Remover botão "Registrar Pagamento" e modal de pagamento. A aba fica somente leitura, exibindo histórico de movimentações financeiras vinculadas via `parcelaId`. Colunas: Data, Conta Financeira, Forma Pagamento, Valor, Documento, Tipo Movimento.

**Aba Parcelas — Melhorar geração:**
- Adicionar campo "Data da primeira parcela"
- Adicionar select "Frequência": Mensal (30d), Trimestral (90d), Semestral (180d), Anual (365d), Personalizado (input dias)
- Após gerar: grid editável (data vencimento e valor editáveis)
- Validação: soma dos valores das parcelas deve ser igual ao valor total da conta antes de salvar

### 11. Ajuste `src/pages/financeiro/FluxoCaixaPage.tsx`

Alimentar o fluxo de caixa a partir de `financeiro_movimentacoes` ao invés de apenas parcelas. Manter a lógica de parcelas pendentes como "previstas" e adicionar movimentações realizadas.

---

## Regras preservadas

- Nenhuma alteração em contratos, romaneios, produtos, estoque ou menus existentes de outros módulos
- Contexto organizacional injetado automaticamente (sem campos visíveis de grupo/empresa/filial nos forms)
- Soft delete com auditoria completa
- Valores financeiros em decimal(14,2) conforme especificado no prompt

