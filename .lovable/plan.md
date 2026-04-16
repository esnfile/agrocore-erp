

# 4 Mudanças: Correções + Formatação Dinâmica de Moeda

## Viabilidade

Tudo é viável. O sistema já tem `Moeda`, `CotacaoMoeda` e `cotacaoMoedaService.obterUltima()`, e contratos/fixações já carregam `moedaId`. Só precisamos propagar a moeda na UI e ajustar a conversão para BRL no momento de gerar/efetivar duplicatas (já que o financeiro opera em BRL).

---

## Correção 1 — Frequência de Parcelas Condicional (UX)

**Onde:** `ContratosPage.tsx` (modal "Gerar Duplicatas") + `ContasPage.tsx` (modal "Gerar Parcelas").

- Quando `numParcelas === 1`:
  - Ocultar campo "Frequência" e "Intervalo (dias)".
  - Label muda para **"Data de Vencimento"** (era "Data da Primeira Parcela").
  - Texto auxiliar: *"Parcela única com vencimento em [data]"*.
- Quando `numParcelas >= 2`: comportamento atual (label "Data da Primeira Parcela" + frequência visível).

---

## Correção 2 — Filtro de Parcelas PREVISTO no Caixa (CRÍTICO)

**Onde:** `src/pages/financeiro/MovimentacoesPage.tsx` + `services.ts`.

- No `useEffect` que carrega `parcelas` para Baixa de Duplicata, alterar filtro:
  ```ts
  setParcelas(p.filter((par) => par.status !== "PAGO" && par.status !== "PREVISTO" && par.status !== "CANCELADA"));
  ```
- Adicionar validação no `financeiroMovimentacaoService.registrar`: se `parcelaId` aponta para parcela `PREVISTO`, retornar `{ sucesso: false, mensagem: "Duplicata em status de previsão não pode ser baixada. Aguarde a efetivação do contrato." }`.
- Também filtrar contas no dropdown anterior (mostrar apenas contas com pelo menos 1 parcela em `PENDENTE/PARCIAL/VENCIDA`).

---

## Correção 3 — Cálculo Correto para Múltiplas Fixações em A_FIXAR

**Onde:** `ContratosPage.tsx` (modal de fixação + fluxo pós-fixação) + `services.ts`.

Estado atual: já existe `totalFixado` e `saldoAFixar` calculados, e `quantidadeFixada` no schema da fixação.

Mudanças:

1. **Painel no modal de Fixação** (acima dos campos):
   - Total Contratado: X SC
   - Romaneios Finalizados: Y SC
   - Total já Fixado (anterior): Z SC
   - **Saldo a Fixar AGORA**: Y − Z SC (auto)
   - **Valor desta Fixação**: (Saldo a Fixar AGORA × Preço informado) — read-only, atualiza em tempo real
2. `quantidadeFixada` é pré-preenchida com `Y − Z` (editável até esse máximo).
3. **Após salvar a fixação**, abrir automaticamente o modal "Gerar Duplicatas" com:
   - `valorTotal = quantidadeFixada × precoFixado` (convertido para BRL via cotação se moeda ≠ BRL) — read-only.
   - Resto do fluxo igual (forma de pagamento, datas, parcelas).
4. Cada fixação gera **uma duplicata independente** (uma `FinanceiroConta` com suas parcelas `PREVISTO`). O `gerarContasDeContrato` precisa aceitar parâmetro opcional `{ fixacaoId, valorOverride }` para não usar `quantidadeContrato × precoUnitario` (que é 0 em A_FIXAR).

---

## Nova Funcionalidade — Formatação Dinâmica de Moeda

**Escopo (conforme você pediu):** apenas Contratos e Fixações exibem moeda do contrato. Financeiro/Caixa/Dashboard continuam em BRL — com **conversão pela cotação** no momento de gerar duplicatas.

### A) Helper utilitário (`src/lib/format.ts` — novo)

```ts
export function formatMoeda(valor: number, simbolo: string, locale = "pt-BR"): string {
  // BRL/EUR → pt-BR (1.234,56) | USD/GBP → en-US (1,234.56)
  const useEnUs = simbolo === "$" || simbolo === "£";
  return `${simbolo} ${valor.toLocaleString(useEnUs ? "en-US" : "pt-BR", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  })}`;
}
```

### B) Contrato — campo moeda já existe
- Já é obrigatório e selecionável. Adicionar regra: **bloquear edição de `moedaId` quando `editingContrato` existe** (disabled no Select).
- Substituir todos os `formatCurrency(v, "BRL")` da página por `formatMoeda(v, simboloMoedaContrato)` para: Preço Unitário, Valor Total, Valor Bruto, Saldo, painel Saldo a Fixar.
- Labels dinâmicos: `Valor Total ({simbolo})`, `Preço Unitário ({simbolo}/SC)`.

### C) Fixação
- Painel novo da Correção 3 usa `formatMoeda` com símbolo do contrato.
- Modal "Gerar Duplicatas" (após fixação): exibir lado a lado **`{simbolo} X` (moeda original) → `R$ Y` (convertido pela cotação)** quando moeda ≠ BRL. O valor salvo na conta financeira é em BRL.

### D) Conversão BRL
- Ao gerar duplicatas (FIXO ou A_FIXAR), em `services.ts`:
  ```ts
  const cotacao = moedaId === "moeda1" ? 1 
    : cotacaoMoedaService.obterUltima(moedaId, "moeda1")?.valorCompra ?? 1;
  const valorBRL = valorOriginal * cotacao;
  ```
- Armazenar `valorBRL` na `FinanceiroConta` + parcelas. Adicionar campos opcionais `moedaOrigemId` e `cotacaoUsada` em `FinanceiroConta` (mock-data) para rastreabilidade.

### E) Financeiro / Caixa / Dashboard
- **Sem mudanças** — continuam exibindo `R$` (moeda do sistema). Conforme você pediu.

---

## Ordem de Implementação

1. **Correção 2** (segurança/dados)
2. **Correção 3 + helper formatMoeda + conversão BRL** (juntos, pois fixação aciona geração)
3. **Correção 1** (UX simples)
4. **Aplicar formatMoeda em ContratosPage** (rótulos e displays)

---

## Arquivos Afetados

| Arquivo | Mudança |
|---|---|
| `src/lib/format.ts` *(novo)* | Helper `formatMoeda(valor, simbolo)` |
| `src/lib/mock-data.ts` | Campos opcionais `moedaOrigemId`, `cotacaoUsada` em `FinanceiroConta` |
| `src/lib/services.ts` | Filtro PREVISTO em parcelas; validação em `registrar`; `gerarContasDeContrato` aceita `valorOverride`+`fixacaoId`; conversão BRL |
| `src/pages/financeiro/MovimentacoesPage.tsx` | Filtro PREVISTO/CANCELADA no dropdown de parcelas |
| `src/pages/financeiro/ContasPage.tsx` | Frequência condicional (Correção 1) |
| `src/pages/comercial/ContratosPage.tsx` | Frequência condicional; painel Fixação com Saldo/Valor; auto-abrir modal duplicatas pós-fixação; `formatMoeda` em todos os displays; bloquear edição de moeda |

## O que NÃO muda

- DashboardPage, FluxoCaixaPage, ContasPage (listagem) — continuam em BRL
- Estrutura geral de mock-data e fluxos de Romaneio/Qualidade
- Lógica de efetivação `PREVISTO → PENDENTE` (já implementada)

