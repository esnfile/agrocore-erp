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

// ---- Tipo de Produto ----
export interface TipoProduto {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
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
  empresaId: string;
  filialId: string;
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
  empresaId: string;
  filialId: string;
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
  empresaId: string;
  filialId: string;
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
  empresaId: string;
  filialId: string;
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
  empresaId: string;
  filialId: string;
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
    id: "tp1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    descricao: "Matéria-Prima", ativo: true,
    criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "tp2", grupoId: "g1", empresaId: "e1", filialId: "f1",
    descricao: "Produto Acabado", ativo: true,
    criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const marcasProduto: MarcaProduto[] = [
  {
    id: "mp1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    descricao: "Syngenta", ativo: true,
    criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const divisoesProduto: DivisaoProduto[] = [
  {
    id: "dp1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    descricao: "Agrícola", ativo: true,
    criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const secoesProduto: SecaoProduto[] = [
  {
    id: "sp1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    descricao: "Insumos", ativo: true,
    criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "sp2", grupoId: "g1", empresaId: "e1", filialId: "f1",
    descricao: "Grãos", ativo: true,
    criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const gruposProduto: GrupoProduto[] = [
  {
    id: "grp1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    descricao: "Fertilizantes", secaoProdutoId: "sp1", ativo: true,
    criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "grp2", grupoId: "g1", empresaId: "e1", filialId: "f1",
    descricao: "Soja", secaoProdutoId: "sp2", ativo: true,
    criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const subgruposProduto: SubgrupoProduto[] = [
  {
    id: "sgp1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    descricao: "NPK", grupoProdutoId: "grp1", ativo: true,
    criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
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
    id: "coef1", grupoId: "g1", empresaId: null, filialId: null,
    descricao: "Soja", ativo: true,
    criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "coef2", grupoId: "g1", empresaId: null, filialId: null,
    descricao: "Milho", ativo: true,
    criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const coeficienteEmpresas: CoeficienteEmpresa[] = [
  {
    id: "ce1", coeficienteId: "coef1", empresaId: "e1",
    percentualCustoVariavel: 5.50, percentualCustoFixo: 3.20,
    percentualImpostos: 12.00, aplicaSobre: "CUSTO_BASE",
    criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const tabelasPreco: TabelaPreco[] = [
  {
    id: "tp_preco1", grupoId: "g1", empresaId: null, filialId: null,
    descricao: "Varejo", ativo: true,
    criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "tp_preco2", grupoId: "g1", empresaId: null, filialId: null,
    descricao: "Atacado", ativo: true,
    criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const tabelaPrecoEmpresas: TabelaPrecoEmpresa[] = [
  {
    id: "tpe1", tabelaPrecoId: "tp_preco1", empresaId: "e1",
    margemLucroPercentual: 15.00,
    criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const parametrosComerciais: ParametroComercial[] = [
  {
    id: "pc1", grupoId: "g1", empresaId: "e1", filialId: null,
    atualizarCustoAutomaticamente: false,
    atualizarPrecoAutomaticamente: false,
    permitirEstoqueNegativo: false,
    criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

// ---- Unidade de Medida ----
export type TipoUnidadeMedida = "PESO" | "VOLUME" | "UNIDADE";

export interface UnidadeMedida {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  codigo: string;
  descricao: string;
  tipo: TipoUnidadeMedida;
  fatorBase: number;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

// ---- Produto ----
export type TipoBaixaEstoque = "INDIVIDUAL" | "AGREGADO";

export interface Produto {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
  tipoProdutoId: string;
  codigoBarras: string;
  descricao: string;
  aplicacao: string;
  tipoBaixaEstoque: TipoBaixaEstoque;
  quantidadeEmbalagemCompra: number;
  quantidadeEmbalagemVenda: number;
  divisaoProdutoId: string;
  secaoProdutoId: string;
  grupoProdutoId: string;
  subgrupoProdutoId: string;
  marcaProdutoId: string | null;
  unidadeBaseId: string;
  unidadeCompraId: string;
  unidadeVendaId: string;
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
  { id: "um1", grupoId: "g1", empresaId: "e1", filialId: "f1", codigo: "KG", descricao: "Quilograma", tipo: "PESO", fatorBase: 1, ativo: true, criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1", atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1", deletadoEm: null, deletadoPor: null },
  { id: "um2", grupoId: "g1", empresaId: "e1", filialId: "f1", codigo: "TON", descricao: "Tonelada", tipo: "PESO", fatorBase: 1000, ativo: true, criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1", atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1", deletadoEm: null, deletadoPor: null },
  { id: "um3", grupoId: "g1", empresaId: "e1", filialId: "f1", codigo: "G", descricao: "Grama", tipo: "PESO", fatorBase: 0.001, ativo: true, criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1", atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1", deletadoEm: null, deletadoPor: null },
  { id: "um4", grupoId: "g1", empresaId: "e1", filialId: "f1", codigo: "L", descricao: "Litro", tipo: "VOLUME", fatorBase: 1, ativo: true, criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1", atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1", deletadoEm: null, deletadoPor: null },
  { id: "um5", grupoId: "g1", empresaId: "e1", filialId: "f1", codigo: "ML", descricao: "Mililitro", tipo: "VOLUME", fatorBase: 0.001, ativo: true, criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1", atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1", deletadoEm: null, deletadoPor: null },
  { id: "um6", grupoId: "g1", empresaId: "e1", filialId: "f1", codigo: "UND", descricao: "Unidade", tipo: "UNIDADE", fatorBase: 1, ativo: true, criadoEm: "2024-06-01T08:00:00Z", criadoPor: "u1", atualizadoEm: "2024-06-01T08:00:00Z", atualizadoPor: "u1", deletadoEm: null, deletadoPor: null },
];

export const produtos: Produto[] = [
  {
    id: "prod1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    tipoProdutoId: "tp1",
    codigoBarras: "7891234567890", descricao: "Fertilizante NPK 20-05-20",
    aplicacao: "Aplicação foliar em soja e milho",
    tipoBaixaEstoque: "INDIVIDUAL",
    quantidadeEmbalagemCompra: 50, quantidadeEmbalagemVenda: 25,
    divisaoProdutoId: "dp1", secaoProdutoId: "sp1",
    grupoProdutoId: "grp1", subgrupoProdutoId: "sgp1",
    marcaProdutoId: "mp1",
    unidadeBaseId: "um1", unidadeCompraId: "um1", unidadeVendaId: "um1",
    ativo: true,
    criadoEm: "2024-07-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-07-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const produtoEmpresas: ProdutoEmpresa[] = [
  {
    id: "pe1", produtoId: "prod1", empresaId: "e1",
    coeficienteEmpresaId: "ce1", custoBase: 120.00, custoCalculado: 144.84,
    ativo: true,
    criadoEm: "2024-07-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-07-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const produtoEmpresaTabelasPreco: ProdutoEmpresaTabelaPreco[] = [
  {
    id: "petp1", produtoEmpresaId: "pe1", tabelaPrecoEmpresaId: "tpe1",
    precoCalculado: 166.57, ativo: true,
    criadoEm: "2024-07-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-07-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
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
    id: "pe_est1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    descricao: "Armazém Principal", principal: true, tipo: "PROPRIO", ativo: true,
    criadoEm: "2024-07-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-07-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
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
    id: "est1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    produtoId: "prod1", pontoEstoqueId: "pe_est1",
    quantidadeAtual: 0, custoMedioAtual: null, valorTotalEstoque: null,
    criadoEm: "2024-07-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-07-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
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
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  deletadoEm: string | null;
  deletadoPor: string | null;
}

export const movimentacoesEstoque: MovimentacaoEstoque[] = [];

// ---- Moeda ----
export interface Moeda {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
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
    id: "moeda1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    codigo: "BRL", descricao: "Real Brasileiro", simbolo: "R$", ativo: true,
    criadoEm: "2024-01-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-01-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "moeda2", grupoId: "g1", empresaId: "e1", filialId: "f1",
    codigo: "USD", descricao: "Dólar Americano", simbolo: "$", ativo: true,
    criadoEm: "2024-01-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-01-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "moeda3", grupoId: "g1", empresaId: "e1", filialId: "f1",
    codigo: "EUR", descricao: "Euro", simbolo: "€", ativo: true,
    criadoEm: "2024-01-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2024-01-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

// ---- Cotação de Moeda ----
export interface CotacaoMoeda {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
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
    id: "cot1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    moedaOrigemId: "moeda2", moedaDestinoId: "moeda1",
    valorCompra: 5.02, valorVenda: 5.04,
    variacao: 0.02, variacaoPercentual: 0.40,
    valorMaximo: 5.10, valorMinimo: 4.95,
    dataHoraCotacao: new Date().toISOString(), fonte: "Mock",
    criadoEm: new Date().toISOString(), criadoPor: "u1",
    atualizadoEm: new Date().toISOString(), atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "cot2", grupoId: "g1", empresaId: "e1", filialId: "f1",
    moedaOrigemId: "moeda3", moedaDestinoId: "moeda1",
    valorCompra: 5.43, valorVenda: 5.46,
    variacao: -0.008, variacaoPercentual: -0.15,
    valorMaximo: 5.55, valorMinimo: 5.38,
    dataHoraCotacao: new Date().toISOString(), fonte: "Mock",
    criadoEm: new Date().toISOString(), criadoPor: "u1",
    atualizadoEm: new Date().toISOString(), atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
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
export type StatusContrato = "ABERTO" | "PARCIAL" | "FINALIZADO" | "CANCELADO";

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
  status: StatusContrato;
  observacoes: string;
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
  filialId: string;
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
    id: "ctr1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    numeroContrato: "CTR-2025-001", tipoContrato: "COMPRA",
    pessoaId: "p1", produtoId: "prod1",
    unidadeNegociacaoId: "um1", quantidadeTotal: 100000,
    quantidadeEntregue: 25000, quantidadeSaldo: 75000,
    quantidadeBaseTotal: 100000,
    moedaId: "moeda1", precoUnitario: 120.50,
    tipoPreco: "FIXO",
    dataContrato: "2025-03-01",
    dataEntregaInicio: "2025-04-01", dataEntregaFim: "2025-09-30",
    status: "PARCIAL", observacoes: "Contrato de compra de fertilizante NPK",
    criadoEm: "2025-03-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-03-10T14:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "ctr2", grupoId: "g1", empresaId: "e1", filialId: "f1",
    numeroContrato: "CTR-2025-002", tipoContrato: "VENDA",
    pessoaId: "p2", produtoId: "prod1",
    unidadeNegociacaoId: "um2", quantidadeTotal: 500,
    quantidadeEntregue: 0, quantidadeSaldo: 500,
    quantidadeBaseTotal: 500000,
    moedaId: "moeda2", precoUnitario: 25.00,
    tipoPreco: "A_FIXAR",
    dataContrato: "2025-03-05",
    dataEntregaInicio: "2025-05-01", dataEntregaFim: "2025-12-31",
    status: "ABERTO", observacoes: "Contrato de venda com preço a fixar",
    criadoEm: "2025-03-05T10:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-03-05T10:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const contratoEntregas: ContratoEntrega[] = [
  {
    id: "ctre1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    contratoId: "ctr1", dataEntrega: "2025-03-10T14:00:00Z",
    quantidadeInformada: 25000, unidadeInformadaId: "um1",
    quantidadeConvertidaBase: 25000,
    pontoEstoqueId: "pe_est1",
    pesoBruto: 25500, pesoLiquido: 25000,
    pesoClassificado: null, descontoTotalPercentual: null, pesoComercial: null,
    placaVeiculo: "ABC-1234", nomeMotorista: "José da Silva",
    documentoMotorista: "123.456.789-00",
    observacoes: "Primeira entrega",
    criadoEm: "2025-03-10T14:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-03-10T14:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const contratoFixacoes: ContratoFixacao[] = [];

// ---- Condições de Desconto — Modelo ----
export type TipoCondicaoDesconto = "PERCENTUAL" | "VALOR_FIXO";

export interface CondicaoDescontoModelo {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
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
  filialId: string;
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
    id: "cdm1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    descricao: "Soja Padrão Trading", ativo: true,
    criadoEm: "2025-01-15T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-15T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "cdm2", grupoId: "g1", empresaId: "e1", filialId: "f1",
    descricao: "Milho Cooperativa", ativo: true,
    criadoEm: "2025-01-20T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-20T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const condicaoDescontoModeloItens: CondicaoDescontoModeloItem[] = [
  {
    id: "cdmi1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    modeloId: "cdm1", descricao: "FUNRURAL", tipo: "PERCENTUAL", valor: 1.5,
    ordemCalculo: 1, automatico: true,
    criadoEm: "2025-01-15T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-15T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "cdmi2", grupoId: "g1", empresaId: "e1", filialId: "f1",
    modeloId: "cdm1", descricao: "Taxa Administrativa", tipo: "PERCENTUAL", valor: 0.2,
    ordemCalculo: 2, automatico: true,
    criadoEm: "2025-01-15T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-15T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "cdmi3", grupoId: "g1", empresaId: "e1", filialId: "f1",
    modeloId: "cdm1", descricao: "Desconto Comercial", tipo: "VALOR_FIXO", valor: 2.00,
    ordemCalculo: 3, automatico: false,
    criadoEm: "2025-01-15T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-15T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "cdmi4", grupoId: "g1", empresaId: "e1", filialId: "f1",
    modeloId: "cdm2", descricao: "FUNRURAL", tipo: "PERCENTUAL", valor: 1.5,
    ordemCalculo: 1, automatico: true,
    criadoEm: "2025-01-20T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-20T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "cdmi5", grupoId: "g1", empresaId: "e1", filialId: "f1",
    modeloId: "cdm2", descricao: "Desconto Armazenagem", tipo: "VALOR_FIXO", valor: 3.50,
    ordemCalculo: 2, automatico: false,
    criadoEm: "2025-01-20T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-20T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "cdmi6", grupoId: "g1", empresaId: "e1", filialId: "f1",
    modeloId: "cdm2", descricao: "Prêmio Qualidade", tipo: "PERCENTUAL", valor: 0.5,
    ordemCalculo: 3, automatico: false,
    criadoEm: "2025-01-20T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-20T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const contratoCondicoes: ContratoCondicao[] = [];

// ---- Classificação de Grãos ----
export type UnidadeClassificacao = "PERCENTUAL" | "KG" | "GRAMAS";

export interface ClassificacaoTipo {
  id: string;
  grupoId: string;
  empresaId: string;
  filialId: string;
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
    id: "ct1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    descricao: "Umidade", unidade: "PERCENTUAL", valorBase: 14, ativo: true,
    criadoEm: "2025-01-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "ct2", grupoId: "g1", empresaId: "e1", filialId: "f1",
    descricao: "Impureza", unidade: "PERCENTUAL", valorBase: 1, ativo: true,
    criadoEm: "2025-01-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "ct3", grupoId: "g1", empresaId: "e1", filialId: "f1",
    descricao: "Ardidos", unidade: "PERCENTUAL", valorBase: 8, ativo: true,
    criadoEm: "2025-01-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "ct4", grupoId: "g1", empresaId: "e1", filialId: "f1",
    descricao: "Quebrados", unidade: "PERCENTUAL", valorBase: null, ativo: true,
    criadoEm: "2025-01-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "ct5", grupoId: "g1", empresaId: "e1", filialId: "f1",
    descricao: "Avariados", unidade: "PERCENTUAL", valorBase: null, ativo: true,
    criadoEm: "2025-01-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const produtoClassificacoes: ProdutoClassificacao[] = [
  {
    id: "pc1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    produtoId: "prod1", classificacaoTipoId: "ct1",
    valorPadrao: 14, limiteTolerancia: 14, ativo: true,
    criadoEm: "2025-01-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "pc2", grupoId: "g1", empresaId: "e1", filialId: "f1",
    produtoId: "prod1", classificacaoTipoId: "ct2",
    valorPadrao: 1, limiteTolerancia: 1, ativo: true,
    criadoEm: "2025-01-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const classificacaoDescontos: ClassificacaoDesconto[] = [
  {
    id: "cd1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    produtoId: "prod1", classificacaoTipoId: "ct1",
    valorMinimo: 0, valorMaximo: 14, percentualDesconto: 0,
    criadoEm: "2025-01-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "cd2", grupoId: "g1", empresaId: "e1", filialId: "f1",
    produtoId: "prod1", classificacaoTipoId: "ct1",
    valorMinimo: 14, valorMaximo: 15, percentualDesconto: 1,
    criadoEm: "2025-01-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "cd3", grupoId: "g1", empresaId: "e1", filialId: "f1",
    produtoId: "prod1", classificacaoTipoId: "ct1",
    valorMinimo: 15, valorMaximo: 16, percentualDesconto: 2,
    criadoEm: "2025-01-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "cd4", grupoId: "g1", empresaId: "e1", filialId: "f1",
    produtoId: "prod1", classificacaoTipoId: "ct2",
    valorMinimo: 0, valorMaximo: 1, percentualDesconto: 0,
    criadoEm: "2025-01-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "cd5", grupoId: "g1", empresaId: "e1", filialId: "f1",
    produtoId: "prod1", classificacaoTipoId: "ct2",
    valorMinimo: 1, valorMaximo: 3, percentualDesconto: 0.5,
    criadoEm: "2025-01-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "cd6", grupoId: "g1", empresaId: "e1", filialId: "f1",
    produtoId: "prod1", classificacaoTipoId: "ct2",
    valorMinimo: 3, valorMaximo: 5, percentualDesconto: 1,
    criadoEm: "2025-01-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const romaneioClassificacoes: RomaneioClassificacao[] = [];

// ============================================================
// FINANCEIRO
// ============================================================

export type TipoConta = "PAGAR" | "RECEBER";
export type StatusConta = "ABERTO" | "PARCIAL" | "PAGO" | "CANCELADO";
export type OrigemConta = "MANUAL" | "CONTRATO" | "ROMANEIO" | "FIXACAO";
export type StatusParcela = "PENDENTE" | "PARCIAL" | "PAGO";
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
  status: StatusConta;
  origem: OrigemConta;
  documentoReferencia: string;
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
  dataVencimento: string;
  valorParcela: number;
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
    dataEmissao: "2025-01-10", valorTotal: 25000, status: "ABERTO",
    origem: "MANUAL", documentoReferencia: "NF-001234", observacoes: "",
    criadoEm: "2025-01-10T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-10T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "fc2", grupoId: "g1", empresaId: "e1", filialId: "f1",
    tipo: "RECEBER", pessoaId: "p1", descricao: "Venda de soja safra 2025",
    dataEmissao: "2025-02-01", valorTotal: 180000, status: "PARCIAL",
    origem: "MANUAL", documentoReferencia: "CT-0001", observacoes: "Referente contrato de venda",
    criadoEm: "2025-02-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-02-15T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "fc3", grupoId: "g1", empresaId: "e1", filialId: "f1",
    tipo: "PAGAR", pessoaId: "p1", descricao: "Frete transporte grãos",
    dataEmissao: "2025-01-20", valorTotal: 8500, status: "PAGO",
    origem: "MANUAL", documentoReferencia: "CTE-5678", observacoes: "",
    criadoEm: "2025-01-20T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-02-20T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const financeiroParcelas: FinanceiroParcela[] = [
  {
    id: "fp1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    contaId: "fc1", numeroParcela: 1, dataVencimento: "2025-02-10",
    valorParcela: 12500, valorPago: 0, saldoParcela: 12500, status: "PENDENTE",
    criadoEm: "2025-01-10T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-10T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "fp2", grupoId: "g1", empresaId: "e1", filialId: "f1",
    contaId: "fc1", numeroParcela: 2, dataVencimento: "2025-03-10",
    valorParcela: 12500, valorPago: 0, saldoParcela: 12500, status: "PENDENTE",
    criadoEm: "2025-01-10T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-01-10T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "fp3", grupoId: "g1", empresaId: "e1", filialId: "f1",
    contaId: "fc2", numeroParcela: 1, dataVencimento: "2025-03-01",
    valorParcela: 60000, valorPago: 60000, saldoParcela: 0, status: "PAGO",
    criadoEm: "2025-02-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-03-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "fp4", grupoId: "g1", empresaId: "e1", filialId: "f1",
    contaId: "fc2", numeroParcela: 2, dataVencimento: "2025-04-01",
    valorParcela: 60000, valorPago: 0, saldoParcela: 60000, status: "PENDENTE",
    criadoEm: "2025-02-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-02-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "fp5", grupoId: "g1", empresaId: "e1", filialId: "f1",
    contaId: "fc2", numeroParcela: 3, dataVencimento: "2025-05-01",
    valorParcela: 60000, valorPago: 0, saldoParcela: 60000, status: "PENDENTE",
    criadoEm: "2025-02-01T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-02-01T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "fp6", grupoId: "g1", empresaId: "e1", filialId: "f1",
    contaId: "fc3", numeroParcela: 1, dataVencimento: "2025-02-20",
    valorParcela: 8500, valorPago: 8500, saldoParcela: 0, status: "PAGO",
    criadoEm: "2025-01-20T08:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-02-20T08:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];

export const financeiroBaixas: FinanceiroBaixa[] = [
  {
    id: "fb1", grupoId: "g1", empresaId: "e1", filialId: "f1",
    parcelaId: "fp3", dataPagamento: "2025-03-01T10:00:00Z",
    valorPago: 60000, formaPagamento: "TRANSFERENCIA", observacoes: "Pagamento via TED",
    criadoEm: "2025-03-01T10:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-03-01T10:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
  {
    id: "fb2", grupoId: "g1", empresaId: "e1", filialId: "f1",
    parcelaId: "fp6", dataPagamento: "2025-02-20T14:00:00Z",
    valorPago: 8500, formaPagamento: "PIX", observacoes: "",
    criadoEm: "2025-02-20T14:00:00Z", criadoPor: "u1",
    atualizadoEm: "2025-02-20T14:00:00Z", atualizadoPor: "u1",
    deletadoEm: null, deletadoPor: null,
  },
];
