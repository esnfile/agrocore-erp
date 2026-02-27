

## Correções Fase 0.1

### Correção 1 — Popover dos submenus: background visível + abrir no hover

**`src/components/AppSidebar.tsx`:**
- Trocar `PopoverContent` className de `bg-sidebar-background` para `bg-sidebar/95 backdrop-blur-sm border border-sidebar-border shadow-lg` (translúcido com a cor do sidebar, mas legível)
- Substituir o trigger de click para hover: no `RecursiveMenuItem`, usar `onMouseEnter` para abrir o Popover e `onMouseLeave` (com delay) para fechar
- Mesmo tratamento nos Popovers do modo collapsed
- Implementar um pequeno delay (~150ms) no `onMouseLeave` para evitar flickering ao mover o mouse entre trigger e popover

### Correção 2 — Seletor de Grupo no cadastro de Empresa

**`src/pages/admin/EmpresasPage.tsx`:**
- Adicionar campo `grupoId` ao schema Zod (obrigatório)
- Adicionar um `<Select>` no formulário do modal que lista os grupos disponíveis (vindos de `useOrganization().grupos`)
- Ao criar nova empresa, pré-selecionar o `grupoAtual.id`
- Usar `react-hook-form` `setValue`/`Controller` para integrar o Select com o form
- Exibir coluna "Grupo" na DataTable

### Correção 3 — Campos flexíveis: Razão Social/Nome e CNPJ/CPF

**`src/lib/mock-data.ts`:**
- Renomear campo `cnpj` para `cpfCnpj` na interface `Empresa`
- Adicionar campo opcional `tipoPessoa: "PF" | "PJ"` à interface

**`src/pages/admin/EmpresasPage.tsx`:**
- Adicionar toggle/radio "Pessoa Física / Pessoa Jurídica" no formulário
- Label do campo muda dinamicamente: "CPF" ou "CNPJ"
- Label do campo razão social muda: "Nome" (PF) ou "Razão Social" (PJ)
- Validação Zod condicional: CPF (11 chars) ou CNPJ (14 chars)
- Atualizar colunas da DataTable: header "CPF/CNPJ", header "Nome/Razão Social"

**`src/lib/services.ts`:**
- Atualizar mock data das empresas para usar `cpfCnpj` e `tipoPessoa`

### Arquivos afetados

| Arquivo | Ação |
|---|---|
| `src/components/AppSidebar.tsx` | Background + hover nos popovers |
| `src/pages/admin/EmpresasPage.tsx` | Seletor grupo + campos PF/PJ |
| `src/lib/mock-data.ts` | `cpfCnpj` + `tipoPessoa` na interface Empresa |
| `src/lib/services.ts` | Atualizar mock data |

