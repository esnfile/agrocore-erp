# Caixa — Transferência Entre Contas (DetalhesTransferencia)

Escopo aprovado: PARTES 2, 3, 4, 5 e 7 do prompt.  
Descartado (já entregue): DetalhesGeral, filtro Tipo↔Conta (já existe), Conta Contábil pré-definida.

## Análise da estratégia do Caixa até aqui

A arquitetura do `LancamentoCaixaModal` está bem desenhada para escalar:

- **Dispatcher por categoria** em `handleSave` + `renderDetalhes` mantém cada categoria isolada.
- **`resetDetalhes`** já cobre limpeza ao trocar tipo/conta — fácil estender.
- **`tiposFiltrados`** (memo por `tipoContaConta`) + `validarDadosBase` (fallback) garantem compatibilidade Tipo↔Conta. Está implementado e funcionando.
- **Service `financeiroMovimentacaoService.registrar`** já trata `tipoMovimento === "TRANSFERENCIA"` (debita origem, credita destino, valida saldo). Não precisa mudar.
- **Tipo `ftl3` "TRANSFERENCIA ENTRE CONTAS"** já existe no mock (`apareceNaPesquisa: true`, `categoria: "TRANSFERENCIA"`, `tipoConta: [CAIXA, BANCO, CARTEIRA]`).

Único débito técnico relevante: o `LancamentoFormState` virou union ampla (PROLABORE/ADIANT/DUPLICATA/GERAL); adicionar `contaDestinoId` segue o padrão atual — migração para `detalhes` discriminado fica para quando passarmos de ~6 categorias.

## O que vai ser feito

### 1. `src/pages/financeiro/lancamento/types.ts`
- Adicionar `contaDestinoId: string` em `LancamentoFormState` e `initialFormState`.
- Adicionar `"TRANSFERENCIA"` em `categoriasImplementadas`.

### 2. `src/pages/financeiro/lancamento/DetalhesTransferencia.tsx` (novo)
Layout responsivo (grid md:12 cols, stack em mobile):

- **Conta Origem** (read-only): "{descrição} — {tipo} — Saldo: {formatMoeda(saldoAtual)}". Vem de `contaFinanceiraId` do header.
- **Conta Destino** (Select obrigatório): lista `contasFinanceiras.filter(c => c.ativo && c.id !== contaFinanceiraId)`. Mostra "{descrição} ({tipoConta})". Limpa ao trocar origem (já garantido por `resetDetalhes`).
- **Valor** (numérico, > 0).
- **Centro de Custo** (Select opcional — sem `*`).
- Aviso inline `text-destructive` quando `valor > origem.saldoAtual && !origem.permiteSaldoNegativo`: "Saldo insuficiente. Será solicitada confirmação ao salvar."

### 3. `src/pages/financeiro/lancamento/LancamentoCaixaModal.tsx`
- Importar `DetalhesTransferencia`.
- `resetDetalhes`: incluir `contaDestinoId: ""`.
- `renderDetalhes`: rota `TRANSFERENCIA` → `<DetalhesTransferencia state={state} update={update} contasFinanceiras={contasFinanceiras} centrosCusto={centrosCusto} />`.
- `valorEsperado`: incluir `TRANSFERENCIA` → `state.valorDetalhe`. **Mas** Transferência não usa Formas de Pagamento — esconder `<FormasPagamentoSection />` quando `tipoSel?.categoria === "TRANSFERENCIA"`.
- `handleSave` dispatcher: `if (tipoSel.categoria === "TRANSFERENCIA") return salvarTransferencia();`.
- Novo `salvarTransferencia()`:
  1. Origem (`contaFinanceiraId`) selecionada — já validado em `validarDadosBase`.
  2. `contaDestinoId` selecionado → senão toast "Selecione a conta destino".
  3. `contaDestinoId !== contaFinanceiraId` → senão toast "Conta origem e destino devem ser diferentes".
  4. Conta destino existe e está ativa.
  5. `valorDetalhe > 0`.
  6. Se `valor > saldoAtual && !permiteSaldoNegativo` → `window.confirm("Saldo insuficiente em {origem}. Deseja continuar mesmo assim?")`; se cancelar, aborta. (Política flexível conforme prompt; o service ainda bloqueia se a origem não permitir negativo — nesse caso o toast de erro do service será exibido, comportamento consistente com regra atual de contas).
  7. Chamar `financeiroMovimentacaoService.registrar` com `contaOrigemId: contaFinanceiraId`, `contaDestinoId: state.contaDestinoId`, `pessoaId: null`, `planoContaId: null`, `formaPagamentoId: forma "Transferência"` (resolver via `findForma("Transfer")` com fallback para qualquer forma ativa do grupo) — service usa `tipoMovimento` para mover saldos, a forma é só registro.
  8. Toast sucesso: "Transferência registrada: {origem} → {destino}".

### 4. `src/lib/mock-data.ts`
Adicionar contas para enriquecer o teste de Transferência (mantém as 3 existentes):

- `fcf4` "Carteira" — `tipoContaId: ftc3` (CARTEIRA), saldo 5000, ativo true, empresa/filial e1/f1.
- `fcf5` "Caixa Filial" — `tipoContaId: ftc1` (CAIXA), saldo 20000, ativo true, empresa/filial e1/f1.
- `fcf6` "Banco Inativo" — `tipoContaId: ftc2` (BANCO), saldo 0, **ativo false**, empresa/filial e1/f1.

(Não duplicar tipos — `ftl3` já cobre Transferência.)

### 5. Validações já cobertas (não mexer)
- Filtro `tiposFiltrados` por `tipoContaConta`.
- `validarDadosBase` rejeita tipo incompatível.
- `resetDetalhes` ao trocar conta/tipo.

## Casos de teste a validar manualmente

1. Origem Caixa → Destino lista todas as ativas exceto Caixa, sem Banco Inativo.
2. Selecionar mesma conta como destino → bloqueado por validação.
3. Valor=0 → erro.
4. Valor > saldo, conta permite negativo → confirma, registra, saldos atualizam.
5. Valor > saldo, conta NÃO permite negativo → service retorna erro, toast exibido.
6. Trocar Origem após selecionar Destino → Destino zera (via resetDetalhes).
7. Trocar Tipo de TRANSFERENCIA para GERAL → contaDestinoId zera, Formas reaparecem.
8. Sem Formas de Pagamento renderizadas no fluxo de Transferência.
9. Mobile <768px → campos em stack.

## Arquivos tocados

- `src/pages/financeiro/lancamento/types.ts` (edit)
- `src/pages/financeiro/lancamento/DetalhesTransferencia.tsx` (new)
- `src/pages/financeiro/lancamento/LancamentoCaixaModal.tsx` (edit)
- `src/lib/mock-data.ts` (edit — 3 contas novas)
- `.lovable/memory/features/lancamento-caixa.md` (update — registrar TRANSFERENCIA implementada)
