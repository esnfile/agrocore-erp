

## Objetivo
Reforçar a aba **Liquidação** (Comercial → Contratos) com um **painel de validações** que bloqueia a finalização quando o contrato não cumpriu todos os requisitos (sem romaneios, romaneios não finalizados, A_FIXAR sem fixação, divergência física fora da tolerância, etc.), com justificativa obrigatória para divergências.

Hoje a aba existe e gera prévia, mas só bloqueia em 2 cenários (A_FIXAR sem saldo zerado e contrato cancelado/liquidado). Falta a barreira para os demais casos — exatamente o problema relatado (liquidar sem fixação/romaneios).

## Escopo cirúrgico — não toca o que já funciona
- ✅ Mantém `contratoLiquidacaoService.gerarPrevia` / `confirmar` / `cancelar` intactos
- ✅ Mantém cálculo de romaneios, fixações, duplicatas, fluxo de caixa, estoque
- ✅ Mantém todas as outras 5 abas do contrato
- ✅ Apenas **adiciona um gate de validação** antes de permitir gerar prévia E antes de confirmar

## Mudanças

### 1. Painel de Validações (topo da aba Liquidação)
Novo componente inline em `src/pages/comercial/ContratosPage.tsx` — 5 cards de status executados via `useMemo` sobre os dados já carregados (`romaneiosContrato`, `fixacoes`, `editingContrato`, `saldoAFixar`):

| # | Validação | Regra | Estado |
|---|-----------|-------|--------|
| 1 | Romaneios Finalizados | `romaneiosContrato.filter(status=FINALIZADO).length >= 1` | ✅/❌ + contador `N/M` |
| 2 | Cumprimento Físico | `\|qtdContratada − qtdEntregueBruta\| / qtdContratada ≤ tolerância` (padrão **2%**) | ✅/⚠️/❌ |
| 3 | Preço Fixado (A_FIXAR) | `tipoPreco==="FIXO"` → N/A; senão `saldoAFixar === 0` | ✅/❌/N/A |
| 4 | Quantidade Líquida Apurada | `Σ pesoLiquido(romaneios FINALIZADOS) > 0` | ✅/❌ |
| 5 | Status dos Romaneios | nenhum romaneio vinculado com status ≠ FINALIZADO | ✅/❌ |

Cada linha mostra ícone (`CheckCircle2` / `AlertCircle` / `XCircle` do lucide-react já importado), label e detalhe numérico (ex: "1000 / 1000 SC", "Saldo a fixar: 50 SC"). Cores: verde (`text-primary`), âmbar (`text-amber-500`), vermelho (`text-destructive`) — usando os tokens já existentes.

### 2. Campo de Justificativa (condicional)
Aparece **apenas** quando Validação 2 = ⚠️ (fora da tolerância, mas sem bloqueio crítico):
- `<Textarea>` com `minLength=20`, label "Justificativa para Divergência (Obrigatória)"
- Estado local `justificativaDivergencia`
- Enquanto vazia, botões de prévia/confirmação ficam desabilitados
- Persistida em `liquidacao.observacao` ao confirmar

### 3. Gate nos botões existentes
Adicionar um `useMemo` `validacoesLiquidacao` que retorna `{ podeAvancar: boolean, bloqueios: string[], alertas: string[] }`.

- **Botão "Gerar Simulação de Liquidação"**: `disabled={!validacoesLiquidacao.podeAvancar}`. Se houver bloqueios, mostrar lista logo abaixo.
- **Botão "Confirmar e Efetivar"**: mesmo gate + checagem de justificativa quando aplicável. Antes de abrir o `AlertDialog`, revalida.
- Mensagens exatas conforme especificação (ex: "Contrato sem romaneios vinculados...", "Contrato A_FIXAR com saldo a fixar pendente (X SC)...").

### 4. Painel de Prévia (já existe — apenas reordenar)
A prévia atual continua igual, mas só renderiza quando `validacoesLiquidacao.podeAvancar === true`. Caso contrário, mostra apenas o painel de validações + mensagens de bloqueio.

### 5. Tolerância
Como `Contrato` não tem hoje campos `tolerancia_percentual_menos/mais`, usar **constante padrão 2%** declarada no topo do arquivo (`const TOLERANCIA_FISICA_PADRAO = 0.02`). Documentado como TODO para virar campo do contrato no futuro (sem migração de dados/quebra).

### 6. Bloqueio do tipo "Contrato Cancelado/Liquidado"
Mantido como está (já funciona).

## Arquivos modificados
- `src/pages/comercial/ContratosPage.tsx` (único) — adiciona `useMemo validacoesLiquidacao`, estado `justificativaDivergencia`, painel de validações no início do `<TabsContent value="liquidacao">`, gate nos botões, mensagens.

## O que NÃO muda
- `src/lib/services.ts` — nenhuma alteração no `contratoLiquidacaoService` nem em romaneios/financeiro/estoque
- `src/lib/mock-data.ts` — nenhuma alteração de schema
- Outras abas do contrato e outras telas do sistema

## Riscos e mitigação
- **Risco**: bloquear contratos legados que já estavam em fluxo. **Mitigação**: contratos com status `LIQUIDADO`/`FINALIZADO` continuam exibindo o resumo read-only sem revalidar.
- **Risco**: tolerância 2% hardcoded ser inadequada. **Mitigação**: constante isolada no topo, fácil ajustar; futura migração para campo no contrato é trivial.
- **Risco**: quebrar fluxo A_FIXAR. **Mitigação**: a validação 3 reaproveita o `saldoAFixar` já calculado e o aviso visual existente.

## Resultado esperado
Quando você abrir o contrato problemático (A_FIXAR, sem fixação, sem romaneio) e for na aba Liquidação:
- Verá o painel com ❌ em "Romaneios Finalizados", ❌ em "Preço Fixado", ❌ em "Quantidade Líquida"
- Botão "Gerar Simulação" **desabilitado** com lista clara dos motivos
- Atalho para abas correspondentes (Romaneios, Fixação) para resolver

