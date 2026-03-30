

# Plan: 3 Correcoes UI — Moedas/Cotacoes e Condicoes/Descontos

## Correcao 1 — Moedas e Cotacoes: filtro e alinhamento

**Problema**: O botao "Limpar filtro de moeda" na aba Cotacoes ocupa espaco e desalinha as abas quando oculto.

**Solucao**:
- Remover o botao "Limpar filtro de moeda" da area de conteudo da aba Cotacoes
- Quando houver filtro ativo, adicionar um icone X clicavel ao lado do Badge na aba Cotacoes (dentro do TabsTrigger)
- Mover o botao "Atualizar Cotacoes" para dentro do DataTable header area, alinhado com o campo buscar (usar o mesmo pattern da aba Moedas com `flex justify-end`)

**Arquivo**: `src/pages/comercial/MoedasCotacoesPage.tsx`

## Correcao 2 — Descricao truncada na listagem de Descontos

**Problema**: Coluna descricao quebra muitas linhas em telas menores.

**Solucao**:
- Na coluna `descricao` do DataTable, aplicar `render` com classes CSS: `line-clamp-2 min-w-[200px]` para limitar a 2 linhas com reticencias e largura minima

**Arquivo**: `src/pages/comercial/CondicoesDescontosPage.tsx`

## Correcao 3 — Edicao inline expande abaixo da linha correta

**Problema**: Ao clicar editar em uma config de empresa, o formulario de edicao aparece sempre apos a ultima linha da tabela, independente de qual linha foi clicada.

**Solucao**:
- Remover o bloco de edicao fixo abaixo da tabela (linhas 479-518)
- Integrar o formulario de edicao inline diretamente na tabela: apos cada `TableRow` do config, renderizar condicionalmente uma `TableRow` com `colSpan={7}` contendo o formulario de edicao quando `editingConfig?.id === cfg.id`
- Manter o formulario de "Vincular Empresa" (novo) no topo, como ja esta
- Botao Salvar: classe `bg-green-600 hover:bg-green-700 text-white`
- Botao Cancelar: classe `variant="outline"` com `hover:bg-destructive/10 hover:text-destructive hover:border-destructive`

**Arquivo**: `src/pages/comercial/CondicoesDescontosPage.tsx`

## Arquivos modificados
1. `src/pages/comercial/MoedasCotacoesPage.tsx`
2. `src/pages/comercial/CondicoesDescontosPage.tsx`

