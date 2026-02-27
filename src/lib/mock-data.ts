// ============================================================
// AgroERP — Mock Data Layer
// ============================================================

export interface Grupo {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Empresa {
  id: string;
  grupoId: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  email: string;
  telefone: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Filial {
  id: string;
  empresaId: string;
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  uf: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  avatar?: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

// ---- Grupos ----
export const grupos: Grupo[] = [
  {
    id: "g1",
    nome: "Grupo Agro Sul",
    descricao: "Holding agroindustrial da região sul",
    ativo: true,
    criadoEm: "2024-01-15T10:00:00Z",
    atualizadoEm: "2024-06-01T14:30:00Z",
  },
];

// ---- Empresas ----
export const empresas: Empresa[] = [
  {
    id: "e1",
    grupoId: "g1",
    razaoSocial: "Fazenda Boa Vista Ltda",
    nomeFantasia: "Fazenda Boa Vista",
    cnpj: "12.345.678/0001-90",
    inscricaoEstadual: "123.456.789",
    email: "contato@boavista.agro",
    telefone: "(44) 3333-1111",
    ativo: true,
    criadoEm: "2024-01-20T08:00:00Z",
    atualizadoEm: "2024-07-10T09:00:00Z",
  },
  {
    id: "e2",
    grupoId: "g1",
    razaoSocial: "Armazéns Campo Verde S/A",
    nomeFantasia: "Campo Verde Armazéns",
    cnpj: "98.765.432/0001-10",
    inscricaoEstadual: "987.654.321",
    email: "contato@campoverde.agro",
    telefone: "(44) 3333-2222",
    ativo: true,
    criadoEm: "2024-02-10T08:00:00Z",
    atualizadoEm: "2024-08-05T11:00:00Z",
  },
];

// ---- Filiais ----
export const filiais: Filial[] = [
  {
    id: "f1",
    empresaId: "e1",
    nome: "Matriz — Maringá",
    cnpj: "12.345.678/0001-90",
    endereco: "Rod. PR-317 Km 12",
    cidade: "Maringá",
    uf: "PR",
    ativo: true,
    criadoEm: "2024-01-20T08:00:00Z",
    atualizadoEm: "2024-01-20T08:00:00Z",
  },
  {
    id: "f2",
    empresaId: "e1",
    nome: "Filial — Londrina",
    cnpj: "12.345.678/0002-71",
    endereco: "Rod. PR-445 Km 8",
    cidade: "Londrina",
    uf: "PR",
    ativo: true,
    criadoEm: "2024-03-01T08:00:00Z",
    atualizadoEm: "2024-03-01T08:00:00Z",
  },
  {
    id: "f3",
    empresaId: "e2",
    nome: "Unidade — Campo Mourão",
    cnpj: "98.765.432/0002-00",
    endereco: "Av. das Indústrias 500",
    cidade: "Campo Mourão",
    uf: "PR",
    ativo: true,
    criadoEm: "2024-02-15T08:00:00Z",
    atualizadoEm: "2024-02-15T08:00:00Z",
  },
];

// ---- Usuários ----
export const usuarios: Usuario[] = [
  {
    id: "u1",
    nome: "João Administrador",
    email: "joao@agroerp.com",
    ativo: true,
    criadoEm: "2024-01-01T08:00:00Z",
    atualizadoEm: "2024-01-01T08:00:00Z",
  },
];
