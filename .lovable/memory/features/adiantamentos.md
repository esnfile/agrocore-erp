---
name: Adiantamentos (Créditos)
description: Ciclo de vida, vinculação atômica a Pessoa+Conta+Contrato, baixa com abatimento
type: feature
---

## Adiantamento (`FinanceiroAdiantamento`)

Crédito a favor de uma Pessoa, vinculado opcionalmente a Conta + Contrato origem.

### Origens (`origemTipo`)
- `MANUAL`: lançamento direto pelo operador.
- `LIQUIDACAO_CONTRATO`: gerado automaticamente quando liquidação reduz valor além do saldo pendente (cliente pagou mais do que o real liquidado).
- `DEVOLUCAO`: reembolso/devolução manual.

### Vinculação atômica
- `pessoaId` (sempre)
- `contratoId` (quando origem = liquidação ou cadastrado em contrato)
- `liquidacaoOrigemId` + `contaOrigemId` (rastreabilidade)

### Caixa
- **NÃO movimenta caixa ao ser CRIADO por liquidação.** Status `ABERTO`, `movimentacaoFinanceiraId = ""`.
- Caixa só é movimentado na **UTILIZAÇÃO** (baixa de duplicata com abatimento) — tipo `BAIXA_DUPLICATA_COM_ABATIMENTO`, documentando crédito utilizado, parcela reduzida e valor real que entrou no caixa.

### Status
- `ABERTO`: saldo total disponível.
- `PARCIAL`: parte do crédito já utilizada.
- `LIQUIDADO`: saldo esgotado.
- `CANCELADO`: estornado.

### Auditoria
Geração registrada em `MovimentacaoAjusteParcela` (tipo `ADIANTAMENTO_GERADO`) com `dadosExtras.adiantamentoId`.
