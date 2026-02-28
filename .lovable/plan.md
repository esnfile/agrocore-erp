

## Correções: Modal Empresa + Confirmação de Exclusão + Botão Cancelar

### 1. `CrudModal.tsx` — Layout mais espaçoso + botão Cancelar com hover vermelho

- Aumentar `sm:max-w-lg` para `sm:max-w-2xl` (max-width ~672px)
- Aumentar padding interno: `py-2` para `py-6 px-2`
- Botão Cancelar: adicionar classe `hover:bg-destructive/10 hover:text-destructive hover:border-destructive` para feedback visual vermelho no hover

### 2. `EmpresasPage.tsx` — Confirmação de exclusão com integridade

- Adicionar state `deleteTarget` (como em GruposPage)
- Adicionar `AlertDialog` de confirmação com texto: "Deseja realmente excluir esta empresa? Esta ação não poderá ser desfeita."
- Botão "Confirmar Exclusão" em vermelho (`bg-destructive`)
- Antes de excluir: verificar filiais vinculadas via `empresaService.possuiFiliais(id)` — se existir, bloquear com toast "Não é possível excluir uma empresa que possui filiais vinculadas."
- Soft delete: atualizar `deletadoEm`, `atualizadoEm`, `atualizadoPor`
- Ajustar grid do form: `gap-4` para `gap-5`, adicionar `py-2` nos separadores visuais

### 3. `services.ts` — Adicionar método `possuiFiliais` + soft delete na empresa

- `empresaService.possuiFiliais(id)`: verifica se existem filiais ativas com `empresa_id = id`
- `empresaService.excluir(id)`: mudar de `emp.ativo = false` para preencher `deletadoEm` com UTC now
- `empresaService.listar()`: filtrar por `deletadoEm === null` em vez de `ativo`

### 4. `mock-data.ts` — Adicionar `deletadoEm` à interface Empresa

- Adicionar `deletadoEm: string | null` à interface `Empresa`
- Adicionar `criadoPor`, `atualizadoPor` (auditoria completa, consistente com Grupo)
- Atualizar dados mock com `deletadoEm: null`, `criadoPor: "u1"`, `atualizadoPor: "u1"`

### Arquivos afetados

| Arquivo | Mudança |
|---|---|
| `src/components/CrudModal.tsx` | Max-width, padding, hover vermelho no Cancelar |
| `src/pages/admin/EmpresasPage.tsx` | AlertDialog confirmação, integridade filiais, soft delete |
| `src/lib/services.ts` | `possuiFiliais`, soft delete empresa, filtro deletadoEm |
| `src/lib/mock-data.ts` | `deletadoEm`, `criadoPor`, `atualizadoPor` na Empresa |

