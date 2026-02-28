## Instrução 1 - Vamos manter os padrões nas confirmações de exclusão, onde os botões serão Cancelar, e Excluir (No caso a confirmação de exclusão da empresa está divergente)... Vamos implementar juntamente com a proxima implementação. Instrução 2 - No cadastro de empresas, quando alterado a empresa para pessoa fisica deve ser obrigatório digitar o Nome e CPF, inclusive adicionar mascara de CPF quando selecionado pessoa juridica deve ser obrigatório digitar a Razão Social e CNPJ, inclusive adicionar mascara de CNPJ no campo;  
Enum Estados Brasileiros + Campo `deletadoPor` na Auditoria

### Instrução 3 - Criar constante de estados brasileiros

`src/lib/constants.ts` (novo arquivo):

- Exportar array `ESTADOS_BRASILEIROS` com os 27 estados: `[{ sigla: "AC"}, { sigla: "AL"}, ...]`
- Será usado como Select na página de Filiais (campo estado)

### 2. Adicionar `deletado_por` em todas as interfaces de auditoria

`src/lib/mock-data.ts`**:**

- Adicionar `deletado_por:` UUID (opcional) nas interfaces `Grupo`, `Empresa`, `Filial`
- Atualizar mock data com `deletado_por: null`

### 3. Atualizar services para preencher `deletado_por`

`src/lib/services.ts`**:**

- Em `grupoService.excluir()`: adicionar `g.deletado_por = "u1"`
- Em `empresaService.excluir()`: adicionar `emp.deletado_por = "u1"`
- Em `filialService.excluir()`: adicionar `f.deletado_por = "u1"` (quando for refatorado para soft delete)

### Arquivos afetados


| Arquivo                | Acao                                             |
| ---------------------- | ------------------------------------------------ |
| `src/lib/constants.ts` | Novo — enum estados brasileiros                  |
| `src/lib/mock-data.ts` | `deletado_por` em Grupo, Empresa, Filial         |
| `src/lib/services.ts`  | Preencher `deletado_por` nos métodos de exclusão |


🔥 INSTRUÇÃO 3 — CRIAR PÁGINA FILIAIS

📌 Objetivo

Criar página:

Administrativo → Grupo Empresarial → Filiais

Sem alterar menus existentes.

🗂 Estrutura da Tabela Filiais (NÃO ALTERAR)

Tabela: filiais

Campos:

id: UUID PK (sequencial)

empresa_id: UUID FK obrigatório

nome_razao: string(200)

cpf_cnpj: string(20)

inscricao_estadual: string(30)

endereco: string(150)

numero_km: string(20)

bairro: string(70)

cep: string(10)

cidade: string(100)

estado: string(2) 

ativo: boolean (toggle)

Auditoria obrigatória:

criado_em

criado_por

atualizado_em

atualizado_por

deletado_em (Soft Delete)  
deletado_por (Soft Delete)

🖥 Página: Listagem de Filiais

📍 Rota

/admin/filiais

🔎 Filtros

Select Empresa (obrigatório)

Busca por Nome/Razão Social

Busca por CNPJ

Botão Filtrar

Botão Limpar

Sempre filtrar: deletado_em IS NULL

📋 Tabela

Colunas:

Empresa

Nome/Razão Social

CPF/CNPJ

Cidade

Estado 

Ativo

Ações

🎛 Ações

✏ Editar

🗑 Excluir (com confirmação obrigatória)

➕ Botão Novo

Texto:

Novo (manter padrão anterior)

Abre Modal

📦 Modal Cadastro / Edição Filial

⚠ Manter padrão visual da modal de Empresa (após correção).

🔎 Validações

Empresa obrigatória

Nome/Razão Social obrigatório

CPF/CNPJ obrigatório

Não permitir duplicidade de CNPJ na mesma empresa

Estado deve ter exatamente 2 caracteres

CEP máximo 10 caracteres

Trim automático em todos os campos texto

💾 Ao Salvar

Se novo:

Gerar UUID sequencial

Preencher auditoria completa

Se edição:

Atualizar campos editáveis

Atualizar atualizado_em e atualizado_por

Nunca alterar criado_em e criado_por.

🗑 Exclusão Filial

Abrir confirmação

Texto:

“Deseja realmente excluir esta filial? Esta ação não poderá ser desfeita.”

Executar soft delete

🚨 Regra de Integridade

Antes de excluir filial:

Verificar se existem registros vinculados (futuro: contratos, estoque, etc).

Por enquanto:

Bloquear exclusão se houver movimentações vinculadas (preparar estrutura, mesmo que ainda não exista).

🎨 Identidade Visual

Manter paleta:

Tabela limpa

Sem cards desnecessários

🔌 Endpoints Esperados

GET /filiais POST /filiais PUT /filiais/{id} DELETE /filiais/{id} (soft delete)

📌 Resultado Esperado

Modal Empresa corrigida e mais espaçada

Confirmação de exclusão implementada

Página Filiais completa

Sem quebrar regras anteriores

100% compatível com API .NET 8

❌ Não alterar layouts já criados

❌ Não alterar menus e submenus

❌ Não quebrar implementações anteriores

✅ Manter auditoria completa

✅ Manter Soft Delete

✅ Backend .NET 8 responsável por regras

✅ Manter identidade visual já aplicada  
  
