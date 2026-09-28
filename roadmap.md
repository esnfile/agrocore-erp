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
