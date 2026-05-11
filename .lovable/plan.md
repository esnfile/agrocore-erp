
# Geração Financeira por Fixação Parcial (A_FIXAR)

## Objetivo
Permitir que cada fixação de preço gere seu próprio financeiro independentemente do contrato estar 100% fixado, abrindo o modal de parcelas logo após salvar a fixação. A liquidação final do contrato continua exigindo `saldoAFixar = 0` (regra mantida).

## Mudanças

### 1. UX — Abrir modal ao salvar fixação
Arquivo: `src/pages/comercial/ContratosPage.tsx` (função `onSaveFixacao`, ~linha 920–942)

Após `loadSubEntities`, recuperar a fixação recém-salva (pelo `id` retornado) e disparar o mesmo fluxo que o botão "Gerar" da tabela "Fixações Realizadas":
- `setFixacaoParaDuplicata(fixSalva)`
- resetar `gcNumParcelas`, `gcFrequencia`, `gcDiasPersonalizado`, `gcDataPrimeiraParcela`, `gcParcelasEditaveis`, `gcParcelasGeradas`
- `setGerarContasOpen(true)`

Aplicar somente quando:
- contrato é `A_FIXAR`
- a fixação ainda não tem `contasGeradas`
- existe pelo menos 1 romaneio `FINALIZADO` (mesma checagem `temRomaneios` já usada na tabela). Caso contrário, manter o toast atual sem abrir o modal e mostrar mensagem orientando a finalizar romaneio.

### 2. Liberar geração mesmo com saldo a fixar pendente
Já está liberado tecnicamente (botão "Gerar" só bloqueia por ausência de romaneio finalizado ou se a fixação já tem contas). Nenhuma trava extra exige 100% fixado para gerar financeiro. Apenas reforçar texto:

- Card "🎯 Saldo a Fixar" (linha ~2652): trocar a nota para
  > "Cada fixação gera sua própria duplicata. A liquidação final do contrato só será liberada quando todo o saldo a fixar for zerado."

### 3. Validações que NÃO mudam
- `canLiquidate` (linha 1037) e painel de validações (linha 1131) continuam bloqueando liquidação enquanto `saldoAFixar > 0`.
- `gerarContasDeContrato` em `services.ts` já cria 1 conta por `fixacaoId` (chave `contratoId + fixacaoId`), portanto fixações parciais geram contas independentes sem colidir com a conta de outras fixações.
- Reconfiguração de parcelas continua isolada por fixação.

### 4. Memória do projeto
Atualizar `mem://features/contratos.md` adicionando uma linha na seção Faturamento:
- "A_FIXAR: cada fixação gera sua própria Conta Financeira (1 Conta = 1 Fixação). Liquidação final exige saldoAFixar = 0."

E ajustar a Core do índice se necessário (a regra "Uma Conta = Um Contrato" passa a ter exceção para A_FIXAR — registrar como "Uma Conta = Um Contrato (FIXO) ou Uma Conta = Uma Fixação (A_FIXAR)").

## Critérios de aceite
- Salvar uma fixação parcial (ex.: 500 SC de 1000) abre automaticamente o modal "Gerar Duplicatas (Fixação)" com o valor daquela fixação preenchido.
- Confirmar gera 1 conta vinculada à fixação, com parcelas em `PENDENTE`, sem mexer no status do contrato.
- Saldo a Fixar continua mostrando o restante; novas fixações geram novas contas independentes.
- Aba Liquidação permanece bloqueada enquanto `saldoAFixar > 0`.
- Se não houver romaneio FINALIZADO, o modal NÃO abre e o usuário recebe orientação para finalizar o romaneio antes.
