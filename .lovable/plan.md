
## Correção: Cálculo do Valor Bruto da Liquidação com Conversão de Unidade

### Problema
Em `services.ts → _calcularLiquidacao` (linhas 3505-3585):
- `pesoLiquido` dos romaneios está em **unidade base** (KG)
- `precoUnitario` é por **unidade de negociação** (ex: SC = 60kg)
- Multiplicação direta gera valor 60× maior (60.000 KG × R$120,70 = R$ 7.242.000 em vez de 1.000 SC × R$120,70 = R$ 120.700)

### Correção

**Arquivo:** `src/lib/services.ts` — função `_calcularLiquidacao`

1. **Converter `quantidadeEntregue` de KG → unidade de negociação** antes de calcular valor:
   ```ts
   const produto = mockProdutos.find(p => p.id === contrato.produtoId);
   const unidadeBaseId = getUnidadeBaseParaTipo(produto.tipoUnidade);
   const quantidadeEntregueNeg = unidadeMedidaService.converterQuantidade(
     quantidadeEntregue, unidadeBaseId, contrato.unidadeNegociacaoId, produto.id
   );
   ```

2. **Usar a quantidade convertida** em:
   - `quantidadeLiquidada` (comparação com `contrato.quantidadeTotal`, que já está em unidade de negociação)
   - Cálculo de `valorBruto = quantidadeLiquidada × precoUnitario`

3. **Corrigir desconto de qualidade** (linha 3566): converter `rom.pesoLiquido` (KG) também antes de multiplicar pelo `precoUnitario`.

4. **Exibição**: `liquidacao.quantidadeEntregue` e `quantidadeLiquidada` passam a ser armazenadas na unidade de negociação (consistente com a UI que mostra "60.000 SC" — que na verdade deveria ser "1.000 SC").

### Resultado Esperado (exemplo do print)
- Qtd Contratada: 1.000 SC
- Qtd Entregue: 1.000 SC (era 60.000)
- Qtd Liquidada: 1.000 SC
- Valor Bruto: R$ 120.700,00 ✅
- Descontos e Valor Líquido recalculados sobre a base correta

### Arquivos Afetados
| Arquivo | Mudança |
|---|---|
| `src/lib/services.ts` | Conversão KG→unidade negociação em `_calcularLiquidacao` (qty entregue + desconto qualidade) |

### O que NÃO muda
- Estoque continua em KG (correto)
- Romaneios continuam armazenando `pesoLiquido` em KG
- UI da liquidação (já lê os campos calculados)
