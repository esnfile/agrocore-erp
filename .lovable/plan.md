

## Plano: Reorganizar layout da aba Dados Gerais do Produto

### Mudanças em `src/pages/produtos-estoque/ProdutosPage.tsx`

**1. Reordenar seções** (dentro da TabsContent "dados", linhas 656-1024):

Ordem atual: Código/Descrição → Aplicação → Tipo Baixa → **Unidades** → Divisão/Marca → Seção/Grupo/Subgrupo → Ativo

Nova ordem: Código/Descrição → Aplicação → Tipo Baixa → Divisão/Marca → Seção/Grupo/Subgrupo → **Unidades** → Ativo

**2. Unidades em 3 colunas (layout compacto)**

Substituir as 3 grids separadas (linhas 720-877) por um único grid de 3 colunas:

| Coluna 1 | Coluna 2 | Coluna 3 |
|---|---|---|
| Unidade Base | Unidade de Compra | Unidade de Venda |
| _(vazio)_ | Qtd. Emb. Compra | Qtd. Emb. Venda |

Cada coluna é um `div` com `space-y-4` contendo os campos empilhados.

**3. Toggle "Ativo" alinhado com as abas**

Mover o toggle `Ativo` para fora da `TabsContent`, posicionando-o na mesma linha do `TabsList` usando `flex justify-between items-center` no container do TabsList + toggle.

**4. Remover `max-w-[700px]`** (linha 656)

Trocar `max-w-[700px]` por largura total para aproveitar o espaço da modal `sm:max-w-5xl`, corrigindo o espaçamento excessivo à direita.

| Arquivo | Linhas | Ação |
|---|---|---|
| `src/pages/produtos-estoque/ProdutosPage.tsx` | 647-1024 | Reordenar seções, compactar unidades em 3 cols, mover Ativo para linha das abas, remover max-w |

