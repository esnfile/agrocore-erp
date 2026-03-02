## Plano: Reorganizar Modal de Pessoas com Abas

### Alteração única: `src/pages/cadastros/PessoasPage.tsx`

**Importar** `Tabs, TabsList, TabsTrigger, TabsContent` de `@/components/ui/tabs`.

**Estrutura da modal:**

```text
┌─────────────────────────────────────────────┐
│  Status (Switch) ────────── alinhado direita│
├─────────────────────────────────────────────┤
│  [Dados Gerais]  [Endereços e Contatos]     │  ← Tabs
├─────────────────────────────────────────────┤
│  ABA 1 - Dados Gerais:                      │
│  L1: Tipo Pessoa (Radio: Física/Jurídica)   │
│      + Relação Comercial (checkboxes)       │
│  L2: Grupo de Pessoas   				      │
│  L3: Nome/Razão Social                     │
│  L4: CPF/CNPJ | RG/IE | Data Nasc/Abertura │
│  L5: Sexo (se PF) ou Nome Fantasia (se PJ) │
├─────────────────────────────────────────────┤
│  ABA 2 - Endereços e Contatos:              │
│  Seção Endereços (lista dinâmica, sem mudança│
│  de lógica)                                 │
│  Seção Contatos (lista dinâmica, sem mudança│
│  de lógica)                                 │
└─────────────────────────────────────────────┘
```

**Mudanças específicas no layout da Aba 1:**

1. **Status** sobe para fora das tabs, topo da modal, alinhado à direita
2. **Linha 1**: Tipo Pessoa (radio com labels "Física" / "Jurídica") e Relação Comercial lado a lado em grid 2 colunas  
3. **Linha 2**: Grupo de Pessoas  (grid 1 coluna)  
4. **Linha 3**: Nome/Razão Social (grid 1 coluna)
  5. **Linha 4**: CPF/CNPJ + Data + RG/IE (grid 3 colunas, posição fixa)
  6. **Linha 5**: Campo condicional (Sexo ou Nome Fantasia) aparece abaixo, sem alterar posição dos demais

**Aba 2**: Move Endereços e Contatos para dentro da tab, mantendo toda lógica existente (useFieldArray, toggle padrão, máscaras, validações).

**Sem alterações**: Schema Zod, serviços, mock data, outros arquivos.


| Arquivo                               | Ação                               |
| ------------------------------------- | ---------------------------------- |
| `src/pages/cadastros/PessoasPage.tsx` | Adicionar Tabs, reorganizar campos |
