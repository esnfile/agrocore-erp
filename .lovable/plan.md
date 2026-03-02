## Plano: Módulo Pessoas + Grupo de Pessoas + Reorganização Menu

### Escopo

8 arquivos afetados (4 novos, 4 modificados). Nenhum layout, modal ou serviço existente será alterado.

---

### 1. Reorganizar menu (`src/lib/modules.ts`)

Mover "Pessoas" e novo "Grupo de Pessoas" para dentro de **Administrativo > Tabelas Gerais**, mantendo rotas existentes:

```text
Administrativo
└── Tabelas Gerais
    ├── Grupo Empresarial
    │   ├── Grupos        → /admin/grupos
    │   ├── Empresas      → /admin/empresas
    │   └── Filiais       → /admin/filiais
    └── Pessoas
        ├── Pessoas       → /cadastros/pessoas
        └── Grupo de Pessoas → /cadastros/grupo-pessoas
```

Remover "Pessoas" do módulo "Cadastros" (mantém Produtos, Categorias, Locais de Estoque).

---

### 2. Interfaces e mock data (`src/lib/mock-data.ts`)

Adicionar:

- `**GrupoPessoa**`: `id`, `grupoId`, `empresaId`, `filialId`, `descGrupoPessoa`, `ativo`, auditoria completa + soft delete
- `**Pessoa**`: `id`, `grupoId`, `empresaId`, `filialId`, `tipoPessoa` (PF/PJ), `grupoPessoaId`, `relacaoComercial` (string[]), `nomeRazao`, `dataNascimentoAbertura`, `cpfCnpj`, `rgIe`, `nomeFantasia`, `sexo`, `ativo`, auditoria + soft delete
- `**Endereco**` (sub-entidade inline, sem tabela própria): `id`, `enderecoPadrao`, `tipoEndereco`, `cep`, `cidade`, `estado`, `endereco`, `numero`, `bairro`, `referencia`
- `**Contato**` (sub-entidade inline): `id`, `contatoPadrao`, `tipoContato`, `descContatoPessoa`
- Pessoa contém `enderecos: Endereco[]` e `contatos: Contato[]`

Mock data com 2-3 registros de GrupoPessoa e 2-3 Pessoas com endereços/contatos.

---

### 3. Services (`src/lib/services.ts`)

Adicionar:

- `**grupoPessoaService**`: `listar(empresaId, filialId)`, `salvar`, `excluir` (soft delete), `nomeExiste`
- `**pessoaService**`: `listar(empresaId, filialId)` com filtros opcionais (nome, cpfCnpj, tipoPessoa, relacaoComercial, status), `salvar`, `excluir` (soft delete), `cpfCnpjExiste`

Todos filtram por `deletadoEm === null`. Preenchem `grupoId/empresaId/filialId` automaticamente via parâmetro (vindo do contexto). Auditoria completa no salvar/excluir.

---

### 4. Página Grupo de Pessoas (`src/pages/cadastros/GrupoPessoasPage.tsx`)

- Padrão existente: PageHeader + DataTable + CrudModal + AlertDialog
- Tabela: Descrição, Status, Ações
- Filtros inline: Descrição (text) + Status (select)
- Modal simples (max-w-lg): Descrição (obrigatório, max 50 chars) + Status (Switch)
- Validação duplicidade de nome
- `grupoId/empresaId/filialId` preenchidos via `useOrganization()` — não exibidos na tela
- Exclusão com confirmação (Cancelar / Excluir)

---

### 5. Página Pessoas (`src/pages/cadastros/PessoasPage.tsx`)

**Listagem:**

- PageHeader + barra de filtros (Nome/Razão, CPF/CNPJ, Tipo Pessoa, Relação Comercial, Status) + Filtrar/Limpar + DataTable
- Colunas: Nome/Razão, Tipo, CPF/CNPJ, Relação Comercial (badges), Status, Ações
- `grupoId/empresaId/filialId` via contexto — não aparecem

**Modal (max-w-4xl, ~1000px):**

Seção **Dados Gerais** — grid 2 colunas:

- Tipo Pessoa (Radio Física/Jurídica) — dinâmico: Física mostra Sexo + máscara CPF + oculta Nome Fantasia + altera os labels para: Data Nascimento, CPF, Nome ; Jurídica mostra Nome Fantasia + máscara CNPJ + oculta Sexo + altera os labels para: Data Abertura, CNPJ, Razão Social
- Grupo de Pessoas (select, obrigatório)
- Relação Comercial (multi-select com checkboxes, mínimo 1)
- Nome: quando selecionado Física ou Razão Social: quando selecionado Jurídica, Nascimento: se Pessoa Física ou Abertura: se Jurídica, CPF: se Física ou CNPJ: se Jurídica, RG/IE, Nome Fantasia (se Jurídica), Sexo (se Física), Status (Switch)

Seção **Endereços** — lista dinâmica:

- Botão "+ Adicionar Endereço"
- Card por endereço com: Padrão (switch), Tipo (Residencial/Comercial/Outros), CEP, Cidade, Estado (select UF), Endereço, Número, Bairro, Referência
- Botões Editar/Remover por card
- Lógica: apenas 1 padrão ativo (desmarcar anterior automaticamente)

Seção **Contatos** — lista dinâmica:

- Botão "+ Adicionar Contato"
- Card por contato com: Padrão (switch), Tipo (Telefone/WhatsApp/Email/Outros), Descrição
- Máscara telefone se Telefone/WhatsApp, validação email se Email
- Apenas 1 padrão ativo

Validações Zod: tipoPessoa obrigatório, grupoPessoaId obrigatório, relacaoComercial min 1, nomeRazao obrigatório, cpfCnpj obrigatório, sexo obrigatório se Física, duplicidade CPF/CNPJ.

---

### 6. Rotas (`src/App.tsx`)

- Importar `GrupoPessoasPage` e `PessoasPage`
- `/cadastros/pessoas` → `PessoasPage` (substituir PlaceholderPage)
- `/cadastros/grupo-pessoas` → `GrupoPessoasPage` (nova rota)

---

### Arquivos afetados


| Arquivo                                    | Ação                                                      |
| ------------------------------------------ | --------------------------------------------------------- |
| `src/lib/modules.ts`                       | Reorganizar menu Administrativo                           |
| `src/lib/mock-data.ts`                     | Interfaces + mock: GrupoPessoa, Pessoa, Endereco, Contato |
| `src/lib/services.ts`                      | grupoPessoaService + pessoaService                        |
| `src/pages/cadastros/GrupoPessoasPage.tsx` | Nova página CRUD                                          |
| `src/pages/cadastros/PessoasPage.tsx`      | Nova página CRUD completa                                 |
| `src/App.tsx`                              | Novas rotas                                               |
