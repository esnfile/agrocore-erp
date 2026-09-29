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
