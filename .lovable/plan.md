

## Plano: 3 Correções na Modal de Pessoas

### Correção 1 — Scroll vertical (`src/components/CrudModal.tsx`)

O `ScrollArea` do Radix não está propagando a altura corretamente. Substituir por um `div` nativo com `overflow-y-auto flex-1 min-h-0` que funciona de forma confiável com flexbox.

**Linha 29-31**: Trocar `<ScrollArea className="flex-1 min-h-0">` por `<div className="flex-1 min-h-0 overflow-y-auto">` e remover import do ScrollArea.

---

### Correção 2 — Header endereço em 1 linha (`src/pages/cadastros/PessoasPage.tsx`)

**Linhas 690-692**: Adicionar watches para `endereco` e `numero`:
```
const enderecoRua = watch(`enderecos.${index}.endereco`);
const numeroEnd = watch(`enderecos.${index}.numero`);
```

**Linhas 709-719**: Reorganizar conteúdo do header para formato:
`[Badge tipo] Endereco, numero / Cidade / UF [Badge Padrão]`

- Manter Badge `variant="outline"` para tipo
- Texto corrido com truncate: `enderecoRua, numeroEnd / cidadeEnd / estadoEnd`
- Badge `variant="default"` para Padrão
- Remover `flex-wrap`, usar `truncate` no texto
- Tudo em uma linha com `items-center gap-2 flex-nowrap`

---

### Correção 3 — Labels nos contatos (`src/pages/cadastros/PessoasPage.tsx`)

**Linhas 856-863**: Remover o header grid fixo (bloco `hidden sm:grid`).

**Linhas 874, 883, 905**: Remover `sm:hidden` de todos os Labels dentro de cada contato para que fiquem sempre visíveis acima dos campos.

| Arquivo | Ação |
|---|---|
| `src/components/CrudModal.tsx` | Substituir ScrollArea por div com overflow-y-auto |
| `src/pages/cadastros/PessoasPage.tsx` | Header endereço 1 linha + labels contatos sempre visíveis |

