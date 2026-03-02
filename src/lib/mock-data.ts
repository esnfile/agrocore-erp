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
  tipoPessoa: "PF" | "PJ";
  razaoSocial: string;
  nomeFantasia: string;
  cpfCnpj: string;
  inscricaoEstadual: string;
  email: string;
  telefone: string;
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
  nomeRazao: string;
  cpfCnpj: string;
  inscricaoEstadual: string;
  endereco: string;
  numeroKm: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
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
}

// ---- Contato (sub-entidade de Pessoa) ----
export interface Contato {
  id: string;
  contatoPadrao: boolean;
  tipoContato: "Telefone" | "WhatsApp" | "Email" | "Outros";
  descContatoPessoa: string;
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
    tipoPessoa: "PJ",
    razaoSocial: "Fazenda Boa Vista Ltda",
    nomeFantasia: "Fazenda Boa Vista",
    cpfCnpj: "12.345.678/0001-90",
    inscricaoEstadual: "123.456.789",
    email: "contato@boavista.agro",
    telefone: "(44) 3333-1111",
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
    tipoPessoa: "PF",
    razaoSocial: "João da Silva",
    nomeFantasia: "Fazenda Silva",
    cpfCnpj: "123.456.789-00",
    inscricaoEstadual: "",
    email: "joao@fazsilva.agro",
    telefone: "(44) 3333-2222",
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
    nomeRazao: "Matriz — Maringá",
    cpfCnpj: "12.345.678/0001-90",
    inscricaoEstadual: "123.456.789",
    endereco: "Rod. PR-317 Km 12",
    numeroKm: "Km 12",
    bairro: "Zona Rural",
    cep: "87000-000",
    cidade: "Maringá",
    estado: "PR",
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
    nomeRazao: "Filial — Londrina",
    cpfCnpj: "12.345.678/0002-71",
    inscricaoEstadual: "987.654.321",
    endereco: "Rod. PR-445 Km 8",
    numeroKm: "Km 8",
    bairro: "Distrito Industrial",
    cep: "86000-000",
    cidade: "Londrina",
    estado: "PR",
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
    nomeRazao: "Unidade — Campo Mourão",
    cpfCnpj: "98.765.432/0002-00",
    inscricaoEstadual: "",
    endereco: "Av. das Indústrias 500",
    numeroKm: "500",
    bairro: "Centro",
    cep: "87300-000",
    cidade: "Campo Mourão",
    estado: "PR",
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
      },
    ],
    contatos: [
      {
        id: "ct1",
        contatoPadrao: true,
        tipoContato: "WhatsApp",
        descContatoPessoa: "(44) 99999-1111",
      },
      {
        id: "ct2",
        contatoPadrao: false,
        tipoContato: "Email",
        descContatoPessoa: "carlos@email.com",
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
      },
    ],
    contatos: [
      {
        id: "ct3",
        contatoPadrao: true,
        tipoContato: "Telefone",
        descContatoPessoa: "(43) 3344-5566",
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
