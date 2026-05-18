## Objetivo

Refatorar a tela de Caixa e Bancos para um modelo de **lançamento por tipo** com layout em accordions, começando pelo tipo **PROLABORE** (mais simples). Também estender a entidade `FinanceiroTipoLancamento` com os novos atributos de comportamento e ajustar a tela de Tipos de Lançamento.

A estrutura ficará pronta para receber os próximos tipos (Recebimento de Duplicatas, Pagamento de Duplicatas, Adiantamentos, Funcionários, Depósitos, Transferências, Geral) em iterações seguintes, sem retrabalho.

---

## 1. Extensão dos Tipos de Lançamento

### 1.1 Modelo (`mock-data.ts` → `FinanceiroTipoLancamento`)

Adicionar campos:

- `categoria: 'PROLABORE' | 'REC_DUPLICATA' | 'PAG_DUPLICATA' | 'ADIANT_FORNECEDOR' | 'ADIANT_CLIENTE' | 'FUNCIONARIO' | 'DEPOSITO_DINHEIRO' | 'DEPOSITO_CHEQUE' | 'TRANSFERENCIA' | 'GERAL' | 'AUTOMATICO'` — chave que liga o tipo ao bloco de "Detalhes" correto.
- `exigePlanoContas: boolean`
- `apareceNaPesquisa: boolean` — tipos automáticos (ex: "Entrada por Depósito") ficam ocultos no select da tela de lançamento.

Seeds atuais (BAIXA CONTA RECEBER, BAIXA CONTA PAGAR, TRANSFERENCIA, etc.) recebem `categoria` correspondente (`AUTOMATICO` para os que já são gerados pelo sistema), `apareceNaPesquisa=false` quando aplicável.

Novo seed obrigatório: **PROLABORE** (`tipoMovimento: SAIDA`, `tipoConta: ['CAIXA','BANCO']`, `exigeCentroCusto: false`, `exigePlanoContas: false`, `apareceNaPesquisa: true`).

### 1.2 Tela `TiposLancamentoPage`

Adicionar no grid e no modal:

- Coluna/campo **Categoria** (Select com as opções acima).
- Switch **Exige Plano de Contas**.
- Switch **Aparece na Pesquisa** (default `true`).
- Coluna **ID** visível na listagem (curta, primeiros 8 chars).
- Coluna **Espécie** já existe (Movimento) — manter.

---

## 2. Pessoa marcada como Sócio

Hoje `Pessoa.relacaoComercial: string[]` aceita rótulos livres. Padronizar a string **"Sócio"** como valor canônico. O dropdown de Sócio na tela de Prolabore filtra `pessoas.filter(p => p.relacaoComercial.includes("Sócio"))`. Adicionar ao menos 1 pessoa seed com "Sócio" para testes.

Nenhuma mudança estrutural no schema de Pessoa.

---

## 3. Refatoração da Tela de Movimentações (Caixa e Bancos)

Substituir o modal único atual por um layout em **accordions** dentro do mesmo `CrudModal` (mantendo a listagem da página principal como está).

### 3.1 Estrutura visual (Accordion shadcn)

```
[ DADOS BASE ]              (default open, sempre visível)
  - Empresa  (Dropdown, do contexto - podendo ser alterada, no futuro vamos atrelar a permissão do usuario, mas por enquanto vamos permitir apenas para prototipo)
  - Filial   (Dropdown, do contexto - podendo ser alterada, no futuro vamos atrelar a permissão do usuario, mas por enquanto vamos permitir apenas para prototipo)
  - Conta Financeira (Select)
  - Data do Lançamento (DatePicker — não permite futura)
  - Tipo de Lançamento (Select com busca; só lista tipos com apareceNaPesquisa=true)

[ DETALHES ]                (dinâmico — aparece ao escolher Tipo, conteúdo varia por categoria)
  PROLABORE:
    - Sócio (Select, obrigatório)
    - Valor (numérico > 0)
    - Centro de Custo (Select; obrigatório apenas se tipo.exigeCentroCusto)

[ FORMAS DE PAGAMENTO ]     (sempre visível para tipos não-automáticos)
  - Dinheiro / Cheque / Cartão / Adiantamento (numéricos)
  - TOTAL (read-only, soma em tempo real)
  - Alerta inline quando TOTAL ≠ Valor dos Detalhes

[ HISTÓRICO ]               (sempre visível)
  - Textarea (máx 500)
```

Auto-comportamento:

- Ao selecionar Tipo, abrir automaticamente o accordion DETALHES.
- DETALHES renderiza um componente filho por categoria (`<DetalhesProlabore />`); demais categorias ficarão como placeholder "Em breve" para iterações futuras.

### 3.2 Validações (Prolabore)

- Sócio obrigatório.
- Valor > 0, 2 casas decimais.
- TOTAL das formas de pagamento = Valor do Prolabore (bloqueia Salvar; mostra alerta destacando diferença).
- Data ≤ hoje.

### 3.3 Persistência

Reaproveita `financeiroMovimentacaoService.registrar` já existente, com:

- `tipoLancamentoId` = id do Prolabore selecionado
- `pessoaId` = sócio
- `valor` = soma das formas
- `historico`, `centroCustoId` conforme preenchido

Como as 4 formas de pagamento podem coexistir, criar **uma movimentação por forma de pagamento com valor > 0**, todas amarradas por um mesmo `numeroDocumento` (timestamp/UUID curto) para agrupamento futuro. Alternativa simples para esta primeira fatia: 1 única movimentação com `formaPagamentoId` da forma de maior valor + campo `historico` detalhando o split. **Decisão recomendada:** múltiplas movimentações (uma por forma) para refletir o caixa real.

### 3.4 Organização de arquivos

```
src/pages/financeiro/
  MovimentacoesPage.tsx                 (lista + abre modal)
  lancamento/
    LancamentoCaixaModal.tsx            (orquestra accordions + estado comum)
    DadosBaseSection.tsx
    DetalhesProlabore.tsx
    FormasPagamentoSection.tsx
    HistoricoSection.tsx
    types.ts                            (FormState, helpers)
```

Estrutura modular já preparada para os próximos `DetalhesRecebimentoDup.tsx`, `DetalhesDeposito.tsx`, etc.

---

## 4. Memória do projeto

Atualizar `mem://features/` com novo arquivo `lancamento-caixa.md` documentando:

- Categorias de tipo de lançamento e o que cada uma exibe
- Regra `apareceNaPesquisa` (tipos AUTOMATICO ocultos)
- Regra TOTAL formas = Valor detalhes
- Convenção: sócios = `relacaoComercial` contém "Sócio"

Atualizar `mem://index.md` referenciando o novo arquivo.

---

## Detalhes técnicos

- **Componentes**: `Accordion` shadcn (já em `components/ui/accordion.tsx`), `Popover + Calendar` para DatePicker (com `pointer-events-auto`).
- **Estado**: um único objeto `FormState` no modal pai, passado por props para cada seção.
- **Soma reativa**: `useMemo` somando as 4 formas.
- **Tipos**: novos campos do `FinanceiroTipoLancamento` opcionais nos seeds antigos via migração simples no array (default `apareceNaPesquisa=true`, `categoria='GERAL'` para os não classificados).
- Mantida arquitetura: nenhuma regra de negócio nova fora do que já é mock; backend .NET 8 fará a real persistência futuramente.

---

## Entregáveis desta iteração

1. Modelo + seeds + tela de Tipos de Lançamento atualizados.
2. Tela de Caixa e Bancos refatorada com accordions.
3. Fluxo PROLABORE completo (criar, validar, salvar, refletir na listagem).
4. Placeholder "Em desenvolvimento" para as demais categorias (mantendo a estrutura).
5. Memória de projeto atualizada.

Próximas iterações (fora do escopo agora): Recebimento de Duplicatas → Saída para Depósito → Pagamento de Funcionários → demais.