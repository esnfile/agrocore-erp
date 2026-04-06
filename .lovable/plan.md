# 3 Correções Cirúrgicas — Classificação, Saldo e Arredondamento

## CORREÇÃO 1 — Mensagem Informativa no Step 4 + Step 2

### StepClassificacao.tsx (linhas 139-147)

- **Remover** o alerta destrutivo condicional (`variant="destructive"` + `AlertTriangle`)
- **Substituir** por mensagem informativa **permanente** (visível sempre que status não é FINALIZADO/CANCELADO):
  - Cor: azul claro / info (`bg-blue-50 border-blue-200 text-blue-700`)
  - Ícone: `Info` (lucide-react)
  - Texto: "Qualquer alteração nas pesagens invalidará a classificação, que deverá ser refeita."
  - Posição: acima do card "Apontamento de Classificação" (onde está hoje)

### StepPesagens.tsx (após linha 223, abaixo do card "Histórico de Pesagens")

- Adicionar mensagem informativa **condicional**: exibir somente quando status é posterior a `PESAGEM_PARCIAL` (ou seja, `AGUARDANDO_VINCULO`, `AGUARDANDO_CLASSIFICACAO`, `CLASSIFICADO`)
  - Mesma estilização azul/info
  - Texto: "Alterações nas pesagens invalidarão a classificação já realizada, que deverá ser refeita."  
  Caso o Status seja Finalizado ou Cancelado, não exibir a mensagem, pois não há mais o que fazer no romaneio.
  - Condição: `romaneio.status !== "RASCUNHO" && romaneio.status !== "AGUARDANDO_PESAGEM" && romaneio.status !== "PESAGEM_PARCIAL"`  


---

## CORREÇÃO 2 — Bloqueio de Saldo Apenas em Romaneios Abertos

### StepFechamento.tsx

**Saldo Contratual** (linhas 208-212): O alerta "peso classificado excede saldo" já está dentro do bloco `contratoVinculado && (...)`. Adicionar condição de status:

- Linha 208: mudar `{excedeContrato && (` para `{excedeContrato && romaneio.status !== "FINALIZADO" && romaneio.status !== "CANCELADO" && (`

**Bloqueios** (linha 74): A validação de saldo na lista de `bloqueios` já está protegida pelo `if (romaneio.status === "FINALIZADO") return []` na linha 68. Está correto — romaneios finalizados retornam array vazio.

O card "Saldo Contratual" inteiro (linhas 180-216) continua visível para consulta, mas a mensagem de alerta de excesso some quando finalizado/cancelado.

---

## CORREÇÃO 3 — Cálculo de Saldo via Subtração em KG

### Problema raiz

O contrato armazena `quantidadeTotal`, `quantidadeEntregue` e `quantidadeSaldo` na **unidade de negociação** (ex: SC). Quando o romaneio finaliza, converte `pesoClassificado` (KG) para SC via divisão, gerando frações. Essas frações acumulam divergência.

### Solução: calcular saldoKg por subtração direta

O contrato já tem `quantidadeBaseTotal` (em KG, exato). Em vez de calcular `saldoKg = quantidadeSaldo × fator`, calcular:

`saldoKg = quantidadeBaseTotal - (soma dos pesoClassificado de romaneios finalizados deste contrato)`

### romaneio-types.ts — `resolveContratoUnidadeInfo()`

Reescrever o cálculo de `saldoKg` e `entregueKg`:

- Importar `romaneios` (mock) para somar `pesoClassificado` dos romaneios finalizados do contrato
- `entregueKg = soma dos romaneios finalizados .pesoClassificado` (valor exato em KG, sem conversão)
- `saldoKg = contrato.quantidadeBaseTotal - entregueKg` (subtração exata, sem arredondamento intermediário)
- `saldoOriginal = saldoKg / fator` (apenas para exibição)
- `entregueOriginal = entregueKg / fator` (apenas para exibição)
- Usar `Math.round()` como política única de arredondamento para exibição em SC

### `fmtDualUnit()` — arredondamento consistente

- Quando `!isKg`: usar `Math.round(valor)` para a parte em SC, e manter o KG exato
- Formato: `"269 sc / 16120 kg"` (SC arredondado, KG exato)

### Contrato: `quantidadeEntregue` e `quantidadeSaldo` (services.ts linha 3038-3039)

- Manter a atualização incremental em unidade de negociação como está (para retrocompatibilidade com outras telas)
- A mudança é apenas no **cálculo de saldoKg no romaneio-types.ts**, que passa a usar `quantidadeBaseTotal` menos soma real em KG

---

## Arquivos afetados


| Arquivo                 | Mudança                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------ |
| `StepClassificacao.tsx` | Trocar alerta destrutivo por info permanente                                         |
| `StepPesagens.tsx`      | Adicionar info condicional abaixo do histórico                                       |
| `StepFechamento.tsx`    | Condicionar mensagem de excesso ao status aberto                                     |
| `romaneio-types.ts`     | `resolveContratoUnidadeInfo()`: saldoKg por subtração direta via quantidadeBaseTotal |


## O que NÃO muda

- Lógica de invalidação de classificação ao alterar pesagens
- Travas de status e navegação do stepper
- Cálculo de conversão em services.ts no finalizar
- Aparência geral da interface