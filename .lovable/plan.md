
## Bloqueio de Recriação de Parcelas em Contas a Pagar/Receber

### Concordo: regra crítica
Permitir recriar parcelas de uma conta que já tem baixas/adiantamentos é uma falha grave — gera baixas e movimentações órfãs, quebra a conciliação financeira e a integridade contra o contrato de origem. Vamos travar isso.

### Regra de negócio (definitiva)

Na aba **Parcelas** do modal Editar Conta (`ContasPage`):

| Situação da conta | Botão "Gerar Parcelas" | Editar valor da parcela | Editar vencimento |
|---|---|---|---|
| Manual + sem parcelas | ✅ Habilitado | — | — |
| Manual + parcelas geradas + sem movimento | ✅ Habilitado (recria) | ✅ | ✅ |
| Manual + parcelas + com baixa/adiantamento | ❌ Bloqueado | ❌ | ✅ (só vencimento) |
| Origem CONTRATO/FIXACAO/ROMANEIO (qualquer caso) | ❌ Bloqueado sempre | ❌ | ✅ (só vencimento) |

Mensagem de bloqueio (tooltip/aviso no painel):
- Se origem ≠ MANUAL: *"Parcelas geradas via Contrato/Fixação. Alterações de valor ou recriação devem ser feitas no contrato de origem."*
- Se há movimento: *"Existem baixas ou adiantamentos vinculados. Não é possível recriar parcelas. Apenas a data de vencimento pode ser ajustada."*

### Implementação

**Arquivo único:** `src/pages/financeiro/ContasPage.tsx`

1. **Computar flags** dentro do modal (após carregar `parcelas`, `baixas`, `movimentacoes`):
   ```ts
   const isOrigemContrato = !!editingConta?.contratoId 
     || ["CONTRATO","FIXACAO","ROMANEIO"].includes(editingConta?.origem ?? "");
   const temMovimento = baixas.length > 0 || movimentacoes.length > 0
     || parcelas.some(p => p.valorPago > 0 || p.status === "PARCIAL" || p.status === "PAGO");
   const podeRecriarParcelas = !isOrigemContrato && !temMovimento;
   ```

2. **Botão "Gerar Parcelas"** (linha 533-547): renderizar somente se `podeRecriarParcelas`. Quando bloqueado, mostrar um aviso (Alert com ícone Info) explicando o motivo correto.

3. **Edição inline de parcelas existentes** (se houver — verificar se já existe): permitir apenas alterar `dataVencimento`. Campo de valor sempre readonly quando `!podeRecriarParcelas` (na verdade, valor de parcela existente nunca deve ser editado livremente após criação — só via recriar tudo).

4. **Salvamento**: no `handleSalvarParcelas` (que recria), adicionar guard duplo no início:
   ```ts
   if (!podeRecriarParcelas) {
     toast({ title: "Operação bloqueada", description: "...", variant: "destructive" });
     return;
   }
   ```

5. **Modal "Gerar Parcelas"**: já não abrirá pois o botão some, mas adicionar guard no `onClick` do botão por segurança.

### Resultado
- Contas oriundas de contrato: **somente leitura de valores/quantidade**, vencimento ajustável.
- Contas manuais com qualquer baixa/adiantamento: **bloqueadas** para recriação.
- Contas manuais virgens: comportamento atual preservado.
- Sem mais lançamentos órfãos no caixa.

### Arquivos afetados
| Arquivo | Mudança |
|---|---|
| `src/pages/financeiro/ContasPage.tsx` | Flags `isOrigemContrato`, `temMovimento`, `podeRecriarParcelas`; ocultar botão; aviso explicativo; guard no salvamento |

### O que NÃO muda
- Geração de parcelas via Contrato (continua funcionando normalmente)
- Estrutura de dados (`mock-data`, `services`)
- Aba Pagamentos e listagem geral de contas
