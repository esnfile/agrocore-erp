

## Análise do Prompt: Duplicatas em Contratos A_FIXAR

### O que já está correto no sistema
- Existe distinção `tipoPreco: "FIXO" | "A_FIXAR"`.
- Existe `contratoFixacaoService` com cálculo de `saldo a fixar = entregue − já fixado` (validação +5% tolerância).
- Existe `gerarContasDeContrato` que aceita `fixacaoId` e marca `origem = "FIXACAO"`.
- A modal de geração de duplicatas já abre automaticamente após cada nova fixação, com valor pré-calculado `qtd × preço da fixação` — logo, **cada fixação já gera uma duplicata independente**.
- Status da conta gerada já é `"ABERTO"` (não há status `PROVISOES_CONTRATO` no projeto — o que existe é a flag `provisorio` que coloca **parcelas** em `PREVISTO`).

### Divergências do prompt vs. nosso modelo (importantes)
1. **"Status PROVISOES_CONTRATO"** não existe aqui. Nosso modelo equivalente é: contratos FIXO geram conta `ABERTO` com **parcelas em status `PREVISTO`** (provisórias) que depois viram `PENDENTE` na liquidação. Vou tratar como sinônimo.
2. O prompt diz "FIXO continua provisão". **Confirmado**: mantemos esse fluxo intacto.
3. O prompt fala em "READ-ONLY na liquidação". Hoje as duplicatas/parcelas geradas a partir de contrato já não são editáveis na aba Liquidação — apenas o passo de liquidar é executado. Vou apenas reforçar visualmente.

### O que precisa mudar (apenas A_FIXAR)

| # | Comportamento atual (A_FIXAR) | Comportamento novo |
|---|---|---|
| 1 | Após criar contrato A_FIXAR, modal de duplicatas **não** abre (correto) — mas NÃO há proteção explícita contra alguém clicar em "Gerar Duplicatas" no contrato sem fixação | Bloquear botão "Gerar Duplicatas" no nível do contrato; só permitir via fixação |
| 2 | Cada fixação já chama modal de duplicatas, mas marca `provisorio = true` (parcelas vão para `PREVISTO`) | Para A_FIXAR, gerar com `provisorio = false` → parcelas nascem `PENDENTE` (ABERTAS), pois preço já é definitivo |
| 3 | Título do modal mostra "Duplicatas Provisórias" mesmo na fixação | Ajustar título: "Duplicatas (Fixação)" sem a palavra "Provisórias" |
| 4 | Aba Liquidação: parcelas de fixação não têm tratamento visual diferenciado | Adicionar aviso "Duplicatas geradas via Fixação — não editáveis" + tooltip nas linhas |

### Viabilidade
✅ **Totalmente viável** sem quebrar regras anteriores. As mudanças são pontuais e isoladas no fluxo A_FIXAR. Contratos FIXO permanecem 100% inalterados (continuam gerando provisão `PREVISTO` na criação e efetivando na liquidação).

### Implementação (arquivo único)

**`src/pages/comercial/ContratosPage.tsx`**

1. **No handler `onSaveFixacao`** (linha ~801):
   - Quando abrir modal de duplicatas após fixação, marcar uma flag `isFixacaoDefinitiva = true` (já temos `fixacaoParaDuplicata`).
   
2. **No `onSave` do modal de gerar duplicatas** (linha ~3315):
   - Trocar `const isProvisorio = !!autoGerarDuplicatasContrato;` por:
     ```ts
     // A_FIXAR via fixação: definitivo (PENDENTE). FIXO recém-criado: provisório (PREVISTO).
     const isProvisorio = !!autoGerarDuplicatasContrato && !fixacaoParaDuplicata;
     ```
   - Já está correto — apenas verificar/garantir.

3. **Título do modal** (linha 3301):
   - Trocar `"Duplicatas Provisórias"` → exibir só quando `!fixacaoParaDuplicata && autoGerarDuplicatasContrato` (criação de FIXO).
   - Para fixação: `"Duplicatas (Fixação) — A Receber/Pagar"`.

4. **Bloquear "Gerar Duplicatas" no nível do contrato A_FIXAR** (botões nas linhas ~2196, 2216, 2305, 2354):
   - Para A_FIXAR sem fixações: ocultar/desabilitar com tooltip "Para contratos A Fixar, gere duplicatas pela aba Fixações".
   - Permitir apenas via card de cada fixação.

5. **Mensagem ao criar contrato A_FIXAR** (linha ~731):
   - Já não abre modal de duplicatas (condição `tipoPreco === "FIXO"`). Adicionar toast informativo: "Contrato A Fixar criado. Registre fixações para gerar duplicatas."

6. **Aba Liquidação — reforço visual** (apenas A_FIXAR):
   - Adicionar `Alert` no topo da seção de parcelas: "Duplicatas geradas via Fixação. Edição não permitida."
   - Aplicar `opacity-70 pointer-events-none` ou tooltip nas linhas das parcelas com `origem = "FIXACAO"`.

7. **Painel "Saldo a Fixar"** já existe; manter.

### O que NÃO muda
- Estrutura de dados (`mock-data`, services, status enums).
- Fluxo FIXO (provisão na criação, efetivação na liquidação).
- Cálculo de saldo a fixar e validação de tolerância.
- Modal de geração de parcelas (mesma UI para 1 ou N parcelas).

### Resultado
- A_FIXAR: nenhuma duplicata na criação, uma duplicata `ABERTO`/`PENDENTE` por fixação (1 ou N parcelas), bloqueio de geração avulsa, parcelas read-only na liquidação.
- FIXO: comportamento atual preservado integralmente.

### Arquivos afetados
| Arquivo | Mudança |
|---|---|
| `src/pages/comercial/ContratosPage.tsx` | Lógica `isProvisorio` por contexto, título do modal, bloqueio de botão para A_FIXAR sem fixação, alerta na aba Liquidação |

