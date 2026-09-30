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
  
Vamos la lovable, aprovado seu plano, mas com ressalvas abaixo:  
  
  
Plano da 2.2c + 2.3 aprovado. Execute com 5 ajustes obrigatórios:
  1. CONTRATO COM 2 ITENS: o teste com 2 itens vale apenas NO SERVIÇO/BANCO
     (provar cálculo por item). NUNCA pela tela — a UI cria exatamente 1 item
     por contrato nesta fase. Não libere multi-item na interface.
  2. COMPLETE OS TESTES QUE FALTARAM DA 2.2:
     a) Estado AUTORIZADO no log de autorizações, NA TELA, como Administrador,
        confirmando o log completo (usuário, data/hora, ação, registro alvo,
        justificativa, empresa/filial).
     b) Criação de Pessoa com perfil Consulta pela tela (deve ser recusada).
  3. COTAÇÃO NA LIQUIDAÇÃO (provisório): cada FIXAÇÃO grava a cotação do dia da
     fixação; a liquidação usa as cotações JÁ GRAVADAS nas fixações. Marque como
     PROVISÓRIO — regra definitiva depende de decisão do cliente antes da 2.7.
     Nunca consultar cotação ao vivo em cálculo; toda conversão grava qual
     cotação usou (valor + data + tipo).
  4. NO RELATÓRIO FINAL: contagem de registros por tabela do seed + confirmação
     de reconciliação zero divergência em contratos E estoque.
  5. MODELO DE UNIDADES — DEFINIÇÃO FINAL DO CLIENTE (evitar dupla fonte):
     A) Cadastro de UNIDADE DE MEDIDA: apenas DESCRIÇÃO + TIPO (Peso, Volume,
        Unidade). NÃO tem fator de conversão — e o fator NÃO deve voltar para
        esse cadastro de nenhuma forma. O papel do tipo é validar que conversões
        só ocorrem entre unidades do MESMO tipo (peso↔peso, volume↔volume).
     B) A CONVERSÃO VIVE EXCLUSIVAMENTE NO CADASTRO DO PRODUTO, na tabela
        produto_unidades: 1 linha por produto + unidade, com o fator definido
        SEMPRE contra a unidade base do tipo (kg para Peso, LT para Volume).
        Cada produto é único e tem sua própria conversão de entrada e saída.
     C) Tela de produto (JÁ EXISTE — mapear, não recriar):
        - Tipo de Unidade (dropdown Peso|Volume|Unidade) → filtra os dropdowns
          de Unidade de Entrada e Saída para unidades do mesmo tipo.
        - Unidade de Entrada / Unidade de Saída → DEFAULTS de preenchimento de
          romaneio (entrada) e contrato/venda (saída). Nunca fonte de conversão.
        - Qtd. Emb. Entrada / Qtd. Emb. Saída → EDITORES das linhas
          produto_unidades correspondentes. É o único lugar da interface onde
          o fator se edita. PROIBIDA qualquer coluna de conversão paralela no
          produto ou armazenamento paralelo no mock — se o mock guarda conversão
          em outro lugar, TRANSFERIR para produto_unidades e eliminar o paralelo.
     D) REGRA DE CONVERSÃO: todo fator é definido contra a unidade base. TODA
        conversão passa pela base: unidade → base → unidade. PROIBIDO fator
        direto unidade-a-unidade (ex: 1 TON = 16,67 SC) — editar um fator nunca
        pode contaminar os demais.
     E) TESTES OBRIGATÓRIOS (na tela):
        - Editar o fator da SC na tela de produtos e confirmar que contrato e
          romaneio usam o valor atualizado da produto_unidades (fonte única).
        - Produto defensivo: entrada Tambor (fator 200 LT), saída Litro —
          conversão via base funcionando entre unidades do tipo Volume.
        - Tentar usar unidade de outro tipo (ex: litro em produto de Peso) →
          recusado pelo banco E pelo serviço.  
    
  ✅ Modelo correto definido
  1. Unidade de medida = descrição + tipo. Ponto. O fator que existia lá no início do projeto (SC = 60 kg no cadastro da unidade) foi corretamente removido — foi justamente isso que causava o erro que você descreveu: saca de milho ≠ saca de cimento. Essa lição já está embutida no modelo atual, e o plano do Lovable precisa respeitá-la: o fator não pode voltar ao cadastro de unidade nem em forma de campo residual.
  2. A conversão vive exclusivamente no produto. O `produto_unidades` (1 linha por produto + unidade com fator) é essa materialização. Seu exemplo do defensivo — compro em tambor, sai em litro — funciona perfeitamente: Tambor = 200 LT, ambas tipo Volume. Compro em quilo e vendo em saca também: entrada KG (fator 1), saída SC (fator 60), ambas tipo Peso.
  3. A tela já existe e está certa. O dropdown "Tipo de Unidade" filtrando as unidades de entrada/saída é a validação de "mesmo tipo" funcionando na UI — o que falta é garantir que o banco e o serviço tenham a MESMA regra (trigger + serviço), e que os campos "Qtd. Emb." gravem na `produto_unidades` em vez de virar colunas paralelas.
  ## ⚠️ O Único Cuidado Técnico que Precisa Ser Escrito
  Seu modelo tem um ponto onde um erro silencioso pode nascer, e ele é sutil: os fatores precisam ser sempre definidos contra a unidade base do tipo, e toda conversão passa pela base. Exemplo do que NÃO pode acontecer:  
    
  ERRADO (encadeamento de fatores):  1 TON = 16,67 SC (fator direto)
     → se amanhã alguém editar o fator da SC de 60 para 61,
       a TON muda junto sem ninguém perceber
  CERTO (via base):                  1 SC = 60 kg | 1 TON = 1.000 kg
     → converter saca em tonelada: saca → kg (÷60) → tonelada (÷1.000)
     → editar um fator não contamina os outros  
    
  A regra do kg da balança como verdade física (que erradicou a deriva dos 20 kg) e essa regra do fator-contra-base são a mesma filosofia em dois níveis. Ela não adiciona trabalho — só precisa estar explícita, senão o Lovable implementa conversão direta entre unidades por ser "mais simples".