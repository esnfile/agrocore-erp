# Roadmap AgroERP

## Fase 1 — Autenticação, Permissões e Segurança Operacional

- [ ] T1 Autenticação real (Lovable Cloud), tela de login, rotas protegidas, logout
- [ ] T2 Usuário vinculado à tríade (grupo/empresa/filial) + seletor de contexto no header
- [ ] T3 usuarioAtualId() real; gravação sem sessão falha
- [ ] T4 Estorno seguro de romaneio finalizado (status ESTORNADO, justificativa >= 20 chars)
  - [ ] T4.1 cancelarRomaneio recusa FINALIZADO/CANCELADO na camada de serviço
  - [ ] T4.2 (ajuste) Estorno recusado se houver fixação de preço ou liquidação vinculada
- [ ] T5 Reautenticação de supervisor com senha real do usuário logado (5 ações do escopo)
  - [ ] T5.1 (ajuste) Sem fluxo de dois usuários — evolução futura
- [ ] T6 Log de autorizações + tela de consulta em Configurações (Administrador)
- [ ] T7 Perfis Administrador / Operador / Consulta validados no serviço
- [ ] T8 Validação de saldo/tolerância na finalização de romaneio
- [ ] T9 (ajuste) Verdade absoluta exclui romaneios ESTORNADOS; reconciliarSaldosContratos valida
- [ ] T10 Checklist: build limpo, sem console.logs novos, teste nas telas do fluxo completo

## Fase 2 (futuro, .NET)
- Estorno via documento compensatório espelhado (romaneio de estorno), não status in-place
- Fluxo de dois usuários na autorização de supervisor (operador pede, supervisor autoriza)
- contrato_itens (multi-produto)

## Pendências pós-Fase 1
- [x] P1 Cadastro público fechado; gestão de usuários só pelo Administrador
- [x] P2 Recusa por tolerância exercitada (teste automático no serviço; campo de tolerância adicionado ao contrato)
- [ ] P2b Repetir o teste de tolerância clicando na interface (aguarda validação do usuário)
- [x] P3 Regra de arredondamento: pesos de classificação gravados em kg inteiro (half-even)

## Fase 2 — Banco real (etapas com confirmação)
- [x] 2.1 Schema + RLS + funções transacionais + modelo de unidades (aguarda aprovação)
- [ ] 2.2 Cadastros base + seed  - [ ] 2.3 Contratos/Itens  - [ ] 2.4 Romaneios (serviço chama RPC, sem revalidar)
- [ ] 2.5 Estoque  - [ ] 2.6 Fixação  - [ ] 2.7 Liquidação (antes: cliente decide saca inteira x peso exato)
- [ ] 2.8 Financeiro/Caixa  - [ ] 2.9 Logs  - [ ] 2.10 Ponta a ponta nas telas
- [ ] Remover dados de teste "Grupo Teste 2.1 A/B" antes do seed da 2.2
- Futuro: permissões por Módulo → Submódulo → Programa → Permissão (tabelas gersys_* já criadas, vazias)
