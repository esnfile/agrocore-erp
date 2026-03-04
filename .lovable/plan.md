

## Plano: Reorganização de Menu + Alteração de Rotas de Pessoas

### 1. Excluir menu "Cadastros" — `src/lib/modules.ts`
Remover o módulo "Cadastros" inteiro (linhas 102-110).

### 2. Excluir rotas placeholder de Cadastros — `src/App.tsx`
Remover linhas 57-59 (`/cadastros/produtos`, `/cadastros/categorias`, `/cadastros/locais-estoque`).

### 3. Alterar rotas de Pessoas e Grupo de Pessoas
Mover de `/cadastros/` para `/admin/`:
- `/cadastros/pessoas` → `/admin/pessoas`
- `/cadastros/grupo-pessoas` → `/admin/grupo-pessoas`

**Arquivos afetados:**
- `src/lib/modules.ts` — URLs nos itens do menu Administrativo > Tabelas Gerais > Pessoas
- `src/App.tsx` — Rotas (linhas 55-56)

### 4. Excluir "Estrutura de Estoque" — `src/lib/modules.ts`
Remover item `Estrutura de Estoque` de Auxiliares (linha 161). Remover rota em `App.tsx` (linha 84).

### 5. Excluir "Permissões" de Usuários — `src/lib/modules.ts`
Remover `Permissões` do submenu GerSys > Usuários (linha 85). Remover rota `/admin/permissoes` em `App.tsx` (linha 49).

### 6. Mover "Divisão de Produto" para Classificação — `src/lib/modules.ts`
Remover da lista Tabelas (linha 141). Adicionar como "Divisão" (primeiro item) dentro de Classificação.

### 7. Criar submenu "Custos e Vendas" — `src/lib/modules.ts`
Remover Coeficientes e Tabela de Preços da raiz de Tabelas. Criar grupo:
```
Custos e Vendas
  ├── Coeficientes
  └── Tabela de Preços
```

### 8. Ajuste de largura dos submenus — `src/components/AppSidebar.tsx`
Nas classes do `PopoverContent` (linhas 94 e 146), trocar `w-52` por `w-auto min-w-[13rem]`. Adicionar `whitespace-nowrap` nos `<span>` dos botões de menu (leaf e branch).

### Arquivos Modificados

| Arquivo | Ação |
|---|---|
| `src/lib/modules.ts` | Remover Cadastros, Estrutura de Estoque, Permissões; mover Divisão; criar Custos e Vendas; alterar URLs de Pessoas |
| `src/App.tsx` | Remover rotas mortas; alterar rotas de Pessoas para `/admin/` |
| `src/components/AppSidebar.tsx` | Ajustar largura popups e whitespace |

