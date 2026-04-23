---
name: Contratos Comerciais
description: Regras de A_FIXAR, fixação por preço médio ponderado, faturamento, e LIQUIDAÇÃO com tratamento atômico de títulos
type: feature
---

## Contratos — Regras Centrais

### Tipos
- **FIXO**: preço definido na criação.
- **A_FIXAR**: preço apurado por fixações (preço médio ponderado por quantidade fixada).

### Pesos no Romaneio (vinculação ao contrato)
- **Físico (`pesoLiquidoFisico`)**: usado para tolerância contratual e estoque.
- **Classificado (`pesoLiquidoSecoLimpo`)**: base FINANCEIRA — fixação, faturamento, liquidação.

### Faturamento
- Gera **Conta Financeira** (`mockFinanceiroContas`) + parcelas vinculadas.
- `documentoReferencia = numeroContrato`.
- **Uma Conta = Um Contrato.** Nunca criar conta órfã.

---

## LIQUIDAÇÃO — Regras Invioláveis

### Princípios
1. Conta vinculada é a fonte da verdade financeira.
2. **Parcelas pagas são imutáveis** (caixa é histórico).
3. Toda alteração é atômica + auditada (`MovimentacaoAjusteParcela`).
4. Refresh automático nas abas após confirmar.

### Fluxo Automático (sem dropdown ATUALIZAR/COMPLEMENTAR)
Sistema decide cenário comparando `valorLiquido` (apurado) vs soma de parcelas:

**IGUAL**: promove `PREVISTO → PENDENTE`. Auditoria.

**MENOR** (liquidação reduz):
- Reduz APENAS pendentes. Pagas preservadas.
- Distribuição: `PROPORCIONAL` (default) ou `ULTIMA` (escolha do usuário via modal).
- Modal de escolha aparece se `% redução > THRESHOLD_REDACAO_DIFERENCA` (parametrizável, default 1.5%) OU redução > última parcela.
- Se redução exceder saldo pendente → **gera Adiantamento (CRÉDITO)** vinculado a Pessoa + Contrato + Conta origem. `origemTipo = "LIQUIDACAO_CONTRATO"`. Status `ABERTO`. **SEM** movimento de caixa imediato — caixa só entra na baixa futura.

**MAIOR** (liquidação aumenta):
- Cria nova parcela `BONIFICAÇÃO` (Pn+1) DENTRO da conta original (nunca conta nova).
- `tipoEspecial = "BONIFICACAO"`.
- Vencimento: MAX(última parcela, dataLiquidação) — fallback `dataLiquidação + 30d` se já vencida.
- Originais permanecem identificáveis e intactas.

### Auditoria (`MovimentacaoAjusteParcela`)
Toda alteração registra: `tipoMovimento`, `valorAnterior`, `valorNovo`, `diferenca`, `motivo`, `usuarioId`, `dataMovimento`, `dadosExtras`.

Tipos: `AJUSTE_LIQUIDACAO`, `PROMOCAO_PREVISTO_PENDENTE`, `BONIFICACAO_GERADA`, `ADIANTAMENTO_GERADO`, `PARCELA_ZERADA`.

Visível na aba Financeiro do contrato — painel "Histórico de Alterações".

### Status da Conta após liquidação
Recalculado automaticamente: `ABERTO` (se há saldo) / `PARCIAL` (parcial) / `LIQUIDADO` (zerado).

### NUNCA fazer
- ❌ Criar conta órfã (modo COMPLEMENTAR antigo foi removido).
- ❌ Tocar em parcela `PAGO`.
- ❌ Usar `Math.abs` ignorando direção da diferença.
- ❌ Movimentar caixa ao gerar adiantamento (só na utilização).
