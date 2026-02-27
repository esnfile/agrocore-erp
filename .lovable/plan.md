

## Fase 0.1 — Menus Recursivos com Popup + Paleta + grupo_id + CRUD via Modal

### 1. Reestruturar `modules.ts` — Tipo recursivo com children

Nova interface `MenuItem` recursiva (pode ter `url` OU `children`, nunca ambos). Os labels dos módulos (SidebarGroupLabel) permanecem inalterados: "Dashboard", "Administrativo", "Cadastros", "Armazém", "Financeiro".

```text
MenuItem {
  title: string
  icon: LucideIcon
  url?: string          // leaf node — navega
  children?: MenuItem[] // branch node — abre popup
}

Module {
  title: string         // label do grupo (não muda)
  icon: LucideIcon
  items: MenuItem[]
}
```

Estrutura do menu Administrativo conforme solicitado:

```text
Administrativo
├── Grupo Empresarial (popup)
│   ├── Grupos
│   ├── Empresas
│   └── Filiais
└── GerSys (popup)
    ├── Usuários (popup)
    │   ├── Usuários
    │   └── Permissões
    └── Módulos e Programas (popup)
        ├── Módulos
        ├── Sub-Módulos
        ├── Programas
        └── Permissões
```

Novas rotas: `/admin/gersys_modulos`, `/admin/gersys_submodulos`, `/admin/gersys_programas`, `/admin/gersys_permissoes`.

### 2. `AppSidebar.tsx` — Renderização recursiva com Popover

- Itens com `children` renderizam um `Popover` (trigger no item, content `side="right"`)
- Dentro do popover, cada child que também tenha `children` abre outro `Popover` aninhado
- Componente recursivo `SidebarMenuItemRecursive` que trata ambos os casos
- Funciona tanto expandido quanto colapsado (icon-only)

### 3. Paleta de cores (`index.css`)

Atualizar para os valores solicitados:

```text
Light:
  --background:    #F5F5F5  → 0 0% 96%
  --foreground:    #263238  → 200 18% 18%
  --primary:       #1B5E20  → 125 56% 24%
  --accent:        #2E7D32  → 125 46% 33%
  --sidebar-bg:    #263238  → 200 18% 18%

Dark:
  Ajustes proporcionais mantendo #1B5E20 como primário
```

### 4. Mock data — `grupoId` em todas as entidades

- `Filial` ganha `grupoId: string`
- `Usuario` ganha `grupoId: string`
- Dados mock atualizados com `grupoId: "g1"`

### 5. Services — CRUD completo para Grupo e Filial

- `grupoService`: `listar`, `obterPorId`, `salvar`, `excluir`
- `filialService`: `listar`, `listarPorEmpresa`, `obterPorId`, `salvar`, `excluir`

### 6. `OrganizationContext` — Adicionar `grupoAtual`

- Novo state `grupoAtual` + `setGrupoId`
- Troca de grupo reseta empresa e filial
- `AppHeader` ganha seletor de Grupo

### 7. `CrudModal.tsx` — Modal genérico para cadastros simples

- Dialog que recebe `title`, `open`, `onClose`, `children` (form), `onSave`
- Botões Salvar/Cancelar no footer

### 8. `EmpresasPage.tsx` — Refatorar para usar modal

- Remover navegação para página de form
- Abrir `CrudModal` com formulário inline
- Estado `modalAberto` + `empresaEditando`

### 9. Remover `EmpresaFormPage.tsx`

Arquivo removido. Rota `/admin/empresas/:id` removida de `App.tsx`.

### 10. `App.tsx` — Atualizar rotas

- Remover `/admin/empresas/:id`
- Adicionar novas rotas GerSys: `/admin/gersys_modulos`, `/admin/gersys_submodulos`, `/admin/gersys_programas`, `/admin/gersys_permissoes`

### Arquivos afetados

| Arquivo | Ação |
|---|---|
| `src/lib/modules.ts` | Reescrever — tipo recursivo + nova hierarquia |
| `src/components/AppSidebar.tsx` | Reescrever — renderização recursiva com Popover |
| `src/index.css` | Atualizar paleta |
| `src/lib/mock-data.ts` | Adicionar grupoId a Filial e Usuario |
| `src/lib/services.ts` | CRUD completo Grupo + Filial |
| `src/contexts/OrganizationContext.tsx` | Adicionar grupoAtual |
| `src/components/AppHeader.tsx` | Seletor de Grupo |
| `src/components/CrudModal.tsx` | Novo — modal genérico |
| `src/pages/admin/EmpresasPage.tsx` | Refatorar para modal |
| `src/pages/admin/EmpresaFormPage.tsx` | Remover |
| `src/App.tsx` | Atualizar rotas |

