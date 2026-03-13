

## Plano: Separar Modal do Romaneio em Duas Abas

### Alteração em `src/pages/comercial/ContratosPage.tsx`

**Modal do Romaneio (linhas ~1063-1210):** Reorganizar o conteúdo dentro de um componente `Tabs` com duas abas:

1. **Aba "Geral"** — Contém todos os campos atuais do romaneio (linhas 1072-1144):
   - Data da Entrega, Ponto de Estoque
   - Quantidade, Unidade
   - Peso Bruto, Peso Líquido
   - Placa, Motorista, Documento
   - Observações

2. **Aba "Classificação do Grão"** — Move o bloco atual (linhas 1146-1208):
   - Grid com Tipo, Valor Base, Valor Apurado, Excedente, % Desconto
   - Resumo: Peso Base, Desconto Total, Peso Comercial

### Detalhes técnicos

- Envolver o conteúdo do modal em `<Tabs defaultValue="geral">` com `<TabsList>` contendo "Geral" e "Classificação do Grão"
- A aba de classificação ficará sempre visível (sem o `if classEntregaItens.length > 0` como wrapper da aba, mas pode manter a mensagem "sem classificações" dentro)
- Manter `maxWidth="sm:max-w-2xl"` no modal

