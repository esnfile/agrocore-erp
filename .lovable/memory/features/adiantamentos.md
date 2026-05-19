---
name: Adiantamentos (Créditos + Solicitações)
description: Saldos de adiantamento (Cliente/Fornecedor), fluxo de solicitação com aprovação para Fornecedor, autorização por supervisor para Cliente, integração atômica com Caixa
type: feature
---

## Modelo

### `FinanceiroAdiantamento` — SALDO de crédito (já existente)
Representa o crédito disponível em favor de uma Pessoa. Campos chave:
- `tipoBeneficiario: "CLIENTE" | "FORNECEDOR"` — distingue os dois lados.
- `pessoaId`, `contratoId?`, `solicitacaoId?` — vinculação.
- `valorAdiantamento`, `saldoUtilizado`, `saldoRestante`, `status: ABERTO|PARCIAL|LIQUIDADO|CANCELADO`.
- `origemTipo`: `MANUAL | LIQUIDACAO_CONTRATO | DEVOLUCAO | SOLICITACAO_FORNECEDOR | CAIXA_CLIENTE`.
- `movimentacaoFinanceiraId` (string vazia "" quando crédito vem de liquidação sem caixa imediato).

### `AdiantamentoSolicitacao` — fluxo de aprovação (NOVO, só Fornecedor)
- `status: SOLICITADO → APROVADO → LIBERADO` (ou `REJEITADO`/`CANCELADO`).
- `movimentacaoFinanceiraId` + `adiantamentoId` preenchidos ao liberar no Caixa.
- Cliente NÃO tem solicitação: registra direto no Caixa com `referenciaMotivo` obrigatório.

## Fluxos

### Fornecedor (com aprovação)
1. Tela `/financeiro/adiantamentos/solicitacoes` → cria com `SOLICITADO`.
2. Admin aprova → `APROVADO`.
3. Caixa → Tipo "ADIANTAMENTO A FORNECEDOR" → seção `DetalhesAdiantFornecedor` lista APENAS solicitações `APROVADO` do fornecedor.
4. Salvar: `financeiroMovimentacaoService.registrar` cria movimentação SAIDA + `FinanceiroAdiantamento` tipoBeneficiario=FORNECEDOR + marca solicitação `LIBERADO` — **tudo atômico**.
5. Valor parcial permitido (`≤ valor solicitação`), pré-preenchido do select.

### Cliente (sem aprovação prévia, com autorização de supervisor)
1. Caixa → Tipo "ADIANTAMENTO DE CLIENTE" → seção `DetalhesAdiantCliente` (Cliente, Valor, CC, Referência obrigatória).
2. Ao salvar: flag `REQUER_AUTORIZACAO_ADIANT_CLIENTE` (constants.ts) abre `AutorizacaoSupervisorModal` pedindo senha mock `admin123`.
3. Autorizado → `registrar` cria movimentação ENTRADA + `FinanceiroAdiantamento` tipoBeneficiario=CLIENTE (sem solicitação).

### Liquidação de contrato (já existia)
- Gera `FinanceiroAdiantamento` `origemTipo=LIQUIDACAO_CONTRATO`, agora com `tipoBeneficiario=CLIENTE`.

## Regras invariantes
- TOTAL formas de pagamento = Valor (idêntico ao Prolabore).
- Solicitação Fornecedor: só transita `SOLICITADO→APROVADO/REJEITADO`, `SOLICITADO|APROVADO→CANCELADO`. `LIBERADO`/`REJEITADO`/`CANCELADO` são finais.
- Saldo de adiantamento nasce SEMPRE pelo `financeiroMovimentacaoService.registrar` — nunca diretamente — para preservar atomicidade com o caixa.

## Pontos a revisitar quando houver módulo de Permissões
- `REQUER_AUTORIZACAO_ADIANT_CLIENTE` + `SENHA_SUPERVISOR_MOCK` em `constants.ts` → substituir por checagem `usuario.nivel >= SUPERVISAO`.

## Auditoria
Geração via liquidação registrada em `MovimentacaoAjusteParcela` (tipo `ADIANTAMENTO_GERADO`). Solicitações guardam `usuarioCriacaoId`/`usuarioAprovacaoId`.
