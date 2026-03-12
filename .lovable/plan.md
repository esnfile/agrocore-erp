

## Plano: Mover Condições e Descontos para Nova Aba

### Resumo

Criar uma nova aba **"Condições e Descontos"** no modal de contrato e mover para ela os blocos de **Simulação de Descontos** (linhas 891-917) e **Condições Financeiras** (linhas 919-1004). A aba **Financeiro** mantém apenas o **Resumo Financeiro** (linhas 863-889).

### Alterações — `src/pages/comercial/ContratosPage.tsx`

1. **Adicionar nova TabsTrigger** na TabsList (após "Financeiro"):
   ```
   <TabsTrigger value="condicoes" disabled={!editingContrato}>Condições e Descontos</TabsTrigger>
   ```

2. **Aba Financeiro** (value="financeiro"): remover os blocos "Simulação de Descontos" e "Condições Financeiras", mantendo apenas o "Resumo Financeiro (Simulado)".

3. **Nova TabsContent** (value="condicoes"): inserir após a TabsContent de "financeiro", contendo os dois blocos movidos (Simulação de Descontos + Condições Financeiras com grid, select de modelo e botões).

### Arquivo modificado

| Arquivo | Ação |
|---|---|
| `src/pages/comercial/ContratosPage.tsx` | Adicionar aba, mover blocos |

