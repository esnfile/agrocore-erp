# Etapa 2.2c (ajustes) + Etapa 2.3 (Contratos/Itens + Moedas/Cotações)

Tudo é executado em sequência. Ao final de cada bloco: teste clicando na tela (Administrador + Consulta), relatório tela por tela e conferência de reconciliação com divergência zero.

## Bloco A — Dados fiscais só na Filial
- Grupo e Empresa deixam de pedir e exibir CPF/CNPJ (as colunas antigas continuam no banco, marcadas como fora de uso).
- A tela de Filiais passa a exigir CNPJ ou CPF com validação de dígito verificador, e Inscrição Estadual com validação básica por UF (formato e tamanho). A matriz é cadastrada como uma filial do tipo "Matriz".
- CNPJ continua único dentro do grupo. Regra registrada: todo documento fiscal/contábil exige filial.

## Bloco B — Produtos (modelo final)
- Nova tela **Tipos de Produto** (Grãos, Insumos, Combustível, Almoxarifado, já cadastrados no seed). O produto recebe o vínculo com o tipo.
- Campos que dependem do tipo ficam fixos no código (por exemplo, Grãos mostra classificação e umidade). O motor de campos configuráveis fica para o roadmap do .NET.
- Nova tela **Marcas**. O produto recebe o campo marca.
- Grupo/Subgrupo/Seção/Divisão são substituídos por um único campo **Categoria**. As telas antigas saem do menu.
- **Unidades de Medida** ganham o campo Tipo (Peso, Volume, Unidade).
- O produto ganha "Unidade Padrão de Entrada" e "Unidade Padrão de Saída". Elas só aceitam unidades do mesmo tipo da unidade base e servem apenas para pré-preencher romaneios e contratos.
- A conversão continua exclusivamente nas unidades do produto, partindo do kg da balança. Converter entre tipos diferentes é recusado pelo banco e pelo serviço.
- Preço no produto é só referência para pré-preencher contrato.
- Seed: soja e milho (Grãos, base kg, SC 60 e TON 1000), mais 1 insumo e 1 combustível (base LT).

## Bloco C — Moedas e Cotações (modelo do banco)
- Cotações: data + tipo (DOLAR, SOJA_US_SC, MILHO_US_SC) + valor, com um único registro por dia por tipo, preenchido à mão. A tela é refeita nesse modelo.
- Seed com cotações diárias plausíveis para o período dos contratos.

## Bloco D — Etapa 2.3 Contratos/Itens
- Contratos e itens passam a ser lidos e gravados no banco (vários produtos por contrato), mantendo o layout atual.
- Novo campo **Moeda de precificação** (BRL/USD). Em USD, o preço do item é em dólar. Em BRL, o valor é fixo e a cotação é ignorada.
- Regra gravada para a 2.7: a liquidação converte pela cotação salva na data da operação. Se a cotação não existir, a operação é recusada com mensagem clara. Consulta de cotação ao vivo é proibida em cálculos.
- O saldo do contrato continua vindo só dos romaneios finalizados, excluindo estornados. O painel A Fixar e os dashboards de contratos passam a ler do banco.
- Regras mantidas: contrato com romaneio não pode ser excluído, contrato sem romaneio pede confirmação simples, tolerância é obrigatória (2–5%) e quantidade e preço devem ser maiores que zero.
- Seed: os 18 contratos atuais revisados (alguns em USD) e reconciliação sem nenhuma divergência.

## Testes nas telas (relatório)
- Filiais: CNPJ inválido recusado, válido aceito, e Empresa/Grupo sem campo de CNPJ.
- Tipos, Marcas, Unidades e Produtos: listar, criar e editar. Unidade de saída de outro tipo é recusada. Perfil Consulta tem gravação recusada.
- Cotações: duplicar o mesmo dia e tipo é recusado.
- Contratos: criar em BRL e em USD com 2 itens, editar, tentar excluir contrato com romaneio (bloqueado) e tentar gravar como Consulta (recusado). Saldo conferido contra os romaneios.

## Detalhes técnicos
- Migração aditiva: `tipos_produto`, `marcas`, `categorias_produto`; em `produtos`: `tipo_produto_id`, `marca_id`, `categoria_id`, `unidade_entrada_padrao`, `unidade_saida_padrao`, `preco_referencia`; em `unidades_medida.tipo`, CHECK de valores. Validação de mesmo tipo em trigger e dentro de `fator_base`.
- `cotacoes`: `tipo_cotacao` + índice único parcial (grupo, data, tipo) WHERE deletado_em IS NULL. `moeda_id` deixa de ser usado.
- `contratos.moeda_precificacao` com default 'BRL'. `empresas.cpf_cnpj` e `grupos` ficam com COMMENT DEPRECATED.
- Validação de dígito do CNPJ/CPF no serviço e em trigger no banco. Todas as novas tabelas recebem GRANT, RLS pela tríade e auditoria/soft delete.
- Telas via helpers `dbListar/dbInserir/dbAtualizar/dbExcluirLogico`. Atualização de AGENTS.md e roadmap.md.

## Pendente de decisão (não bloqueia)
- Liquidação em saca inteira ou peso exato (hoje fica peso exato, de forma provisória).
