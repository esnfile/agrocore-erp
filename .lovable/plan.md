

## Fluxo em Steps para Criação de Conta (Eliminar Conta Órfã)

### Problema atual
Ao criar conta manual, salvamos primeiro a conta e depois mandamos para aba Parcelas. Se o usuário fecha o modal, fica uma conta órfã sem parcelas — exatamente o tipo de inconsistência que estamos tentando evitar.

### Decisão: adotar padrão Stepper (igual Romaneio)

Sua segunda sugestão é a correta. O padrão de Stepper já existe no projeto (`RomaneioStepper`), é familiar ao usuário, e resolve o problema na raiz: **nada é persistido até o último passo**.

A primeira sugestão (botão "Ir para Parcelas") só mascara o problema — o usuário ainda pode fechar e gerar órfão.

### Novo fluxo (apenas para CRIAÇÃO manual)

```text
[Step 1: Dados da Conta] → Avançar →  [Step 2: Parcelas] → Salvar
       (em memória)                   (em memória)        (persiste tudo)
```

- **Step 1 — Dados da Conta**: todos os campos atuais. Botão "Avançar" valida campos obrigatórios e move para Step 2 sem persistir.
- **Step 2 — Parcelas**: usuário define qtd parcelas, intervalo e gera (cálculo em memória). Botões: "← Voltar" (volta ao Step 1 mantendo dados) e "Salvar Conta" (persiste conta + parcelas atomicamente).
- **Cancelar**: descarta tudo. Nenhum registro criado.

### Modo EDIÇÃO (inalterado)
Edição continua com Tabs (Dados / Parcelas), pois a conta já existe e as regras de bloqueio (`podeRecriarParcelas`) seguem valendo. Sem stepper na edição.

### Modo CRIAÇÃO via Contrato (inalterado)
Continua sendo gerada pelo serviço do contrato — não passa por este fluxo manual.

### Implementação

**Arquivo único:** `src/pages/financeiro/ContasPage.tsx`

1. **Substituir tabs por stepper quando `modalMode === "create"`**:
   - Componente local `ContaStepper` (2 passos: "Dados" / "Parcelas") seguindo visual de `RomaneioStepper`.
   - Estado novo: `createStep: 1 | 2`, `parcelasDraft: ParcelaDraft[]` (em memória).

2. **Step 1 (Dados)**: reaproveitar formulário atual. Footer:
   - `Cancelar` (fecha modal, descarta)
   - `Avançar →` (valida → `setCreateStep(2)`)

3. **Step 2 (Parcelas em memória)**:
   - Reusar UI de geração (qtd, intervalo, primeira data) — mas grava em `parcelasDraft`, não chama serviço.
   - Tabela mostra `parcelasDraft` com edição inline de vencimento/valor permitida (é tudo rascunho).
   - Footer:
     - `← Voltar` (mantém `parcelasDraft`)
     - `Cancelar` (descarta tudo)
     - `Salvar Conta` (desabilitado se `parcelasDraft.length === 0`)

4. **Persistência atômica em "Salvar Conta"**:
   ```ts
   const saved = await contaService.criar({...formData});
   await Promise.all(parcelasDraft.map((p, i) => 
     financeiroParcelaService.criar({ contaId: saved.id, numero: i+1, ...p })
   ));
   ```
   Se a primeira chamada falhar, nada é criado. Se as parcelas falharem (improvável em mock), reverter via `contaService.excluir(saved.id)`.

5. **Validação de fechamento**: no `onOpenChange` do Dialog, se `modalMode === "create"`, exibir `confirm()` "Descartar conta? As informações serão perdidas." antes de fechar.

6. **Remover lógica antiga**: o `handleSave` que persistia conta vazia e forçava troca para aba Parcelas é descartado para o modo create. Edição continua usando o handler atual.

### Arquivos afetados

| Arquivo | Mudança |
|---|---|
| `src/pages/financeiro/ContasPage.tsx` | Stepper de 2 passos para criação; estado `parcelasDraft`; persistência atômica; confirmação ao cancelar |

### O que NÃO muda
- Modo edição (tabs continuam, regras de bloqueio mantidas)
- Geração via contrato
- Estrutura de dados, services, mock-store
- Aba/lógica de parcelas em si (cálculo, formato, valores)

### Resultado
- Impossível criar conta manual sem parcelas
- Impossível deixar conta órfã ao cancelar
- Fluxo familiar (igual Romaneio)
- Edição preservada com regras de integridade já implementadas

