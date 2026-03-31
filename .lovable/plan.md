

# Criar componente FormRow reutilizavel para layout em grid

## Resumo

Criar um componente utilitario `FormRow` que qualquer pagina do sistema pode usar para organizar campos de formulario em grid responsivo (1 a 4 colunas). O componente sera simples, declarativo e 100% retrocompativel -- nenhuma tela existente sera afetada.

## O que sera criado

### Novo arquivo: `src/components/FormRow.tsx`

Componente que aceita:
- `columns` (1-4, padrao 1) -- numero de colunas em desktop
- `gap` (opcional, padrao "6") -- espacamento entre campos
- `children` -- os campos do formulario

Renderiza um CSS Grid responsivo: `grid-cols-1` em mobile, `md:grid-cols-{N}` em desktop.

### Aplicacao imediata: `ContratosPage.tsx`

Substituir os `div` manuais de grid na aba "Dados do Contrato" por `FormRow`, corrigindo de vez o alinhamento:
- `<FormRow columns={3}>` para Tipo, Numero, Data
- `<FormRow columns={2}>` para Moeda, Preco Unitario

### Nenhuma alteracao em CrudModal ou SimpleCrudPage

O CrudModal continua recebendo `children` livremente. Qualquer pagina que quiser grid basta importar `FormRow` e envolver seus campos. Paginas que nao usarem continuam em coluna unica.

## Exemplo de uso (qualquer pagina)

```text
<FormRow columns={3}>
  <campo1 />
  <campo2 />
  <campo3 />
</FormRow>
<FormRow columns={2}>
  <campo4 />
  <campo5 />
</FormRow>
```

## Detalhes tecnicos

- Componente com ~15 linhas usando Tailwind classes dinamicas
- Classes pre-definidas para columns 1-4 (necessario para Tailwind JIT)
- Gap configuravel via prop
- Responsividade automatica: empilha em mobile, grid em desktop

