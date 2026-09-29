# Fase 2 — Etapa 2.1: Schema + Modelo de Unidades (sem migrar telas ainda)

A Fase 2 será entregue em etapas. Cada etapa termina com um relatório e aguarda sua confirmação antes da próxima. Esta primeira etapa cobre a Tarefa 1 (schema) e o Adendo de Unidades, que é bloqueador.

## Etapas da Fase 2

```text
2.1  Schema completo + RLS + funções transacionais + correção de unidades   <- ESTA ETAPA
2.2  Cadastros base (serviços -> banco) + seed + teste nas telas
2.3  Contratos/Itens + seed
2.4  Romaneios (pesagem, classificação, finalizar/estornar via RPC) + seed
2.5  Estoque (cache + verdade + reconciliação)
2.6  Fixação   2.7 Liquidação   2.8 Financeiro/Caixa   2.9 Logs
2.10 Teste ponta a ponta nas telas + relatório final
```

## O que será entregue na 2.1

### 1. Modelo de unidades (corrige TON e a deriva de 20 kg)

- Uma única função de conversão no serviço: `converterKg(kg, unidade, produto)` e `paraKg(qtd, unidade, produto)`, sempre partindo do kg da balança.
- Fatores: SC = fator do produto (60 kg para soja/milho), TON = 1.000, KG = 1.
- `calcularSaldoContrato` e `avaliarToleranciaContrato` passam a comparar tudo em kg exato; conversão para SC/TON só na saída, sem arredondar.
- Nenhum arredondamento em quantidade de contrato, entregue ou saldo (4 casas). PLSL segue inteiro ToEven.
- Exibição: SC com 2 casas, kg inteiro, TON com 3 casas. Mensagens de tolerância nas duas unidades com valores coerentes.
- Testes automáticos dos cenários a), b), c) do adendo. O teste clicando nas telas acontece na 2.4, quando os romaneios estiverem no banco, e também na tela atual (mock) ao final desta etapa.

### 2. Schema no banco (PostgreSQL padrão)

Todas as tabelas com `id uuid`, `grupo_id`, `empresa_id`, `filial_id` (cadastros globais ao grupo levam apenas `grupo_id`), `criado_em`, `atualizado_em`, `criado_por`, `atualizado_por`, `deletado_em`.

- Cadastros: grupos, empresas, filiais, usuarios (ligado ao login existente), pessoas, produtos, produto_unidades (fatores), plano_contas, centros_custo, tipos_lancamento, moedas, cotacoes, condicoes_descontos.
- Operacional: contratos, contrato_itens, romaneios, romaneio_pesagens, romaneio_classificacao, fixacoes (por item), liquidacoes (por item), saldos_estoque (cache), contas_pagar, contas_receber, caixa_lancamentos, safras, cultivos, log_autorizacoes (substitui a tabela de log atual, mantendo os dados).
- Quantidades em `numeric(18,4)`, valores em `numeric(18,6)`.

### 3. Segurança por linha (RLS)

- Leitura: usuário vê apenas empresas/filiais permitidas dentro do seu grupo.
- Gravação: Administrador e Operador; Consulta não grava nada.
- Exclusão de cadastros estruturais: somente Administrador.

### 4. Funções transacionais (esqueleto testado, ainda não chamado pelas telas)

- `finalizar_romaneio`: grava romaneio + movimento de estoque + cache do contrato em uma transação; valida tolerância; rollback total em erro.
- `estornar_romaneio`: exige justificativa (20+), recusa se houver fixação/liquidação, reverte estoque e cache, status ESTORNADO, grava log.
- `reconciliar_saldos` (contratos e estoque): compara cache vs verdade (excluindo ESTORNADO) e só alerta.
- Mensagens de erro em português explicável.

### 5. Dados antigos

Nada do protótipo em memória entra no banco. As telas continuam no mock durante a 2.1; o seed realista entra módulo a módulo a partir da 2.2.

## Relatório da 2.1

- Lista de tabelas criadas e das políticas de segurança.
- Resultado dos testes de unidade (a, b, c) e dos testes das funções transacionais no banco.
- Build limpo.

## Detalhes técnicos

- Regras de negócio em funções PL/pgSQL padrão (sem recursos exclusivos do Cloud), portáveis para .NET/EF Core.
- Papéis continuam na tabela de papéis existente; checagem via função `has_role` + nova `pode_acessar_filial(filial_id)`.
- `services.ts` mantém a mesma interface; troca de mock por consulta real começa na 2.2.
- Decisão pendente registrada: liquidação em saca inteira (resíduo) — implementado peso exato (opção A) até sua confirmação.  
  
##ATENÇÃO LOVABLE PARA OS DETALHES ABAIXO:  
Plano sólido — a divisão em etapas com confirmação entre elas é exatamente o que eu ia pedir, e o Adendo de Unidades entrou completo. Aprove e deixe executar, mas com 4 ajustes que precisam entrar antes, porque mexem no resultado da 2.1:
  ---
  ## ✅ O Que Está Correto (sem ressalvas)
  - Etapas com portões de confirmação — 2.1 não toca nas telas, schema + unidades isolados. Correto.
  - Conversão única partindo do kg da balança e proibição de derivar kg de unidade arredondada — fecha a deriva de 20 kg na raiz.
  - `produto_unidades` como tabela — o fator de conversão vira dado, não constante espalhada. Isso também prepara produtos futuros (TRR: litros; pecuária: arroba) sem refazer código.
  - Funções transacionais como esqueleto testado, sem plugar nas telas — desacopla o risco do schema do risco da troca de services. Bom julgamento.
  - Nada do protótipo entra no banco e PLSL mantém ToEven. Fiel ao que decidimos.
  ---
  ## ⚠️ 4 Ajustes Antes de Executar
  ### 1. Risco de divergência dupla na regra de tolerância (o mais importante)
  Entre 2.1 e 2.4, a regra de saldo+tolerância vai existir em duas implementações: a do serviço em JS (corrigida agora no mock) e a da função PL/pgSQL (`finalizar_romaneio`). Quando a 2.4 trocar o mock pela RPC, qualquer diferença sutil entre as duas recria o bug da tela-vs-serviço que já vivemos — agora entre serviço-vs-banco.
  Exigência: os testes a), b) e c) do adendo devem rodar contra as duas implementações (JS e PL/pgSQL) e produzir resultados idênticos valor a valor. E na 2.4, o serviço passa a chamar a RPC — não revalida por conta própria. Uma fonte, três camadas (UI cosmética → serviço → banco), nunca três regras.
  ### 2. RLS precisa de teste real, não só "políticas criadas"
  O relatório da 2.1 lista políticas, mas política criada ≠ política funcionando. Como as telas ainda estarão no mock, a RLS ficaria sem verificação até a 2.2 — tarde demais se houver buraco. Peça um teste direto no banco nesta etapa: com conexão autenticada de um usuário Consulta, tentar INSERT/UPDATE/DELETE e confirmar a recusa; e confirmar que usuário do grupo A não lê linhas do grupo B. Cinco minutos no banco, evita descobrir furão com dado real.
  ### 3. Recalcular os saldos do mock após a correção de unidades
  O plano corrige o cálculo, mas não diz o que acontece com os contratos de teste existentes no mock que já carregam a deriva (o CTR com -17 SC / -1.020 kg). Como a verdade é derivada dos romaneios, basta forçar o recálculo — mas precisa ser feito e confirmado, senão você testa a tela e vê o número fantasma ainda lá, achando que a correção falhou. Inclua: "após a correção, rodar reconciliação nos contratos de teste existentes e zerar divergências".
  ### 4. Constraints de unicidade no schema (barato agora, caro depois)
  O plano lista tabelas mas não constraints. Duas que evitam dor na 2.4+: número de romaneio único por filial (a balança não pode gerar dois romaneios com a mesma numeração) e CNPJ único de pessoa por grupo. Uma linha de DDL cada, impossível de adicionar com dados já migrados sem dor de cabeça.  
    
  ##PONTO PRINCIPAL NAS PERMISSÕES DO USUARIOS:  
  Lembre-se que vamos tratar as permissões do usuario através de Módulos -> SubMudlos -> Programas e Permissões...  
  Mesmo que nõ for implementar agora, vamos pensar nisso no futuro...  
    
  Plano da 2.1 aprovado. Execute com 4 acréscimos:
  1. TESTE CRUZADO DE UNIDADES: os cenários a), b) e c) do adendo devem rodar
     contra AS DUAS implementações da regra de saldo+tolerância — o serviço em
     JavaScript (mock atual) e as funções PL/pgSQL do banco — e produzir
     resultados idênticos valor a valor. Na 2.4, o serviço passa a CHAMAR a RPC
     (finalizar_romaneio/estornar_romaneio) em vez de revalidar por conta própria.
  2. TESTE REAL DA RLS: além de listar as políticas, teste no banco nesta etapa:
     usuário Consulta tentando INSERT/UPDATE/DELETE deve ser recusado; usuário
     do grupo A não deve ler linhas do grupo B. Reporte o resultado dos testes.
  3. RECÁLCULO DOS SALDOS DO MOCK: após a correção do modelo de unidades, rode
     a reconciliação sobre os contratos de teste existentes no mock (incluindo o
     que exibiu -17 SC / -1.020 kg) e confirme que os saldos derivados dos
     romaneios não carregam mais a deriva de arredondamento.
  4. CONSTRAINTS DE UNICIDADE: número de romaneio único por filial; CNPJ único
     de pessoa por grupo. Incluir no schema da 2.1.
  Ao final: relatório da 2.1 conforme planejado + resultados dos 4 acréscimos.
  Aguardarei o relatório antes de liberar a 2.2.  
    
  Nota Final — A Decisão do Cliente Que Segue Pendente
  O plano registrou corretamente "peso exato até sua confirmação" para a questão saca inteira vs. peso exato. Não deixe essa pergunta morrer: ela define liquidação, e o cliente responde isso em 30 segundos ("eu vendo saca fechada ou pelo peso exato da balança?"). Leve na próxima conversa — antes da 2.7 (Liquidação), idealmente, porque depois do banco populado muda o custo.  
    
