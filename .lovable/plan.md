# Adiantamentos — Fornecedor e Cliente

## Visão geral

Já existe no projeto a entidade `FinanceiroAdiantamento` (saldo liberado, com `valorAdiantamento`, `saldoUtilizado`, `saldoRestante`, status `ABERTO/PARCIAL/LIQUIDADO/CANCELADO`, `origemTipo`). Ela corresponde 1‑para‑1 às tabelas `pessoa_adiantamento_cliente` / `pessoa_adiantamento_fornecedor` do prompt — não precisamos duplicar. O que falta é:

1. Uma entidade nova **`AdiantamentoSolicitacao`** com fluxo de aprovação (somente Fornecedor).
2. Distinguir Cliente x Fornecedor no `FinanceiroAdiantamento` existente.
3. Duas novas seções de detalhe no Caixa (`DetalhesAdiantFornecedor`, `DetalhesAdiantCliente`) + dois novos tipos de lançamento.
4. Uma tela `AdiantamentosSolicitacoesPage` (somente Fornecedor) e reaproveitar a `AdiantamentosPage` atual como tela de saldos.
5. Modal de autorização por senha para Adiantamento de Cliente.

Vou dividir em **3 fases** entregáveis isoladamente para reduzir risco de regressão.

---

## Fase 1 — Modelo de dados e serviços (sem UI nova)

### `src/lib/mock-data.ts`
- Adicionar campo `tipoBeneficiario: "CLIENTE" | "FORNECEDOR"` em `FinanceiroAdiantamento` (default `"FORNECEDOR"` para os já gerados por liquidação de contrato — eles são crédito do cliente comprador, então na verdade são `"CLIENTE"`; revisar o ponto único em `services.ts` que gera adiantamento via liquidação e setar `"CLIENTE"`).
- Adicionar `OrigemAdiantamento`: `"SOLICITACAO_FORNECEDOR" | "CAIXA_CLIENTE"` (sem quebrar os existentes).
- Adicionar campo `solicitacaoId: string | null` em `FinanceiroAdiantamento`.
- Nova interface e array:
  ```ts
  type StatusSolicitacaoAdiantamento = "SOLICITADO" | "APROVADO" | "LIBERADO" | "REJEITADO" | "CANCELADO";
  interface AdiantamentoSolicitacao {
    id; grupoId; empresaId; filialId;
    pessoaId;                       // fornecedor
    valor; status;
    dataSolicitacao; dataAprovacao: string | null;
    observacoes: string;
    movimentacaoFinanceiraId: string | null;  // preenchido ao liberar no caixa
    adiantamentoId: string | null;            // FK para o saldo gerado
    // auditoria padrão
  }
  const adiantamentoSolicitacoes: AdiantamentoSolicitacao[] = [/* 2 seeds */];
  ```

### `src/lib/services.ts`
- Novo `adiantamentoSolicitacaoService` com:
  - `listar(empresaId, filialId, filtros?)`
  - `listarAprovadosPorPessoa(pessoaId)` — usado pelo dropdown no Caixa.
  - `criar({ pessoaId, valor, observacoes })` → status `SOLICITADO`.
  - `aprovar(id)` / `rejeitar(id)` / `cancelar(id)` — só transita se status permitir.
  - `marcarLiberada(id, movimentacaoId, adiantamentoId)` — usado pelo serviço de caixa.
- Extender `financeiroMovimentacaoService.registrar` para tratar duas novas categorias (ver Fase 2). A criação do `FinanceiroAdiantamento` (saldo) deve acontecer **dentro** desse serviço, em transação lógica única com o lançamento de caixa, para não deixar saldo órfão.

### Tipos de lançamento (seed)
- Adicionar em `mock-data.ts` (seed de `financeiroTiposLancamento`) dois registros novos:
  - `ADIANTAMENTO A FORNECEDOR` — categoria `ADIANT_FORNECEDOR`, `tipoMovimento: "SAIDA"`, `apareceNaPesquisa: true`.
  - `ADIANTAMENTO DE CLIENTE` — categoria `ADIANT_CLIENTE`, `tipoMovimento: "ENTRADA"`, `apareceNaPesquisa: true`.
- Ambas as categorias já existem no enum `CategoriaTipoLancamento`.

---

## Fase 2 — Integração no LancamentoCaixaModal

### Novos componentes
- `src/pages/financeiro/lancamento/DetalhesAdiantFornecedor.tsx`
  - Dropdown **Fornecedor** (filtra `pessoas` com `relacaoComercial` contendo `"Fornecedor"`).
  - Dropdown **Solicitação aprovada** (chama `adiantamentoSolicitacaoService.listarAprovadosPorPessoa(fornecedorId)`; formato `"R$ X — dd/mm/aaaa — obs"`).
  - **Valor** (numérico, pré‑preenchido pelo selecionado, editável; valida `0 < valor ≤ valorSolicitacao` — parcial permitida).
  - **Centro de custo** opcional.
- `src/pages/financeiro/lancamento/DetalhesAdiantCliente.tsx`
  - Dropdown **Cliente** (filtra `relacaoComercial` contendo `"Cliente"`).
  - **Valor** (numérico > 0).
  - **Centro de custo** opcional.
  - **Referência/Motivo** (Textarea obrigatória, máx 500 chars).

### `LancamentoCaixaModal.tsx`
- Acrescentar `solicitacaoAdiantamentoId` no `LancamentoFormState`/`types.ts`.
- No `renderDetalhes()`: switch por categoria (`PROLABORE` ✓, `ADIANT_FORNECEDOR`, `ADIANT_CLIENTE`).
- Em `handleSave()`:
  - **Fornecedor**: valida fornecedor + solicitação + valor ≤ valor solicitação; TOTAL formas = valor; `tipoMovimento` é `SAIDA`. Chama `financeiroMovimentacaoService.registrar(..., { tipoBeneficiario:"FORNECEDOR", solicitacaoId })`; o service cria a movimentação, cria `FinanceiroAdiantamento` saldo `ABERTO` linkando à solicitação, e marca solicitação `LIBERADO`.
  - **Cliente**: valida cliente + valor > 0 + referência preenchida; TOTAL formas = valor; `tipoMovimento` é `ENTRADA`. Antes de chamar o service, dispara fluxo de autorização (abaixo). Service cria movimentação + `FinanceiroAdiantamento` `tipoBeneficiario:"CLIENTE"`, sem solicitação.
- `valorEsperado` deve ser preenchido nas duas novas categorias.

### Modal de autorização (Cliente)
- `src/pages/financeiro/lancamento/AutorizacaoSupervisorModal.tsx`.
- Como ainda não há controle de permissão real, usaremos um flag estático: `const REQUER_AUTORIZACAO_ADIANT_CLIENTE = true;` em `constants.ts`. Senha mock: `"admin123"`.
- Fluxo: ao clicar Salvar em ADIANT_CLIENTE, se flag ligada → abre modal pedindo senha; só prossegue se senha correta. Erro vermelho inline para senha inválida.
- Quando houver módulo de permissões, substituir o flag pela checagem `usuario.nivel >= SUPERVISAO` (TODO documentado no código).

---

## Fase 3 — Telas

### `src/pages/financeiro/adiantamentos/SolicitacoesPage.tsx` (nova)
Rota: `/financeiro/adiantamentos/solicitacoes`, item de menu novo em "Financeiro".

- Tabela com colunas: Pessoa | Valor | Status | Data Solicitação | Data Aprovação | Observações | Ações.
- Filtros: Pessoa, Status, Período.
- Botão **[+ Nova Solicitação]** abre modal com: Pessoa (fornecedor), Valor, Observações. Tipo é fixo Fornecedor (Cliente não tem solicitação por design).
- Ações condicionais por status:
  - `SOLICITADO` → [Aprovar] [Rejeitar] [Cancelar]
  - `APROVADO` → [Cancelar] (e badge "Aguardando liberação no caixa")
  - `LIBERADO` → somente [Ver Detalhes] com link para a movimentação
  - `REJEITADO`/`CANCELADO` → somente leitura
- Cada ação chama o service e usa `StatusBadge` global (memória do projeto manda).

### `AdiantamentosPage.tsx` (existente — pequenos ajustes)
- Continua como **listagem de saldos** (`FinanceiroAdiantamento`).
- Adicionar coluna **Tipo** (CLIENTE/FORNECEDOR) e filtro por tipo.
- Mostrar `solicitacaoId` (link) e `origemTipo` para rastreabilidade.

### Menu (`src/lib/modules.ts` ou onde está o sidebar)
- Adicionar item "Solicitações de Adiantamento" abaixo de "Adiantamentos" no grupo Financeiro.

---

## Pontos de atenção / decisões tomadas

- **Reaproveitamento da entidade de saldo**: usamos `FinanceiroAdiantamento` já existente para os dois lados (Cliente/Fornecedor) via novo campo `tipoBeneficiario`. Evita duas tabelas quase idênticas e mantém compatibilidade com o fluxo de liquidação de contrato já implementado.
- **Atomicidade**: criação do saldo + lançamento + atualização da solicitação ficam dentro de `financeiroMovimentacaoService.registrar`, espelhando o padrão de "transação lógica" usado em liquidação de contrato (memória `contratos.md`).
- **Adiantamento de Cliente sem solicitação**: confirmado pelo prompt — a auditoria fica em `historico` + campo "Referência/Motivo" obrigatório.
- **Permissão de supervisor**: flag estático + senha mock `"admin123"`, com TODO claro para troca quando o módulo de permissões existir.
- **Forma de pagamento "Adiantamento"** dentro do Caixa: continua sendo o campo numérico já existente em `FormasPagamentoSection` (usado em outros tipos para *abater* de saldo). Não conflita: aqui ele é apenas mais uma forma compondo o TOTAL.
- **Validação TOTAL = Valor**: já existe para PROLABORE; replicar para as duas novas categorias.
- **Sem mexer em StatusBadge específico**, usar o global (regra do projeto).
- **Memória**: ao final, atualizar `mem://features/adiantamentos.md` e `mem://features/lancamento-caixa.md` com as novas categorias e o fluxo de solicitação.

## Ordem de implementação sugerida
1. Fase 1 inteira (tipos + service + seeds) — sem efeito visível, mas testável via console.
2. Fase 3 tela de Solicitações — permite criar/aprovar antes de integrar Caixa.
3. Fase 2 integração Caixa (Fornecedor primeiro, depois Cliente + modal de autorização).
4. Ajustes finais em `AdiantamentosPage` (coluna Tipo, filtros) e memória.

Posso começar pela Fase 1 assim que aprovar — ou se preferir entregar tudo de uma vez, sigo as 3 fases em sequência sem pausa.
