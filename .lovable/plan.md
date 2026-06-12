## Análise do prompt — o que está OK e o que precisa ajustar

O conceito (telas dedicadas, simples, foco em produtividade do operador) está correto e cabe perfeitamente no sistema. Porém o prompt, como está escrito, **conflita com o modelo já implementado** em vários pontos. Se eu implementar literalmente, vou duplicar/quebrar regras existentes. Abaixo o que precisa ser ajustado **antes** de codar.

### 1. Modelo de pesagem (DIVERGÊNCIA importante)

O prompt descreve cada pesagem com `Peso Bruto + Peso Tara → Peso Líquido = Bruto − Tara`.
O sistema atual (`StepPesagens`, `RomaneioPesagem`) usa **duas pesagens distintas**: `ENTRADA` e `SAIDA`, e calcula:

- `pesoCarregado` = maior das duas
- `pesoTara` = menor das duas
- `pesoLiquidoFisico` = `pesoCarregado − pesoTara`

Isso é o padrão real de balança rodoviária (1ª pesagem entrando, 2ª saindo). Trocar para "Bruto/Tara por pesagem" quebra o contrato com Classificação, Vínculo e Fluxo Financeiro.

**Proposta:** manter o modelo atual. A "tela de pesagem do operador" registra Pesagem 1 (ENTRADA) e Pesagem 2 (SAÍDA), com a UI mostrando ao final Bruto, Tara e Líquido Físico calculados — exatamente como hoje, só que com layout simplificado.

### 2. Classificação (DIVERGÊNCIA importante)

O prompt sugere campos fixos (Umidade, Impureza, PLSL simples).
O sistema já tem **engine paramétrico de classificação por produto** (`produtoClassificacoes`, `classificacaoDescontos`, cálculo progressivo sequencial — ver memória `qualidade`). É o padrão "Core" e está em produção no Step 4.

**Proposta:** a tela do operador **reusa** esse engine (mesmos campos, mesmo cálculo do `StepClassificacao`). Só muda o invólucro (listagem + página dedicada simples). Nada de duplicar lógica.

### 3. Motorista e Veículo (DIVERGÊNCIA)

O prompt pede texto livre + "Tipo Veículo dropdown fixo".
O projeto tem cadastros próprios: `MotoristasPage`, `VeiculosPage` (já em produção, com CPF e placa validados, vínculo a Tipo de Veículo).

**Proposta:** dropdown buscável de Motorista e Veículo cadastrados, com botão **"+ Cadastrar"** inline (modal rápido) para não tirar o operador do fluxo. Mantém integridade referencial.

### 4. Status / Fluxo (AJUSTE)

O prompt pula `AGUARDANDO_VINCULO`. Para **AVULSO**, isso já é correto: o sistema hoje vai direto `AGUARDANDO_PESAGEM → AGUARDANDO_CLASSIFICACAO` quando não há vínculo. Confirmado, sem mudança.

### 5. Validação de unicidade (NOVO — bom)

A chave proposta (Empresa+Filial+Origem+Tipo+Produto+Estoque+Motorista+Veículo+Data) é adequada. Vou implementar no `romaneioService.salvar` (camada única), valendo para **as 3 telas** (Romaneios, Pesagem, Classificação não cria).

### 6. Auditoria `origemCriacao` (NOVO — bom)

Adicionar campo `origemCriacao: "TELA_ROMANEIOS" | "TELA_PESAGEM"` no tipo `Romaneio` e default conforme tela. Já temos `criadoEm`/`criadoPor` (auditoria global).

### 7. Tipo de romaneio em AVULSO (AJUSTE)

Hoje romaneio principal aceita ENTRADA/SAÍDA. Confirma-se: tela de Pesagem permite ambos.

### 8. Responsividade tablet

OK como descrito. Vou usar Cards em ≤1024px e tabela densa em desktop.

---

## Plano de implementação

### A. Modelo / dados

1. `mock-data.ts`: adicionar `origemCriacao` ao tipo `Romaneio` (default `"TELA_ROMANEIOS"` nos seeds existentes).
2. `services.ts → romaneioService.salvar`: adicionar **validação de unicidade** (retorna `{ erro }` se duplicar conforme regra do item 5).

### B. Rota e menu

3. Novas rotas em `App.tsx`:
  - `/balanca/pesagem` → `PesagemPage`
  - `/balanca/pesagem/:id` → `PesagemDetalhePage` (tela 1.3)
  - `/balanca/classificacao` → `ClassificacaoListaPage`
  - `/balanca/classificacao/:id` → `ClassificacaoDetalhePage`
4. `modules.ts`: novo módulo **"Balança"** com 2 itens: Pesagem e Classificação (ícones `Scale` e `ClipboardCheck`).

### C. Tela de Pesagem — Listagem (`src/pages/balanca/PesagemPage.tsx`)

- Filtros: Empresa, Filial, Produto (status fixo = AGUARDANDO_PESAGEM/PESAGEM_PARCIAL).
- Tabela: Romaneio, Produto, Motorista, Veículo, Data, ações ("Pesar").
- Botão "+ Novo Romaneio" → modal simplificado (campos do item 1.2 do prompt, **com Motorista/Veículo via dropdown cadastrado** + quick-add).
- Ao salvar: chama `romaneioService.salvar({ origem: "AVULSO", origemCriacao: "TELA_PESAGEM", status: "AGUARDANDO_PESAGEM" })`; se duplicar, mostra erro do serviço.
- Após criar, navega para `/balanca/pesagem/:id`.

### D. Tela de Pesagem — Detalhe (`PesagemDetalhePage`)

- Header read-only: Romaneio, Produto, Estoque, Motorista, Veículo.
- Reaproveita **o componente `StepPesagens` existente** (ou um wrapper enxuto) — mesma lógica ENTRADA/SAÍDA, mesmo cálculo automático.
- Botão "Confirmar Pesagem" no rodapé: exige ≥1 pesagem (idealmente as 2); muda status para `AGUARDANDO_CLASSIFICACAO`; volta à listagem com toast.

### E. Tela de Classificação — Listagem (`ClassificacaoListaPage`)

- Filtros: Empresa, Filial, Produto (status fixo = AGUARDANDO_CLASSIFICACAO).
- Tabela igual à de Pesagem, sem botão "+ Novo".
- Linha clicável → `/balanca/classificacao/:id`.

### F. Tela de Classificação — Detalhe (`ClassificacaoDetalhePage`)

- Header read-only.
- Reaproveita **o componente `StepClassificacao` existente** (mesmo engine paramétrico — Umidade/Impureza/etc são derivados do cadastro do produto, exatamente como hoje).
- Botão "Confirmar Classificação" muda status para `CLASSIFICADO`.

### G. Casos de teste

Cobrir os 13 cenários do prompt + unicidade + tablet (snap 1024 e 800px).

---

## Arquivos a criar

```
src/pages/balanca/PesagemPage.tsx
src/pages/balanca/PesagemDetalhePage.tsx
src/pages/balanca/NovoRomaneioAvulsoModal.tsx
src/pages/balanca/ClassificacaoListaPage.tsx
src/pages/balanca/ClassificacaoDetalhePage.tsx
```

## Arquivos a editar

```
src/lib/mock-data.ts       (campo origemCriacao)
src/lib/services.ts        (validação de unicidade no salvar)
src/App.tsx                (4 rotas novas)
src/lib/modules.ts         (menu "Balança")
```

---

## Pontos a confirmar antes de implementar

1. **Pesagem ENTRADA/SAÍDA vs Bruto/Tara**: confirma que mantemos o modelo atual (ENTRADA + SAÍDA, sistema deduz Bruto/Tara/Líquido)? Recomendo fortemente sim.
2. **Motorista/Veículo**: usar dropdown dos cadastros existentes (com quick-add inline) em vez de texto livre? Recomendo sim.
3. **Classificação**: reusar o engine paramétrico atual (campos vêm do cadastro do produto) em vez de Umidade/Impureza fixos? Recomendo sim.
4. **Menu**: criar módulo novo "Balança" (com Pesagem + Classificação) ou colocar como submenu dentro de "Romaneios"?  
Vamos colocar como submenu dentro de Romaneios  
  
O restante pode seguir com o pdrão que já veio, e seguie sua sugestão