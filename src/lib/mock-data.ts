// ============================================================
// AgroERP — Mock Data Layer
// ============================================================

export interface Grupo {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export interface Empresa {
  id: string;
  grupoId: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export interface Filial {
  id: string;
  empresaId: string;
  matrizFilial: "MATRIZ" | "FILIAL";
  nomeRazao: string;
  cpfCnpj: string;
  ie: string;
  email: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export interface Usuario {
  id: string;
  grupoId: string;
  nome: string;
  email: string;
  avatar?: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

// ---- Grupo de Pessoas ----
export interface GrupoPessoa {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  descGrupoPessoa: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

// ---- Endereço (sub-entidade de Pessoa) ----
export interface Endereco {
  id: string;
  enderecoPadrao: boolean;
  tipoEndereco: "Residencial" | "Comercial" | "Outros";
  cep: string;
  cidade: string;
  estado: string;
  endereco: string;
  numero: string;
  bairro: string;
  referencia: string;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
}

// ---- Contato (sub-entidade de Pessoa) ----
export interface Contato {
  id: string;
  contatoPadrao: boolean;
  tipoContato: "Telefone" | "WhatsApp" | "Email" | "Outros";
  descContatoPessoa: string;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
}

// ---- Pessoa ----
export interface Pessoa {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  tipoPessoa: "PF" | "PJ";
  grupoPessoaId: string;
  relacaoComercial: string[];
  nomeRazao: string;
  dataNascimentoAbertura: string;
  cpfCnpj: string;
  rgIe: string;
  nomeFantasia: string;
  sexo: "Masculino" | "Feminino" | "";
  ativo: boolean;
  enderecos: Endereco[];
  contatos: Contato[];
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

// ---- Grupos ----
export const grupos: Grupo[] = [
  {
    id: "g1",
    nome: "Grupo Agro Sul",
    descricao: "Holding agroindustrial da região sul",
    ativo: true,
    criadoEm: "2024-01-15T10:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T14:30:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "g2",
    nome: "Grupo Norte Agro",
    descricao: "Cooperativa de produtores do norte",
    ativo: true,
    criadoEm: "2024-03-10T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-07-20T10:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Empresas ----
export const empresas: Empresa[] = [
  {
    id: "e1",
    grupoId: "g1",
    nome: "Fazenda Boa Vista",
    descricao: "Empresa agropecuária — produção de grãos e pecuária",
    ativo: true,
    criadoEm: "2024-01-20T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-07-10T09:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "e2",
    grupoId: "g1",
    nome: "Fazenda Silva",
    descricao: "Fazenda familiar — soja e milho",
    ativo: true,
    criadoEm: "2024-02-10T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-08-05T11:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Filiais ----
export const filiais: Filial[] = [
  {
    id: "f1",
    empresaId: "e1",
    matrizFilial: "MATRIZ",
    nomeRazao: "Matriz — Maringá",
    cpfCnpj: "12.345.678/0001-90",
    ie: "123.456.789",
    email: "contato@boavista.agro",
    telefone: "(44) 3333-1111",
    cep: "87000-000",
    logradouro: "Rod. PR-317",
    numero: "Km 12",
    complemento: "",
    bairro: "Zona Rural",
    cidade: "Maringá",
    uf: "PR",
    ativo: true,
    criadoEm: "2024-01-20T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-01-20T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "f2",
    empresaId: "e1",
    matrizFilial: "FILIAL",
    nomeRazao: "Filial — Londrina",
    cpfCnpj: "12.345.678/0002-71",
    ie: "987.654.321",
    email: "londrina@boavista.agro",
    telefone: "(43) 3333-2222",
    cep: "86000-000",
    logradouro: "Rod. PR-445",
    numero: "Km 8",
    complemento: "",
    bairro: "Distrito Industrial",
    cidade: "Londrina",
    uf: "PR",
    ativo: true,
    criadoEm: "2024-03-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-03-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "f3",
    empresaId: "e2",
    matrizFilial: "MATRIZ",
    nomeRazao: "Unidade — Campo Mourão",
    cpfCnpj: "98.765.432/0002-00",
    ie: "",
    email: "joao@fazsilva.agro",
    telefone: "(44) 3333-3333",
    cep: "87300-000",
    logradouro: "Av. das Indústrias",
    numero: "500",
    complemento: "",
    bairro: "Centro",
    cidade: "Campo Mourão",
    uf: "PR",
    ativo: true,
    criadoEm: "2024-02-15T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-02-15T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Usuários ----
export const usuarios: Usuario[] = [
  {
    id: "u1",
    grupoId: "g1",
    nome: "João Administrador",
    email: "joao@agroerp.com",
    ativo: true,
    criadoEm: "2024-01-01T08:00:00Z",
    atualizadoEm: "2024-01-01T08:00:00Z",
  },
];

// ---- Grupo de Pessoas ----
export const gruposPessoa: GrupoPessoa[] = [
  {
    id: "gp1",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    descGrupoPessoa: "Produtores Rurais",
    ativo: true,
    criadoEm: "2024-04-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-04-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "gp2",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    descGrupoPessoa: "Fornecedores de Insumos",
    ativo: true,
    criadoEm: "2024-04-05T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-04-05T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "gp3",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    descGrupoPessoa: "Transportadoras",
    ativo: true,
    criadoEm: "2024-04-10T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-04-10T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Pessoas ----
export const pessoas: Pessoa[] = [
  {
    id: "p1",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    tipoPessoa: "PF",
    grupoPessoaId: "gp1",
    relacaoComercial: ["Produtor", "Cliente"],
    nomeRazao: "Carlos Eduardo Mendes",
    dataNascimentoAbertura: "1985-06-15",
    cpfCnpj: "456.789.123-00",
    rgIe: "12.345.678-9",
    nomeFantasia: "",
    sexo: "Masculino",
    ativo: true,
    enderecos: [
      {
        id: "end1",
        enderecoPadrao: true,
        tipoEndereco: "Residencial",
        cep: "87050-100",
        cidade: "Maringá",
        estado: "PR",
        endereco: "Rua das Palmeiras",
        numero: "123",
        bairro: "Jardim Alvorada",
        referencia: "Próximo ao mercado central",
        criadoEm: "2024-05-01T08:00:00Z",
        criadoPor: "u1",
        atualizadoEm: "2024-05-01T08:00:00Z",
        atualizadoPor: "u1",
      },
    ],
    contatos: [
      {
        id: "ct1",
        contatoPadrao: true,
        tipoContato: "WhatsApp",
        descContatoPessoa: "(44) 99999-1111",
        criadoEm: "2024-05-01T08:00:00Z",
        criadoPor: "u1",
        atualizadoEm: "2024-05-01T08:00:00Z",
        atualizadoPor: "u1",
      },
      {
        id: "ct2",
        contatoPadrao: false,
        tipoContato: "Email",
        descContatoPessoa: "carlos@email.com",
        criadoEm: "2024-05-01T08:00:00Z",
        criadoPor: "u1",
        atualizadoEm: "2024-05-01T08:00:00Z",
        atualizadoPor: "u1",
      },
    ],
    criadoEm: "2024-05-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-05-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "p2",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    tipoPessoa: "PJ",
    grupoPessoaId: "gp2",
    relacaoComercial: ["Fornecedor"],
    nomeRazao: "AgroInsumos Ltda",
    dataNascimentoAbertura: "2010-03-20",
    cpfCnpj: "11.222.333/0001-44",
    rgIe: "987.654.321",
    nomeFantasia: "AgroInsumos",
    sexo: "",
    ativo: true,
    enderecos: [
      {
        id: "end2",
        enderecoPadrao: true,
        tipoEndereco: "Comercial",
        cep: "86010-200",
        cidade: "Londrina",
        estado: "PR",
        endereco: "Av. Brasil",
        numero: "4500",
        bairro: "Centro",
        referencia: "",
        criadoEm: "2024-05-10T08:00:00Z",
        criadoPor: "u1",
        atualizadoEm: "2024-05-10T08:00:00Z",
        atualizadoPor: "u1",
      },
    ],
    contatos: [
      {
        id: "ct3",
        contatoPadrao: true,
        tipoContato: "Telefone",
        descContatoPessoa: "(43) 3344-5566",
        criadoEm: "2024-05-10T08:00:00Z",
        criadoPor: "u1",
        atualizadoEm: "2024-05-10T08:00:00Z",
        atualizadoPor: "u1",
      },
    ],
    criadoEm: "2024-05-10T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-05-10T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Tipo de Produto ----
export interface TipoProduto {
  id: string;
  grupoId: string;
  empresaId: string | null;
  filialId: string | null;
  descricao: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

// ---- Marca de Produto ----
export interface MarcaProduto {
  id: string;
  grupoId: string;
  empresaId: string | null;
  filialId: string | null;
  descricao: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

// ---- Divisão de Produto ----
export interface DivisaoProduto {
  id: string;
  grupoId: string;
  empresaId: string | null;
  filialId: string | null;
  descricao: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

// ---- Seção de Produto ----
export interface SecaoProduto {
  id: string;
  grupoId: string;
  empresaId: string | null;
  filialId: string | null;
  descricao: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

// ---- Grupo de Produto ----
export interface GrupoProduto {
  id: string;
  grupoId: string;
  empresaId: string | null;
  filialId: string | null;
  descricao: string;
  secaoProdutoId: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

// ---- Subgrupo de Produto ----
export interface SubgrupoProduto {
  id: string;
  grupoId: string;
  empresaId: string | null;
  filialId: string | null;
  descricao: string;
  grupoProdutoId: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const tiposProduto: TipoProduto[] = [
  {
    id: "tp1",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Matéria-Prima",
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "tp2",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Produto Acabado",
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

export const marcasProduto: MarcaProduto[] = [
  {
    id: "mp1",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Syngenta",
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

export const divisoesProduto: DivisaoProduto[] = [
  {
    id: "dp1",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Agrícola",
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

export const secoesProduto: SecaoProduto[] = [
  {
    id: "sp1",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Insumos",
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "sp2",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Grãos",
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

export const gruposProduto: GrupoProduto[] = [
  {
    id: "grp1",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Fertilizantes",
    secaoProdutoId: "sp1",
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "grp2",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Soja",
    secaoProdutoId: "sp2",
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

export const subgruposProduto: SubgrupoProduto[] = [
  {
    id: "sgp1",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "NPK",
    grupoProdutoId: "grp1",
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "sgp2",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Soja",
    grupoProdutoId: "grp2",
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Coeficiente ----
export type AplicaSobre = "CUSTO_BASE" | "CUSTO_COM_IMPOSTO";

export interface Coeficiente {
  id: string;
  grupoId: string;
  empresaId: string | null;
  filialId: string | null;
  descricao: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export interface CoeficienteEmpresa {
  id: string;
  coeficienteId: string;
  empresaId: string;
  percentualCustoVariavel: number;
  percentualCustoFixo: number;
  percentualImpostos: number;
  aplicaSobre: AplicaSobre;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

// ---- Tabela de Preço ----
export interface TabelaPreco {
  id: string;
  grupoId: string;
  empresaId: string | null;
  filialId: string | null;
  descricao: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export interface TabelaPrecoEmpresa {
  id: string;
  tabelaPrecoId: string;
  empresaId: string;
  margemLucroPercentual: number;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

// ---- Parâmetros Comerciais ----
export interface ParametroComercial {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string | null;
  atualizarCustoAutomaticamente: boolean;
  atualizarPrecoAutomaticamente: boolean;
  permitirEstoqueNegativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

// ---- Mock Data ----
export const coeficientes: Coeficiente[] = [
  {
    id: "coef1",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Soja",
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "coef2",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Milho",
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

export const coeficienteEmpresas: CoeficienteEmpresa[] = [
  {
    id: "ce1",
    coeficienteId: "coef1",
    empresaId: "e1",
    percentualCustoVariavel: 5.5,
    percentualCustoFixo: 3.2,
    percentualImpostos: 12.0,
    aplicaSobre: "CUSTO_BASE",
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

export const tabelasPreco: TabelaPreco[] = [
  {
    id: "tp_preco1",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Varejo",
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "tp_preco2",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Atacado",
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

export const tabelaPrecoEmpresas: TabelaPrecoEmpresa[] = [
  {
    id: "tpe1",
    tabelaPrecoId: "tp_preco1",
    empresaId: "e1",
    margemLucroPercentual: 15.0,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

export const parametrosComerciais: ParametroComercial[] = [
  {
    id: "pc1",
    grupoId: "g1",
    empresaId: "e1",
    filialId: null,
    atualizarCustoAutomaticamente: false,
    atualizarPrecoAutomaticamente: false,
    permitirEstoqueNegativo: false,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Unidade de Medida ----
export type TipoUnidadeMedida = "PESO" | "VOLUME" | "UNIDADE";

export interface UnidadeMedida {
  id: string;
  grupoId: string;
  empresaId: string | null;
  filialId: string | null;
  codigo: string;
  descricao: string;
  tipo: TipoUnidadeMedida;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

/**
 * Resolves the base unit ID for a given TipoUnidadeMedida.
 * PESO → KG (um1), VOLUME → LT (um4), UNIDADE → UND (um6)
 */
export function getUnidadeBaseParaTipo(tipo: TipoUnidadeMedida): string {
  switch (tipo) {
    case "PESO": return "um1";
    case "VOLUME": return "um4";
    case "UNIDADE": return "um6";
  }
}

export function getCodigoUnidadeBase(tipo: TipoUnidadeMedida): string {
  switch (tipo) {
    case "PESO": return "KG";
    case "VOLUME": return "LT";
    case "UNIDADE": return "UND";
  }
}

// ---- Produto ----
export type TipoBaixaEstoque = "INDIVIDUAL" | "AGREGADO";

export interface Produto {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string | null;
  tipoProdutoId: string;
  codigoBarras: string;
  descricao: string;
  aplicacao: string;
  tipoBaixaEstoque: TipoBaixaEstoque;
  quantidadeEmbalagemEntrada: number;
  quantidadeEmbalagemSaida: number;
  divisaoProdutoId: string;
  secaoProdutoId: string;
  grupoProdutoId: string;
  subgrupoProdutoId: string;
  marcaProdutoId: string | null;
  tipoUnidade: TipoUnidadeMedida;
  unidadeEntradaId: string;
  unidadeSaidaId: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export interface ProdutoEmpresa {
  id: string;
  produtoId: string;
  empresaId: string;
  coeficienteEmpresaId: string;
  custoBase: number;
  custoCalculado: number;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export interface ProdutoEmpresaTabelaPreco {
  id: string;
  produtoEmpresaId: string;
  tabelaPrecoEmpresaId: string;
  precoCalculado: number;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const unidadesMedida: UnidadeMedida[] = [
  {
    id: "um1",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    codigo: "KG",
    descricao: "Quilograma",
    tipo: "PESO",
    
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "um2",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    codigo: "TON",
    descricao: "Tonelada",
    tipo: "PESO",
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "um3",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    codigo: "G",
    descricao: "Grama",
    tipo: "PESO",
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "um4",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    codigo: "LT",
    descricao: "Litro",
    tipo: "VOLUME",
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "um5",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    codigo: "ML",
    descricao: "Mililitro",
    tipo: "VOLUME",
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "um6",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    codigo: "UND",
    descricao: "Unidade",
    tipo: "UNIDADE",
    ativo: true,
    criadoEm: "2024-06-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "um7",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    codigo: "SC",
    descricao: "Saca",
    tipo: "PESO",
    ativo: true,
    criadoEm: "2025-06-23T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-06-24T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

export const produtos: Produto[] = [
  {
    id: "prod1",
    grupoId: "g1",
    empresaId: "e1",
    filialId: null,
    tipoProdutoId: "tp1",
    codigoBarras: "7891234567890",
    descricao: "Fertilizante NPK 20-05-20",
    aplicacao: "Aplicação foliar em soja e milho",
    tipoBaixaEstoque: "INDIVIDUAL",
    quantidadeEmbalagemEntrada: 50,
    quantidadeEmbalagemSaida: 25,
    divisaoProdutoId: "dp1",
    secaoProdutoId: "sp1",
    grupoProdutoId: "grp1",
    subgrupoProdutoId: "sgp1",
    marcaProdutoId: "mp1",
    tipoUnidade: "PESO",
    unidadeEntradaId: "um1",
    unidadeSaidaId: "um1",
    ativo: true,
    criadoEm: "2024-07-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-07-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "prod2",
    grupoId: "g1",
    empresaId: "e1",
    filialId: null,
    tipoProdutoId: "tp1",
    codigoBarras: "7891234567",
    descricao: "Soja",
    aplicacao: "Plantação",
    tipoBaixaEstoque: "INDIVIDUAL",
    quantidadeEmbalagemEntrada: 60,
    quantidadeEmbalagemSaida: 60,
    divisaoProdutoId: "dp1",
    secaoProdutoId: "sp1",
    grupoProdutoId: "grp2",
    subgrupoProdutoId: "sgp2",
    marcaProdutoId: null,
    tipoUnidade: "PESO",
    unidadeEntradaId: "um7",
    unidadeSaidaId: "um7",
    ativo: true,
    criadoEm: "2024-07-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-07-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

export const produtoEmpresas: ProdutoEmpresa[] = [
  {
    id: "pe1",
    produtoId: "prod1",
    empresaId: "e1",
    coeficienteEmpresaId: "ce1",
    custoBase: 120.0,
    custoCalculado: 144.84,
    ativo: true,
    criadoEm: "2024-07-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-07-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "pe2",
    produtoId: "prod2",
    empresaId: "e1",
    coeficienteEmpresaId: "ce1",
    custoBase: 100.0,
    custoCalculado: 120.7,
    ativo: true,
    criadoEm: "2024-07-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-07-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

export const produtoEmpresaTabelasPreco: ProdutoEmpresaTabelaPreco[] = [
  {
    id: "petp1",
    produtoEmpresaId: "pe1",
    tabelaPrecoEmpresaId: "tpe1",
    precoCalculado: 166.57,
    ativo: true,
    criadoEm: "2024-07-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-07-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "petp2",
    produtoEmpresaId: "pe2",
    tabelaPrecoEmpresaId: "tpe1",
    precoCalculado: 138.81,
    ativo: true,
    criadoEm: "2024-07-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-07-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Ponto de Estoque ----
export type TipoPontoEstoque = "PROPRIO" | "TERCEIRO";

export interface PontoEstoque {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  descricao: string;
  principal: boolean;
  tipo: TipoPontoEstoque;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const pontosEstoque: PontoEstoque[] = [
  {
    id: "pe_est1",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    descricao: "Armazém Principal",
    principal: true,
    tipo: "PROPRIO",
    ativo: true,
    criadoEm: "2024-07-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-07-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Estoque ----
export interface Estoque {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  produtoId: string;
  pontoEstoqueId: string;
  quantidadeAtual: number;
  custoMedioAtual: number | null;
  valorTotalEstoque: number | null;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const estoques: Estoque[] = [
  {
    id: "est1",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    produtoId: "prod1",
    pontoEstoqueId: "pe_est1",
    quantidadeAtual: 0,
    custoMedioAtual: null,
    valorTotalEstoque: null,
    criadoEm: "2024-07-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-07-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Movimentação de Estoque ----
export type TipoMovimentoEstoque = "ENTRADA" | "SAIDA" | "AJUSTE";

export interface MovimentacaoEstoque {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  produtoId: string;
  pontoEstoqueId: string;
  tipoMovimento: TipoMovimentoEstoque;
  quantidadeInformada: number;
  unidadeMovimentacaoId: string;
  quantidadeConvertidaBase: number;
  dataMovimentacao: string;
  observacao: string;
  contratoId: string | null;
  romaneioId: string | null;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const movimentacoesEstoque: MovimentacaoEstoque[] = [];

// ---- Estoque em Trânsito ----
export type StatusEstoqueTransito = "ATIVO" | "FINALIZADO" | "CANCELADO";

export interface EstoqueTransito {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string | null;
  filialOrigemId: string | null;
  filialDestinoId: string | null;
  contratoId: string;
  produtoId: string;
  tipoMovimento: "ENTRADA" | "SAIDA";
  quantidadeContratada: number;
  quantidadeMovimentada: number;
  quantidadeSaldo: number;
  status: StatusEstoqueTransito;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const estoquesTransito: EstoqueTransito[] = [];

// ---- Moeda ----
export interface Moeda {
  id: string;
  grupoId: string;
  empresaId: string | null;
  filialId: string | null;
  codigo: string;
  descricao: string;
  simbolo: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const moedas: Moeda[] = [
  {
    id: "moeda1",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    codigo: "BRL",
    descricao: "Real Brasileiro",
    simbolo: "R$",
    ativo: true,
    criadoEm: "2024-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "moeda2",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    codigo: "USD",
    descricao: "Dólar Americano",
    simbolo: "$",
    ativo: true,
    criadoEm: "2024-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "moeda3",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    codigo: "EUR",
    descricao: "Euro",
    simbolo: "€",
    ativo: true,
    criadoEm: "2024-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2024-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Cotação de Moeda ----
export interface CotacaoMoeda {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string | null;
  moedaOrigemId: string;
  moedaDestinoId: string;
  valorCompra: number;
  valorVenda: number;
  variacao: number;
  variacaoPercentual: number;
  valorMaximo: number;
  valorMinimo: number;
  dataHoraCotacao: string;
  fonte: string;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const cotacoesMoeda: CotacaoMoeda[] = [
  {
    id: "cot1",
    grupoId: "g1",
    empresaId: "e1",
    filialId: null,
    moedaOrigemId: "moeda2",
    moedaDestinoId: "moeda1",
    valorCompra: 5.02,
    valorVenda: 5.04,
    variacao: 0.02,
    variacaoPercentual: 0.4,
    valorMaximo: 5.1,
    valorMinimo: 4.95,
    dataHoraCotacao: new Date().toISOString(),
    fonte: "Mock",
    criadoEm: new Date().toISOString(),
    criadoPor: "u1",
    atualizadoEm: new Date().toISOString(),
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "cot2",
    grupoId: "g1",
    empresaId: "e1",
    filialId: null,
    moedaOrigemId: "moeda3",
    moedaDestinoId: "moeda1",
    valorCompra: 5.43,
    valorVenda: 5.46,
    variacao: -0.008,
    variacaoPercentual: -0.15,
    valorMaximo: 5.55,
    valorMinimo: 5.38,
    dataHoraCotacao: new Date().toISOString(),
    fonte: "Mock",
    criadoEm: new Date().toISOString(),
    criadoPor: "u1",
    atualizadoEm: new Date().toISOString(),
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Ponto Estoque ↔ Tipo Produto ----
export interface PontoEstoqueTipoProduto {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  pontoEstoqueId: string;
  tipoProdutoId: string;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const pontoEstoqueTiposProduto: PontoEstoqueTipoProduto[] = [];

// ---- Contratos ----
export type TipoContrato = "COMPRA" | "VENDA";
export type TipoPreco = "FIXO" | "A_FIXAR";
export type StatusContrato = "ABERTO" | "PARCIAL" | "FINALIZADO" | "FATURADO" | "CANCELADO" | "LIQUIDADO";

export interface Contrato {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  numeroContrato: string;
  tipoContrato: TipoContrato;
  pessoaId: string;
  produtoId: string;
  unidadeNegociacaoId: string;
  quantidadeTotal: number;
  quantidadeEntregue: number;
  quantidadeSaldo: number;
  quantidadeBaseTotal: number;
  moedaId: string;
  precoUnitario: number;
  tipoPreco: TipoPreco;
  dataContrato: string;
  dataEntregaInicio: string;
  dataEntregaFim: string;
  filialOperacaoId: string | null;
  filialOrigemId: string | null;
  filialDestinoId: string | null;
  status: StatusContrato;
  duplicatasGeradas: boolean;
  observacoes: string;
  // Tolerância física para liquidação (opcional; padrão 2% se não informado)
  toleranciaPercentualMenos?: number | null;
  toleranciaPercentualMais?: number | null;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export interface ContratoEntrega {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  contratoId: string;
  dataEntrega: string;
  quantidadeInformada: number;
  unidadeInformadaId: string;
  quantidadeConvertidaBase: number;
  pontoEstoqueId: string;
  pesoBruto: number | null;
  pesoLiquido: number | null;
  pesoClassificado: number | null;
  descontoTotalPercentual: number | null;
  pesoComercial: number | null;
  placaVeiculo: string;
  nomeMotorista: string;
  documentoMotorista: string;
  observacoes: string;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export interface ContratoFixacao {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string | null;
  contratoId: string;
  dataFixacao: string;
  quantidadeFixada: number;
  unidadeFixacaoId: string;
  precoFixado: number;
  moedaId: string;
  observacoes: string;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const contratos: Contrato[] = [
  {
    id: "ctr1",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    numeroContrato: "CTR-2025-001",
    tipoContrato: "COMPRA",
    pessoaId: "p1",
    produtoId: "prod1",
    unidadeNegociacaoId: "um1",
    quantidadeTotal: 100000,
    quantidadeEntregue: 25000,
    quantidadeSaldo: 75000,
    quantidadeBaseTotal: 100000,
    moedaId: "moeda1",
    precoUnitario: 120.5,
    tipoPreco: "FIXO",
    dataContrato: "2025-03-01",
    dataEntregaInicio: "2025-04-01",
    dataEntregaFim: "2025-09-30",
    filialOperacaoId: "f1",
    filialOrigemId: null,
    filialDestinoId: "f1",
    status: "PARCIAL",
    duplicatasGeradas: false,
    observacoes: "Contrato de compra de fertilizante NPK",
    criadoEm: "2025-03-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-03-10T14:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ctr2",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    numeroContrato: "CTR-2025-002",
    tipoContrato: "VENDA",
    pessoaId: "p2",
    produtoId: "prod1",
    unidadeNegociacaoId: "um2",
    quantidadeTotal: 500,
    quantidadeEntregue: 0,
    quantidadeSaldo: 500,
    quantidadeBaseTotal: 500000,
    moedaId: "moeda2",
    precoUnitario: 25.0,
    tipoPreco: "A_FIXAR",
    dataContrato: "2025-03-05",
    dataEntregaInicio: "2025-05-01",
    dataEntregaFim: "2025-12-31",
    filialOperacaoId: "f1",
    filialOrigemId: "f1",
    filialDestinoId: null,
    status: "ABERTO",
    duplicatasGeradas: false,
    observacoes: "Contrato de venda com preço a fixar",
    criadoEm: "2025-03-05T10:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-03-05T10:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

export const contratoEntregas: ContratoEntrega[] = [
  {
    id: "ctre1",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    contratoId: "ctr1",
    dataEntrega: "2025-03-10T14:00:00Z",
    quantidadeInformada: 25000,
    unidadeInformadaId: "um1",
    quantidadeConvertidaBase: 25000,
    pontoEstoqueId: "pe_est1",
    pesoBruto: 25500,
    pesoLiquido: 25000,
    pesoClassificado: null,
    descontoTotalPercentual: null,
    pesoComercial: null,
    placaVeiculo: "ABC-1234",
    nomeMotorista: "José da Silva",
    documentoMotorista: "123.456.789-00",
    observacoes: "Primeira entrega",
    criadoEm: "2025-03-10T14:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-03-10T14:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

export const contratoFixacoes: ContratoFixacao[] = [
  {
    id: "ctrf1",
    grupoId: "g1",
    empresaId: "e1",
    filialId: null,
    contratoId: "ctr2",
    dataFixacao: "2025-03-10T10:00:00Z",
    quantidadeFixada: 200,
    unidadeFixacaoId: "um2",
    precoFixado: 48.0,
    moedaId: "moeda2",
    observacoes: "Fixação parcial — lote março",
    criadoEm: "2025-03-10T10:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-03-10T10:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ctrf2",
    grupoId: "g1",
    empresaId: "e1",
    filialId: null,
    contratoId: "ctr2",
    dataFixacao: "2025-03-15T14:00:00Z",
    quantidadeFixada: 100,
    unidadeFixacaoId: "um2",
    precoFixado: 50.0,
    moedaId: "moeda2",
    observacoes: "Fixação parcial — lote abril",
    criadoEm: "2025-03-15T14:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-03-15T14:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Condições de Desconto — Modelo ----
export type TipoCondicaoDesconto = "PERCENTUAL" | "VALOR_FIXO";

export interface CondicaoDescontoModelo {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string | null;
  descricao: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export interface CondicaoDescontoModeloItem {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string | null;
  modeloId: string;
  descricao: string;
  tipo: TipoCondicaoDesconto;
  valor: number;
  ordemCalculo: number;
  automatico: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export interface ContratoCondicao {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  contratoId: string;
  modeloItemId: string | null;
  descricao: string;
  tipo: TipoCondicaoDesconto;
  valor: number;
  automatico: boolean;
  ordemCalculo: number;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const condicaoDescontoModelos: CondicaoDescontoModelo[] = [
  {
    id: "cdm1",
    grupoId: "g1",
    empresaId: "e1",
    filialId: null,
    descricao: "Soja Padrão Trading",
    ativo: true,
    criadoEm: "2025-01-15T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-15T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "cdm2",
    grupoId: "g1",
    empresaId: "e1",
    filialId: null,
    descricao: "Milho Cooperativa",
    ativo: true,
    criadoEm: "2025-01-20T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-20T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

export const condicaoDescontoModeloItens: CondicaoDescontoModeloItem[] = [
  {
    id: "cdmi1",
    grupoId: "g1",
    empresaId: "e1",
    filialId: null,
    modeloId: "cdm1",
    descricao: "FUNRURAL",
    tipo: "PERCENTUAL",
    valor: 1.5,
    ordemCalculo: 1,
    automatico: true,
    criadoEm: "2025-01-15T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-15T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "cdmi2",
    grupoId: "g1",
    empresaId: "e1",
    filialId: null,
    modeloId: "cdm1",
    descricao: "Taxa Administrativa",
    tipo: "PERCENTUAL",
    valor: 0.2,
    ordemCalculo: 2,
    automatico: true,
    criadoEm: "2025-01-15T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-15T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "cdmi3",
    grupoId: "g1",
    empresaId: "e1",
    filialId: null,
    modeloId: "cdm1",
    descricao: "Desconto Comercial",
    tipo: "VALOR_FIXO",
    valor: 2.0,
    ordemCalculo: 3,
    automatico: false,
    criadoEm: "2025-01-15T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-15T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "cdmi4",
    grupoId: "g1",
    empresaId: "e1",
    filialId: null,
    modeloId: "cdm2",
    descricao: "FUNRURAL",
    tipo: "PERCENTUAL",
    valor: 1.5,
    ordemCalculo: 1,
    automatico: true,
    criadoEm: "2025-01-20T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-20T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "cdmi5",
    grupoId: "g1",
    empresaId: "e1",
    filialId: null,
    modeloId: "cdm2",
    descricao: "Desconto Armazenagem",
    tipo: "VALOR_FIXO",
    valor: 3.5,
    ordemCalculo: 2,
    automatico: false,
    criadoEm: "2025-01-20T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-20T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "cdmi6",
    grupoId: "g1",
    empresaId: "e1",
    filialId: null,
    modeloId: "cdm2",
    descricao: "Prêmio Qualidade",
    tipo: "PERCENTUAL",
    valor: 0.5,
    ordemCalculo: 3,
    automatico: false,
    criadoEm: "2025-01-20T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-20T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

export const contratoCondicoes: ContratoCondicao[] = [];

// ---- Classificação de Grãos ----
export type UnidadeClassificacao = "PERCENTUAL" | "KG" | "GRAMAS";

export interface ClassificacaoTipo {
  id: string;
  grupoId: string;
  empresaId: string | null;
  filialId: string | null;
  descricao: string;
  unidade: UnidadeClassificacao;
  valorBase: number | null;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export interface ProdutoClassificacao {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  produtoId: string;
  classificacaoTipoId: string;
  valorPadrao: number;
  limiteTolerancia: number;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export interface ClassificacaoDesconto {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  produtoId: string;
  classificacaoTipoId: string;
  valorMinimo: number;
  valorMaximo: number;
  percentualDesconto: number;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export interface RomaneioClassificacao {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  romaneioId: string;
  classificacaoTipoId: string;
  valorApurado: number;
  percentualDesconto: number;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const classificacaoTipos: ClassificacaoTipo[] = [
  {
    id: "ct1",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Umidade",
    unidade: "PERCENTUAL",
    valorBase: 14,
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ct2",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Impureza",
    unidade: "PERCENTUAL",
    valorBase: 1,
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ct3",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Ardidos",
    unidade: "PERCENTUAL",
    valorBase: 8,
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ct4",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Quebrados",
    unidade: "PERCENTUAL",
    valorBase: null,
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ct5",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Avariados",
    unidade: "PERCENTUAL",
    valorBase: null,
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

export const produtoClassificacoes: ProdutoClassificacao[] = [
  {
    id: "pc1",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    produtoId: "prod1",
    classificacaoTipoId: "ct1",
    valorPadrao: 14,
    limiteTolerancia: 14,
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "pc2",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    produtoId: "prod1",
    classificacaoTipoId: "ct2",
    valorPadrao: 1,
    limiteTolerancia: 1,
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "pc1",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    produtoId: "prod2",
    classificacaoTipoId: "ct1",
    valorPadrao: 14,
    limiteTolerancia: 14,
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "pc2",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    produtoId: "prod2",
    classificacaoTipoId: "ct2",
    valorPadrao: 1,
    limiteTolerancia: 1,
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

export const classificacaoDescontos: ClassificacaoDesconto[] = [
  {
    id: "cd1",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    produtoId: "prod1",
    classificacaoTipoId: "ct1",
    valorMinimo: 0,
    valorMaximo: 14,
    percentualDesconto: 0,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "cd2",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    produtoId: "prod1",
    classificacaoTipoId: "ct1",
    valorMinimo: 14,
    valorMaximo: 15,
    percentualDesconto: 1,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "cd3",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    produtoId: "prod1",
    classificacaoTipoId: "ct1",
    valorMinimo: 15,
    valorMaximo: 16,
    percentualDesconto: 2,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "cd4",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    produtoId: "prod1",
    classificacaoTipoId: "ct2",
    valorMinimo: 0,
    valorMaximo: 1,
    percentualDesconto: 0,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "cd5",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    produtoId: "prod1",
    classificacaoTipoId: "ct2",
    valorMinimo: 1,
    valorMaximo: 3,
    percentualDesconto: 0.5,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "cd6",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    produtoId: "prod1",
    classificacaoTipoId: "ct2",
    valorMinimo: 3,
    valorMaximo: 5,
    percentualDesconto: 1,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "cd1",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    produtoId: "prod2",
    classificacaoTipoId: "ct1",
    valorMinimo: 0,
    valorMaximo: 14,
    percentualDesconto: 0,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "cd2",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    produtoId: "prod2",
    classificacaoTipoId: "ct1",
    valorMinimo: 14,
    valorMaximo: 15,
    percentualDesconto: 1,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "cd3",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    produtoId: "prod2",
    classificacaoTipoId: "ct1",
    valorMinimo: 15,
    valorMaximo: 16,
    percentualDesconto: 2,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "cd4",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    produtoId: "prod2",
    classificacaoTipoId: "ct2",
    valorMinimo: 0,
    valorMaximo: 1,
    percentualDesconto: 0,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "cd5",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    produtoId: "prod2",
    classificacaoTipoId: "ct2",
    valorMinimo: 1,
    valorMaximo: 3,
    percentualDesconto: 0.5,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "cd6",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    produtoId: "prod2",
    classificacaoTipoId: "ct2",
    valorMinimo: 3,
    valorMaximo: 5,
    percentualDesconto: 1,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

export const romaneioClassificacoes: RomaneioClassificacao[] = [];

// ============================================================
// FINANCEIRO
// ============================================================

export type TipoConta = "PAGAR" | "RECEBER";
export type StatusConta = "ABERTO" | "PARCIAL" | "LIQUIDADO" | "CANCELADO";
export type OrigemConta = "MANUAL" | "CONTRATO" | "ROMANEIO" | "FIXACAO";
export type StatusParcela = "PENDENTE" | "PARCIAL" | "PAGO" | "VENCIDA" | "CANCELADA" | "PREVISTO";
export type FormaPagamento = "DINHEIRO" | "PIX" | "TRANSFERENCIA" | "BOLETO" | "OUTROS";

export interface FinanceiroConta {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  tipo: TipoConta;
  pessoaId: string;
  descricao: string;
  dataEmissao: string;
  valorTotal: number;
  valorTotalReal: number;
  status: StatusConta;
  origem: OrigemConta;
  documentoReferencia: string;
  contratoId?: string | null;
  fixacaoId?: string | null;
  moedaOrigemId?: string | null;
  cotacaoUsada?: number | null;
  valorOriginalMoeda?: number | null;
  dataFaturamento?: string | null;
  dataLiquidacao?: string | null;
  observacoes: string;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export interface FinanceiroParcela {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  contaId: string;
  numeroParcela: number;
  totalParcelas: number;
  dataVencimento: string;
  valorParcela: number;
  valorReal: number;
  valorPago: number;
  saldoParcela: number;
  status: StatusParcela;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export interface FinanceiroBaixa {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  parcelaId: string;
  dataPagamento: string;
  valorPago: number;
  formaPagamento: FormaPagamento;
  observacoes: string;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const financeiroContas: FinanceiroConta[] = [
  {
    id: "fc1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    tipo: "PAGAR", pessoaId: "p2", descricao: "Compra de insumos agrícolas",
    dataEmissao: "2025-01-10", valorTotal: 25000, valorTotalReal: 25000,
    status: "ABERTO", origem: "MANUAL", documentoReferencia: "NF-001234",
    contratoId: null, dataFaturamento: null, dataLiquidacao: null,
    observacoes: "",
    criadoEm: "2025-01-10T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-10T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "fc2", grupoId: "g1", empresaId: "e1", filialId: "f1",
    tipo: "RECEBER", pessoaId: "p1", descricao: "Venda de soja safra 2025",
    dataEmissao: "2025-02-01", valorTotal: 180000, valorTotalReal: 180000,
    status: "PARCIAL", origem: "MANUAL", documentoReferencia: "CT-0001",
    contratoId: null, dataFaturamento: null, dataLiquidacao: null,
    observacoes: "Referente contrato de venda",
    criadoEm: "2025-02-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-02-15T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "fc3", grupoId: "g1", empresaId: "e1", filialId: "f1",
    tipo: "PAGAR", pessoaId: "p1", descricao: "Frete transporte grãos",
    dataEmissao: "2025-01-20", valorTotal: 8500, valorTotalReal: 8500,
    status: "LIQUIDADO", origem: "MANUAL", documentoReferencia: "CTE-5678",
    contratoId: null, dataFaturamento: null, dataLiquidacao: "2025-02-20",
    observacoes: "",
    criadoEm: "2025-01-20T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-02-20T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const financeiroParcelas: FinanceiroParcela[] = [
  {
    id: "fp1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    contaId: "fc1", numeroParcela: 1, totalParcelas: 2,
    dataVencimento: "2025-02-10", valorParcela: 12500, valorReal: 12500,
    valorPago: 0, saldoParcela: 12500, status: "PENDENTE",
    criadoEm: "2025-01-10T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-10T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "fp2", grupoId: "g1", empresaId: "e1", filialId: "f1",
    contaId: "fc1", numeroParcela: 2, totalParcelas: 2,
    dataVencimento: "2025-03-10", valorParcela: 12500, valorReal: 12500,
    valorPago: 0, saldoParcela: 12500, status: "PENDENTE",
    criadoEm: "2025-01-10T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-10T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "fp3", grupoId: "g1", empresaId: "e1", filialId: "f1",
    contaId: "fc2", numeroParcela: 1, totalParcelas: 3,
    dataVencimento: "2025-03-01", valorParcela: 60000, valorReal: 60000,
    valorPago: 60000, saldoParcela: 0, status: "PAGO",
    criadoEm: "2025-02-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-03-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "fp4", grupoId: "g1", empresaId: "e1", filialId: "f1",
    contaId: "fc2", numeroParcela: 2, totalParcelas: 3,
    dataVencimento: "2025-04-01", valorParcela: 60000, valorReal: 60000,
    valorPago: 0, saldoParcela: 60000, status: "PENDENTE",
    criadoEm: "2025-02-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-02-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "fp5", grupoId: "g1", empresaId: "e1", filialId: "f1",
    contaId: "fc2", numeroParcela: 3, totalParcelas: 3,
    dataVencimento: "2025-05-01", valorParcela: 60000, valorReal: 60000,
    valorPago: 0, saldoParcela: 60000, status: "PENDENTE",
    criadoEm: "2025-02-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-02-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "fp6", grupoId: "g1", empresaId: "e1", filialId: "f1",
    contaId: "fc3", numeroParcela: 1, totalParcelas: 1,
    dataVencimento: "2025-02-20", valorParcela: 8500, valorReal: 8500,
    valorPago: 8500, saldoParcela: 0, status: "PAGO",
    criadoEm: "2025-01-20T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-02-20T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const financeiroBaixas: FinanceiroBaixa[] = [
  {
    id: "fb1",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    parcelaId: "fp3",
    dataPagamento: "2025-03-01T10:00:00Z",
    valorPago: 60000,
    formaPagamento: "TRANSFERENCIA",
    observacoes: "Pagamento via TED",
    criadoEm: "2025-03-01T10:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-03-01T10:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "fb2",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    parcelaId: "fp6",
    dataPagamento: "2025-02-20T14:00:00Z",
    valorPago: 8500,
    formaPagamento: "PIX",
    observacoes: "",
    criadoEm: "2025-02-20T14:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-02-20T14:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ============================================================
// FINANCEIRO — NOVAS TABELAS
// ============================================================

// ---- Banco ----
export interface FinanceiroBanco {
  id: string;
  grupoId: string;
  empresaId: string | null;
  filialId: string | null;
  codigo: string;
  descricao: string;
  logoBanco: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const financeiroBancos: FinanceiroBanco[] = [
  {
    id: "fb_banco1",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    codigo: "001",
    descricao: "BANCO DO BRASIL",
    logoBanco: "",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "fb_banco2",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    codigo: "104",
    descricao: "CAIXA",
    logoBanco: "",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "fb_banco3",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    codigo: "748",
    descricao: "SICREDI",
    logoBanco: "",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Tipo de Conta ----
export interface FinanceiroTipoConta {
  id: string;
  grupoId: string;
  empresaId: string | null;
  filialId: string | null;
  descricao: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const financeiroTipoContas: FinanceiroTipoConta[] = [
  {
    id: "ftc1",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "CAIXA",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ftc2",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "BANCO",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ftc3",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "CARTEIRA",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Conta Financeira ----
export interface FinanceiroContaFinanceira {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  descricao: string;
  tipoContaId: string;
  saldoAtual: number;
  permiteSaldoNegativo: boolean;
  ativo: boolean;
  bancoId: string | null;
  agencia: string;
  contaCorrente: string;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const financeiroContasFinanceiras: FinanceiroContaFinanceira[] = [
  {
    id: "fcf1",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    descricao: "Caixa Matriz",
    tipoContaId: "ftc1",
    saldoAtual: 15000,
    permiteSaldoNegativo: false,
    ativo: true,
    bancoId: null,
    agencia: "",
    contaCorrente: "",
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "fcf2",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    descricao: "Banco do Brasil - CC",
    tipoContaId: "ftc2",
    saldoAtual: 250000,
    permiteSaldoNegativo: false,
    ativo: true,
    bancoId: "fb_banco1",
    agencia: "1234-5",
    contaCorrente: "12345-6",
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "fcf3",
    grupoId: "g1",
    empresaId: "e1",
    filialId: "f1",
    descricao: "Sicredi - CC",
    tipoContaId: "ftc2",
    saldoAtual: 180000,
    permiteSaldoNegativo: true,
    ativo: true,
    bancoId: "fb_banco3",
    agencia: "0001",
    contaCorrente: "98765-4",
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Tipo de Lançamento ----
export type TipoMovimentoFinanceiro = "ENTRADA" | "SAIDA" | "TRANSFERENCIA";

export interface FinanceiroTipoLancamento {
  id: string;
  grupoId: string;
  empresaId: string | null;
  filialId: string | null;
  descricao: string;
  tipoMovimento: TipoMovimentoFinanceiro;
  tipoConta: string[];
  origemSistema: boolean;
  permiteEdicao: boolean;
  permiteExclusao: boolean;
  exigeCentroCusto: boolean;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const financeiroTiposLancamento: FinanceiroTipoLancamento[] = [
  {
    id: "ftl1",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "BAIXA CONTA RECEBER",
    tipoMovimento: "ENTRADA",
    tipoConta: ["CAIXA", "BANCO"],
    origemSistema: true,
    permiteEdicao: false,
    permiteExclusao: false,
    exigeCentroCusto: false,
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ftl2",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "BAIXA CONTA PAGAR",
    tipoMovimento: "SAIDA",
    tipoConta: ["CAIXA", "BANCO"],
    origemSistema: true,
    permiteEdicao: false,
    permiteExclusao: false,
    exigeCentroCusto: false,
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ftl3",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "TRANSFERENCIA ENTRE CONTAS",
    tipoMovimento: "TRANSFERENCIA",
    tipoConta: ["CAIXA", "BANCO", "CARTEIRA"],
    origemSistema: true,
    permiteEdicao: false,
    permiteExclusao: false,
    exigeCentroCusto: false,
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ftl4",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "ADIANTAMENTO DE CLIENTE",
    tipoMovimento: "ENTRADA",
    tipoConta: ["CAIXA", "BANCO"],
    origemSistema: false,
    permiteEdicao: true,
    permiteExclusao: true,
    exigeCentroCusto: false,
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ftl5",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "ADIANTAMENTO A FORNECEDOR",
    tipoMovimento: "SAIDA",
    tipoConta: ["CAIXA", "BANCO"],
    origemSistema: false,
    permiteEdicao: true,
    permiteExclusao: true,
    exigeCentroCusto: false,
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ftl6",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "LANCAMENTO MANUAL RECEITA",
    tipoMovimento: "ENTRADA",
    tipoConta: ["CAIXA", "BANCO", "CARTEIRA"],
    origemSistema: false,
    permiteEdicao: true,
    permiteExclusao: true,
    exigeCentroCusto: true,
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ftl7",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "LANCAMENTO MANUAL DESPESA",
    tipoMovimento: "SAIDA",
    tipoConta: ["CAIXA", "BANCO", "CARTEIRA"],
    origemSistema: false,
    permiteEdicao: true,
    permiteExclusao: true,
    exigeCentroCusto: true,
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Forma de Pagamento (tabela) ----
export type TipoFormaPagamento = "DINHEIRO" | "BANCARIO" | "ELETRONICO";

export interface FinanceiroFormaPagto {
  id: string;
  grupoId: string;
  empresaId: string | null;
  filialId: string | null;
  descricao: string;
  tipo: TipoFormaPagamento;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const financeiroFormasPagto: FinanceiroFormaPagto[] = [
  {
    id: "ffp1",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Dinheiro",
    tipo: "DINHEIRO",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ffp2",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "PIX",
    tipo: "ELETRONICO",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ffp3",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Transferência",
    tipo: "BANCARIO",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ffp4",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "TED",
    tipo: "BANCARIO",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ffp5",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "DOC",
    tipo: "BANCARIO",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ffp6",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Cheque",
    tipo: "BANCARIO",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ffp7",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Boleto",
    tipo: "BANCARIO",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ffp8",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Cartão Débito",
    tipo: "ELETRONICO",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "ffp9",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Cartão Crédito",
    tipo: "ELETRONICO",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Plano de Contas ----
export type TipoPlanoConta = "RECEITA" | "DESPESA";

export interface FinanceiroPlanoConta {
  id: string;
  grupoId: string;
  empresaId: string | null;
  filialId: string | null;
  codigo: string;
  descricao: string;
  tipo: TipoPlanoConta;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const financeiroPlanoContas: FinanceiroPlanoConta[] = [
  {
    id: "fpc1",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    codigo: "1.1",
    descricao: "Receita de Vendas",
    tipo: "RECEITA",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "fpc2",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    codigo: "1.2",
    descricao: "Receita de Serviços",
    tipo: "RECEITA",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "fpc3",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    codigo: "2.1",
    descricao: "Despesa com Insumos",
    tipo: "DESPESA",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "fpc4",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    codigo: "2.2",
    descricao: "Despesa com Frete",
    tipo: "DESPESA",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "fpc5",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    codigo: "2.3",
    descricao: "Despesa Administrativa",
    tipo: "DESPESA",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "fpc6",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    codigo: "1.3",
    descricao: "Receita Financeira",
    tipo: "RECEITA",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Centro de Custo ----
export interface FinanceiroCentroCusto {
  id: string;
  grupoId: string;
  empresaId: string | null;
  filialId: string | null;
  descricao: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const financeiroCentrosCusto: FinanceiroCentroCusto[] = [
  {
    id: "fcc1",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Lavoura Soja",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "fcc2",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Lavoura Milho",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "fcc3",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Armazém",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "fcc4",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Administrativo",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "fcc5",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Transporte",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
  {
    id: "fcc6",
    grupoId: "g1",
    empresaId: null,
    filialId: null,
    descricao: "Comercial",
    ativo: true,
    criadoEm: "2025-01-01T08:00:00Z",
    criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z",
    atualizadoPor: "u1",
    deletadoEm: null,
    deletadoPor: null,
  },
];

// ---- Movimentação Financeira ----
export interface FinanceiroMovimentacao {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  contaFinanceiraId: string;
  tipoLancamentoId: string;
  tipoMovimento: TipoMovimentoFinanceiro;
  formaPagamentoId: string;
  planoContaId: string | null;
  centroCustoId: string | null;
  dataMovimento: string;
  valor: number;
  numeroDocumento: string;
  historico: string;
  contaOrigemId: string | null;
  contaDestinoId: string | null;
  parcelaId: string | null;
  pessoaId: string | null;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const financeiroMovimentacoes: FinanceiroMovimentacao[] = [];

// ---- Adiantamento ----
export type StatusAdiantamento = "ABERTO" | "PARCIAL" | "LIQUIDADO" | "CANCELADO";

export interface FinanceiroAdiantamento {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  pessoaId: string;
  contratoId: string | null;
  movimentacaoFinanceiraId: string;
  dataAdiantamento: string;
  valorAdiantamento: number;
  saldoUtilizado: number;
  saldoRestante: number;
  status: StatusAdiantamento;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const financeiroAdiantamentos: FinanceiroAdiantamento[] = [];

// ============================================================
// Motoristas
// ============================================================
export interface Motorista {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string | null;
  nome: string;
  documento: string;
  telefone: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const motoristas: Motorista[] = [];

// ============================================================
// Veículos
// ============================================================
export interface Veiculo {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string | null;
  placa: string;
  tipoVeiculo: string;
  transportadora: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const veiculos: Veiculo[] = [];

// ============================================================
// Romaneios
// ============================================================
export type StatusRomaneio =
  | "RASCUNHO"
  | "AGUARDANDO_PESAGEM"
  | "PESAGEM_PARCIAL"
  | "AGUARDANDO_VINCULO"
  | "AGUARDANDO_CLASSIFICACAO"
  | "CLASSIFICADO"
  | "FINALIZADO"
  | "CANCELADO"
  // Legacy compat
  | "ABERTO"
  | "AGUARDANDO_CONTRATO";

export type OrigemRomaneio = "CONTRATO" | "COLHEITA" | "AVULSO";
export type TipoRomaneio = "ENTRADA" | "SAIDA";

export interface RomaneioClassificacaoItem {
  tipo: string;
  label: string;
  base: number;
  apurado: number;
  desconto: number;
  pesoDescontado: number;
}

export interface Romaneio {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  origem: OrigemRomaneio;
  tipoRomaneio: TipoRomaneio;
  contratoId: string | null;
  safraId: string | null;
  cultivoId: string | null;
  pessoaId: string | null;
  produtoId: string;
  motoristaId: string | null;
  motoristaNome: string;
  motoristaDocumento: string;
  veiculoId: string | null;
  placaVeiculo: string;
  pontoEstoqueId: string | null;
  unidadeRomaneioId: string;
  status: StatusRomaneio;
  // Pesos
  pesoEntrada: number;
  pesoSaida: number;
  pesoCarregado: number;
  pesoTara: number;
  pesoLiquidoFisico: number;
  // Classification results
  pesoClassificado: number;
  totalPercentualDescontos: number;
  totalPesoDescontado: number;
  dataClassificacao: string | null;
  // Legacy compat fields
  pesoBruto: number;
  pesoLiquido: number;
  pesoTaraLegacy: number;
  classificacaoUmidade: number;
  classificacaoImpureza: number;
  classificacaoArdidos: number;
  classificacaoAvariados: number;
  pesoLiquidoSecoLimpo: number;
  //
  observacao: string;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const romaneios: Romaneio[] = [];

// ============================================================
// Romaneio Pesagens
// ============================================================
export type TipoPesagem = "ENTRADA" | "SAIDA";
export type OrigemLeitura = "MANUAL" | "BALANCA";

export interface RomaneioPesagem {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  romaneioId: string;
  tipoPesagem: TipoPesagem;
  peso: number;
  dataHora: string;
  origemLeitura: OrigemLeitura;
  operador: string;
  observacao: string;
  criadoEm: string;
  criadoPor: string;
  editadoEm: string | null;
  editadoPor: string | null;
}

export const romaneioPesagens: RomaneioPesagem[] = [];

// ============================================================
// Contrato Liquidações
// ============================================================
export type StatusLiquidacao = "PREVIA" | "CONFIRMADA" | "CANCELADA";

export interface ContratoLiquidacao {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  contratoId: string;
  quantidadeContratada: number;
  quantidadeEntregue: number;
  quantidadeLiquidada: number;
  precoUnitario: number;
  valorBruto: number;
  valorDescontos: number;
  valorLiquido: number;
  status: StatusLiquidacao;
  dataLiquidacao: string;
  observacao: string;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const contratoLiquidacoes: ContratoLiquidacao[] = [];

// ---- Tipos de Desconto Oficiais (Cadastro Mestre) ----
export type TipoDescontoCalculo = "percentual" | "valor_fixo_unitario" | "valor_fixo_total";
export type AplicacaoDesconto = "contrato" | "romaneio" | "ambos";
export type CategoriaDesconto = "tributario" | "qualidade" | "operacional" | "comercial";

export interface DescontoTipo {
  id: string;
  nome: string;
  descricao: string;
  categoria: CategoriaDesconto;
  tipo: TipoDescontoCalculo;
  ordemAplicacao: number;
  obrigatorio: boolean;
  aplicacao: AplicacaoDesconto;
  ativo: boolean;
}

export interface DescontoEmpresaConfig {
  id: string;
  descontoTipoId: string;
  empresaId: string;
  valorPadrao: number;
  ativo: boolean;
}

export const descontoTipos: DescontoTipo[] = [
  {
    id: "dt1",
    nome: "FETHAB",
    descricao: "Fundo Estadual de Transporte e Habitação",
    categoria: "tributario",
    tipo: "valor_fixo_unitario",
    ordemAplicacao: 1,
    obrigatorio: true,
    aplicacao: "romaneio",
    ativo: true,
  },
  {
    id: "dt2",
    nome: "FUNRURAL",
    descricao: "Contribuição ao Fundo de Assistência ao Trabalhador Rural",
    categoria: "tributario",
    tipo: "percentual",
    ordemAplicacao: 2,
    obrigatorio: true,
    aplicacao: "ambos",
    ativo: true,
  },
  {
    id: "dt3",
    nome: "TAXA_ARMAZEM",
    descricao: "Taxa de armazenagem por tonelada/mês",
    categoria: "operacional",
    tipo: "valor_fixo_unitario",
    ordemAplicacao: 3,
    obrigatorio: false,
    aplicacao: "romaneio",
    ativo: true,
  },
  {
    id: "dt4",
    nome: "CLASSIFICACAO",
    descricao: "Desconto por resultado de classificação de grãos",
    categoria: "qualidade",
    tipo: "percentual",
    ordemAplicacao: 4,
    obrigatorio: false,
    aplicacao: "romaneio",
    ativo: true,
  },
  {
    id: "dt5",
    nome: "IMPUREZA",
    descricao: "Desconto por impureza acima do padrão tolerado",
    categoria: "qualidade",
    tipo: "percentual",
    ordemAplicacao: 5,
    obrigatorio: false,
    aplicacao: "romaneio",
    ativo: true,
  },
  {
    id: "dt6",
    nome: "UMIDADE",
    descricao: "Desconto por umidade acima do padrão de recebimento",
    categoria: "qualidade",
    tipo: "percentual",
    ordemAplicacao: 6,
    obrigatorio: false,
    aplicacao: "romaneio",
    ativo: true,
  },
  {
    id: "dt7",
    nome: "ARDIDOS",
    descricao: "Desconto por grãos ardidos acima da tolerância",
    categoria: "qualidade",
    tipo: "percentual",
    ordemAplicacao: 7,
    obrigatorio: false,
    aplicacao: "romaneio",
    ativo: true,
  },
  {
    id: "dt8",
    nome: "AVARIADOS",
    descricao: "Desconto por grãos avariados acima da tolerância",
    categoria: "qualidade",
    tipo: "percentual",
    ordemAplicacao: 8,
    obrigatorio: false,
    aplicacao: "contrato",
    ativo: false,
  },
];

export const descontoEmpresaConfigs: DescontoEmpresaConfig[] = [
  { id: "dec1", descontoTipoId: "dt1", empresaId: "e1", valorPadrao: 9.53, ativo: true },
  { id: "dec2", descontoTipoId: "dt2", empresaId: "e1", valorPadrao: 1.5, ativo: true },
  { id: "dec3", descontoTipoId: "dt3", empresaId: "e1", valorPadrao: 12.0, ativo: true },
  { id: "dec4", descontoTipoId: "dt5", empresaId: "e1", valorPadrao: 1.0, ativo: true },
  { id: "dec5", descontoTipoId: "dt6", empresaId: "e1", valorPadrao: 1.5, ativo: true },
  { id: "dec6", descontoTipoId: "dt1", empresaId: "e2", valorPadrao: 9.53, ativo: true },
  { id: "dec7", descontoTipoId: "dt2", empresaId: "e2", valorPadrao: 1.5, ativo: true },
];
