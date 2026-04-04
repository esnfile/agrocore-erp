

# Correção: Invalidação de Classificação ao Alterar Pesagens

## Problema

Na linha 3101 de `services.ts`, `recalcularPesos()` exclui `CLASSIFICADO` e `AGUARDANDO_CLASSIFICACAO` da atualização de status. Quando o usuário altera pesagens após classificar, os dados de classificação (pesoClassificado, descontos) ficam obsoletos enquanto o status permanece `CLASSIFICADO`.

## Correção — 3 arquivos, 3 mudanças cirúrgicas

### 1. `src/lib/services.ts` — `recalcularPesos()` (linha 3093-3111)

Após calcular `pesoLiquidoFisico` (linha 3093) e antes da condição de status (linha 3101):

- Detectar se `rom.status === "CLASSIFICADO"` — se sim:
  - Zerar: `pesoClassificado = 0`, `totalPercentualDescontos = 0`, `totalPesoDescontado = 0`, `pesoLiquidoSecoLimpo = 0`, `dataClassificacao = null`
  - Regredir status: se avulso sem vínculo → `AGUARDANDO_VINCULO`, senão → `AGUARDANDO_CLASSIFICACAO`
  - Return early (não entrar no bloco de status abaixo)

- Na condição da linha 3101: remover `CLASSIFICADO` e `AGUARDANDO_CLASSIFICACAO` da exclusão (já tratados acima), ou simplesmente deixar o bloco tratar apenas os status anteriores à classificação (como já faz)

### 2. `src/pages/romaneios/steps/StepClassificacao.tsx`

Adicionar alerta informativo no topo do step quando `romaneio.status === "AGUARDANDO_CLASSIFICACAO"` e `romaneio.pesoClassificado === 0`:

> "Pesagens alteradas. Classificação invalidada. Reclassifique o romaneio."

Os inputs já ficam habilitados pois `isEditable = romaneio.status === "AGUARDANDO_CLASSIFICACAO"` (linha 52). Os valores medidos já inicializam em 0 (linha 48).

### 3. `src/pages/romaneios/steps/StepFechamento.tsx`

Na lista de `bloqueios` (linha 65-75), adicionar:
- Se `romaneio.status === "AGUARDANDO_CLASSIFICACAO"`: push `"Classificação pendente. Classifique o romaneio antes de finalizar."`
- Se `pesoComercial > romaneio.pesoLiquidoFisico`: push `"Peso comercial inconsistente com peso físico"`

## Por que funciona sem mudanças adicionais

- O stepper já usa `getMaxStepForStatus()`: `AGUARDANDO_CLASSIFICACAO` → maxStep=4, bloqueando Step 5 automaticamente
- `StepClassificacao` já habilita inputs quando status é `AGUARDANDO_CLASSIFICACAO`
- `valoresMedidos` inicializa em 0 no `useState` — reclassificação parte do zero
- Vínculo (contratoId/safraId) **não é apagado** — apenas a classificação é invalidada

## Fluxo após correção

1. Pesagem: Entrada 60k, Saída 20k → Líquido 40k
2. Classificação: 2% → Comercial 39.2k → status `CLASSIFICADO`
3. Voltar Step 2: Alterar Saída para 10k
4. `recalcularPesos()` detecta `CLASSIFICADO` → zera classificação → status `AGUARDANDO_CLASSIFICACAO`
5. Step 4: campos habilitados, valores zerados, alerta visível
6. Step 5: bloqueado (maxStep=4)
7. Reclassificar com base 50k → salvar → `CLASSIFICADO`
8. Step 5: liberado → finalizar

