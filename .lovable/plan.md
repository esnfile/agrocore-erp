

# Plan: Alinhar Interfaces Grupo/Empresa/Filial ao Schema Definitivo

## Situacao Atual

O codigo tem inconsistencias graves com o schema definido pelo usuario:

1. **Empresa** ainda tem campos fiscais (tipoPessoa, razaoSocial, nomeFantasia, cpfCnpj, inscricaoEstadual, email, telefone) que deveriam estar apenas na Filial
2. **Filial** usa campos antigos (endereco, numeroKm, inscricaoEstadual, estado) ao inves dos novos (logradouro, numero, complemento, ie, uf, matrizFilial, email, telefone)
3. **Grupo** ja esta correto na interface, mas o GruposPage nao tem campo descricao nem toggle ativo no form
4. ~10 arquivos referenciam `nomeFantasia`/`razaoSocial` de Empresa — todos precisam migrar para `nome`

## Mudancas

### 1. Interface `Empresa` (mock-data.ts)
Simplificar para: `id, grupoId, nome, descricao, ativo` + auditoria/soft-delete.
Remover: tipoPessoa, razaoSocial, nomeFantasia, cpfCnpj, inscricaoEstadual, email, telefone.
Atualizar mock data (e1, e2).

### 2. Interface `Filial` (mock-data.ts)
Atualizar campos:
- Adicionar: `matrizFilial` ("MATRIZ" | "FILIAL"), `email`, `telefone`, `logradouro`, `numero`, `complemento`, `uf`, `ie`
- Remover: `endereco`, `numeroKm`, `inscricaoEstadual`, `estado`
- Manter: `nomeRazao` (nome da filial), `cpfCnpj`, `bairro`, `cep`, `cidade`
Atualizar mock data (f1, f2, f3).

### 3. `GruposPage.tsx` — Adicionar descricao + ativo
Expandir o form Zod com `descricao` (opcional) e `ativo` (boolean, default true). Adicionar campos no modal e colunas na tabela.

### 4. `EmpresasPage.tsx` — Simplificar completamente
Remover mascaras CPF/CNPJ, RadioGroup tipoPessoa, campos fiscais. Form fica: grupoId, nome, descricao, ativo. Modal simples com 4 campos.

### 5. `FiliaisPage.tsx` — Atualizar campos
Schema Zod com novos campos (matrizFilial obrigatorio, ie, email, telefone, logradouro, numero, complemento, uf). Reorganizar modal em grid logico: Empresa + Tipo (Matriz/Filial) → Nome + CPF/CNPJ → Endereco completo → Contato.

### 6. Services (services.ts)
- `empresaService.salvar()`: Remover campos fiscais, usar `nome`, `descricao`, `ativo`
- `filialService.salvar()`: Atualizar para novos campos

### 7. Referencias globais (~8 arquivos)
Substituir `e.nomeFantasia`, `emp?.nomeFantasia || emp?.razaoSocial`, `e.nomeFantasia || e.razaoSocial` por `e.nome` / `emp?.nome`:
- `AppHeader.tsx` (linha 108)
- `DashboardPage.tsx` (linha 10)
- `FiliaisPage.tsx` (linhas 74, 251, 314)
- `CoeficientesPage.tsx` (linhas 93, 161, 266, 275)
- `TabelaPrecosPage.tsx` (linhas 87, 147+)
- `ProdutosPage.tsx`
- `MovimentacaoEstoquePage.tsx` (linha 220)
- `ContratosPage.tsx` (refs indiretas)

Para `Filial.estado` → `uf` e `inscricaoEstadual` → `ie`:
- Atualizar todas as refs em FiliaisPage e onde filiais sao exibidas

## Arquivos Modificados
1. `src/lib/mock-data.ts` — Interfaces Empresa/Filial + dados mock
2. `src/lib/services.ts` — empresaService + filialService
3. `src/pages/admin/GruposPage.tsx` — adicionar descricao/ativo
4. `src/pages/admin/EmpresasPage.tsx` — simplificar form
5. `src/pages/admin/FiliaisPage.tsx` — novos campos
6. `src/components/AppHeader.tsx` — nome
7. `src/pages/DashboardPage.tsx` — nome
8. `src/pages/produtos-estoque/CoeficientesPage.tsx` — nome
9. `src/pages/produtos-estoque/TabelaPrecosPage.tsx` — nome
10. `src/pages/produtos-estoque/ProdutosPage.tsx` — nome
11. `src/pages/produtos-estoque/MovimentacaoEstoquePage.tsx` — nome
12. `src/pages/comercial/ContratosPage.tsx` — nome + filial.uf

