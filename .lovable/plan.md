## Validação inteligente de saldo (Caixa, Carteira, Banco com limite)

### Objetivo
Substituir a flag genérica `permiteSaldoNegativo` + `window.confirm` por uma regra baseada no **tipo da conta**:
- **CAIXA / CARTEIRA** → nunca permite negativo. Bloqueia sempre.
- **BANCO** → permite negativo até `limiteCreditoBancario`. Acima disso, bloqueia.

### 1. Modelo de dados (`src/lib/mock-data.ts`)
- Adicionar campo `limiteCreditoBancario: number` (default `0`) em `FinanceiroContaFinanceira`.
- Manter `permiteSaldoNegativo` no tipo por compatibilidade, mas marcar como deprecated em comentário e parar de usá-lo.
- Atualizar mocks `financeiroContasFinanceiras`:
  - Caixa Matriz (CAIXA): `limiteCreditoBancario: 0`.
  - Banco do Brasil (BANCO): `limiteCreditoBancario: 10000`.
  - Sicredi (BANCO): `limiteCreditoBancario: 50000` (remover `permiteSaldoNegativo: true`).
  - Carteira (CARTEIRA): `0`.
  - Caixa Filial (CAIXA): `0`.
  - Banco Inativo (BANCO): `0` (para cenário "sem limite").

### 2. Helper de validação
Novo arquivo `src/pages/financeiro/lancamento/saldo-utils.ts` com:
- `getTipoContaDescricao(conta, tiposContas): "CAIXA" | "BANCO" | "CARTEIRA" | null`
- `avaliarSaldo(conta, tiposContas, valor) → { status: "ok" | "aviso" | "bloqueado", saldoResultante, mensagem }`
  - CAIXA/CARTEIRA: `valor > saldo` → `bloqueado` ("Saldo insuficiente em {conta}. Operação não permitida.")
  - BANCO: calcula `saldoResultante`; classifica em `ok`, `aviso` (dentro do limite — "Saldo entrará em limite de crédito. Resultante: R$ X") ou `bloqueado` ("Limite de crédito de R$ Y ultrapassado. Operação não permitida.")

### 3. `LancamentoCaixaModal.tsx`
- Remover `window.confirm` de `salvarTransferencia`.
- Antes de chamar `service.registrar` em **todas** as funções de salvar (`salvarTransferencia`, `salvarGeral`, `salvarProlabore`, `salvarAdiantFornecedor`, `executarSalvarAdiantCliente`, `salvarBaixaDuplicatas`), chamar `avaliarSaldo(origem, tiposContas, valor)`:
  - `bloqueado` → toast destructive + return.
  - `aviso` → toast informativo (variant default) e prossegue.
  - `ok` → segue normal.
- Valor avaliado por categoria:
  - GERAL → `totalGeral`
  - DUPLICATAS → `totalFormas` (apenas se categoria PAG_DUPLICATA, pois RECEBIMENTO entra dinheiro). Aplicar bloqueio só para saídas.
  - Transferência/Prolabore/Adiantamentos → `valorDetalhe`.
- Critério de "saída": tipo de lançamento tem `natureza === "SAIDA"` ou categoria pertence ao conjunto `{ PROLABORE, ADIANT_FORNECEDOR, PAG_DUPLICATA, GERAL (apenas despesa), TRANSFERENCIA }`. Para GERAL e ADIANT_CLIENTE usar `tipoSel.natureza` (já existe no mock — confirmar; se não houver, usar a categoria).
- Passar `tiposContas` (já disponível via `financeiroTipoContas` importado).

### 4. Aviso inline nos componentes de detalhe
- `DetalhesTransferencia.tsx`: substituir aviso atual por bloco dinâmico usando `avaliarSaldo`:
  - `aviso` → texto laranja (`text-warning` ou classe inline `text-orange-600`).
  - `bloqueado` → texto vermelho (`text-destructive`).
- `DetalhesGeral.tsx`: receber `contaOrigem` + `tiposContas` via props (passados pelo modal) e exibir aviso pré-salvar com base no `totalGeral`.
- (Opcional, fora do checklist do prompt) Não adicionar em Prolabore/Adiantamentos/Duplicatas neste ciclo — validação ocorre no salvar. Mantém escopo enxuto, conforme o prompt foca em Transferência/Geral.

### 5. Cadastro de Contas Financeiras (`ContasFinanceirasPage.tsx`)
- Adicionar input **"Limite de Crédito Bancário"** (numérico, BRL) visível apenas quando `mostrarBanco` for true.
- Estado `limiteCreditoBancario`, default `0`. Persistir via `financeiroContaFinanceiraService.salvar` (verificar e estender o service para aceitar o campo).
- Manter o Switch `permiteSaldoNegativo` por enquanto (apenas exibe — não influencia mais), ou remover. **Decisão proposta: remover o switch da tela** e do payload de salvar; o campo no banco fica como legado.

### 6. Service
- `src/lib/services.ts` / `mock-store.ts`: ajustar `financeiroContaFinanceiraService.salvar` para aceitar e persistir `limiteCreditoBancario`. Default `0` quando não enviado.

### 7. Mensagens (toast)
- Sucesso transferência: continuar como está.
- Erro CAIXA/CARTEIRA: `"Saldo insuficiente em {conta}. Operação não permitida."`
- Erro BANCO acima do limite: `"Limite de crédito de R$ {limite} ultrapassado. Operação não permitida."`
- Aviso BANCO dentro do limite: toast default "Saldo entrará em limite de crédito. Resultante: R$ {x}".

### 8. Casos de teste manuais
Validar os 10 cenários da tabela do prompt (CAIXA OK/insuf, BANCO dentro/fora/sem limite, CARTEIRA insuf, e avisos inline correspondentes em Transferência).

### Fora de escopo
- Validação backend ACID (apenas frontend/mock por enquanto).
- Avisos inline em Prolabore/Adiantamentos/Duplicatas (validação só no salvar).
- Migration de dados existentes (mock).
