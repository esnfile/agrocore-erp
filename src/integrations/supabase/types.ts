export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      autorizacoes_log: {
        Row: {
          acao: string
          criado_em: string
          descricao: string
          empresa_id: string | null
          filial_id: string | null
          grupo_id: string | null
          id: string
          justificativa: string
          registro_id: string
          registro_tipo: string
          resultado: string
          usuario_id: string
          usuario_nome: string
        }
        Insert: {
          acao: string
          criado_em?: string
          descricao?: string
          empresa_id?: string | null
          filial_id?: string | null
          grupo_id?: string | null
          id?: string
          justificativa?: string
          registro_id?: string
          registro_tipo?: string
          resultado: string
          usuario_id: string
          usuario_nome?: string
        }
        Update: {
          acao?: string
          criado_em?: string
          descricao?: string
          empresa_id?: string | null
          filial_id?: string | null
          grupo_id?: string | null
          id?: string
          justificativa?: string
          registro_id?: string
          registro_tipo?: string
          resultado?: string
          usuario_id?: string
          usuario_nome?: string
        }
        Relationships: []
      }
      caixa_lancamentos: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          autorizacao_log_id: string | null
          categoria: string
          conta_pagar_id: string | null
          conta_receber_id: string | null
          criado_em: string
          criado_por: string | null
          data_lancamento: string
          deletado_em: string | null
          deletado_por: string | null
          descricao: string
          empresa_id: string
          filial_id: string
          forma_pagamento: string | null
          grupo_id: string
          id: string
          pessoa_id: string | null
          tipo_lancamento_id: string | null
          tipo_movimento: string
          valor: number
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          autorizacao_log_id?: string | null
          categoria?: string
          conta_pagar_id?: string | null
          conta_receber_id?: string | null
          criado_em?: string
          criado_por?: string | null
          data_lancamento: string
          deletado_em?: string | null
          deletado_por?: string | null
          descricao: string
          empresa_id: string
          filial_id: string
          forma_pagamento?: string | null
          grupo_id: string
          id?: string
          pessoa_id?: string | null
          tipo_lancamento_id?: string | null
          tipo_movimento: string
          valor: number
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          autorizacao_log_id?: string | null
          categoria?: string
          conta_pagar_id?: string | null
          conta_receber_id?: string | null
          criado_em?: string
          criado_por?: string | null
          data_lancamento?: string
          deletado_em?: string | null
          deletado_por?: string | null
          descricao?: string
          empresa_id?: string
          filial_id?: string
          forma_pagamento?: string | null
          grupo_id?: string
          id?: string
          pessoa_id?: string | null
          tipo_lancamento_id?: string | null
          tipo_movimento?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "caixa_lancamentos_conta_pagar_id_fkey"
            columns: ["conta_pagar_id"]
            isOneToOne: false
            referencedRelation: "contas_pagar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caixa_lancamentos_conta_receber_id_fkey"
            columns: ["conta_receber_id"]
            isOneToOne: false
            referencedRelation: "contas_receber"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caixa_lancamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caixa_lancamentos_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caixa_lancamentos_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caixa_lancamentos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caixa_lancamentos_tipo_lancamento_id_fkey"
            columns: ["tipo_lancamento_id"]
            isOneToOne: false
            referencedRelation: "tipos_lancamento"
            referencedColumns: ["id"]
          },
        ]
      }
      centros_custo: {
        Row: {
          ativo: boolean
          atualizado_em: string
          atualizado_por: string | null
          codigo: string
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          descricao: string
          grupo_id: string
          id: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          codigo: string
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          descricao: string
          grupo_id: string
          id?: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          codigo?: string
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          descricao?: string
          grupo_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "centros_custo_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      condicoes_descontos: {
        Row: {
          ativo: boolean
          atualizado_em: string
          atualizado_por: string | null
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          descricao: string
          grupo_id: string
          id: string
          ordem_aplicacao: number
          produto_id: string | null
          tipo: string
          valor_padrao: number
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          descricao: string
          grupo_id: string
          id?: string
          ordem_aplicacao?: number
          produto_id?: string | null
          tipo: string
          valor_padrao?: number
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          descricao?: string
          grupo_id?: string
          id?: string
          ordem_aplicacao?: number
          produto_id?: string | null
          tipo?: string
          valor_padrao?: number
        }
        Relationships: [
          {
            foreignKeyName: "condicoes_descontos_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "condicoes_descontos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_pagar: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          centro_custo_id: string | null
          contrato_id: string | null
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          descricao: string
          documento: string | null
          empresa_id: string
          filial_id: string
          fixacao_id: string | null
          grupo_id: string
          id: string
          liquidacao_id: string | null
          numero_parcela: number
          pessoa_id: string | null
          plano_conta_id: string | null
          status: string
          tipo_especial: string | null
          valor: number
          valor_pago: number
          vencimento: string
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          centro_custo_id?: string | null
          contrato_id?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          descricao: string
          documento?: string | null
          empresa_id: string
          filial_id: string
          fixacao_id?: string | null
          grupo_id: string
          id?: string
          liquidacao_id?: string | null
          numero_parcela?: number
          pessoa_id?: string | null
          plano_conta_id?: string | null
          status?: string
          tipo_especial?: string | null
          valor: number
          valor_pago?: number
          vencimento: string
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          centro_custo_id?: string | null
          contrato_id?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          descricao?: string
          documento?: string | null
          empresa_id?: string
          filial_id?: string
          fixacao_id?: string | null
          grupo_id?: string
          id?: string
          liquidacao_id?: string | null
          numero_parcela?: number
          pessoa_id?: string | null
          plano_conta_id?: string | null
          status?: string
          tipo_especial?: string | null
          valor?: number
          valor_pago?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "contas_pagar_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_fixacao_id_fkey"
            columns: ["fixacao_id"]
            isOneToOne: false
            referencedRelation: "fixacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_liquidacao_id_fkey"
            columns: ["liquidacao_id"]
            isOneToOne: false
            referencedRelation: "liquidacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_plano_conta_id_fkey"
            columns: ["plano_conta_id"]
            isOneToOne: false
            referencedRelation: "plano_contas"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_receber: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          centro_custo_id: string | null
          contrato_id: string | null
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          descricao: string
          documento: string | null
          empresa_id: string
          filial_id: string
          fixacao_id: string | null
          grupo_id: string
          id: string
          liquidacao_id: string | null
          numero_parcela: number
          pessoa_id: string | null
          plano_conta_id: string | null
          status: string
          tipo_especial: string | null
          valor: number
          valor_pago: number
          vencimento: string
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          centro_custo_id?: string | null
          contrato_id?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          descricao: string
          documento?: string | null
          empresa_id: string
          filial_id: string
          fixacao_id?: string | null
          grupo_id: string
          id?: string
          liquidacao_id?: string | null
          numero_parcela?: number
          pessoa_id?: string | null
          plano_conta_id?: string | null
          status?: string
          tipo_especial?: string | null
          valor: number
          valor_pago?: number
          vencimento: string
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          centro_custo_id?: string | null
          contrato_id?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          descricao?: string
          documento?: string | null
          empresa_id?: string
          filial_id?: string
          fixacao_id?: string | null
          grupo_id?: string
          id?: string
          liquidacao_id?: string | null
          numero_parcela?: number
          pessoa_id?: string | null
          plano_conta_id?: string | null
          status?: string
          tipo_especial?: string | null
          valor?: number
          valor_pago?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "contas_receber_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_fixacao_id_fkey"
            columns: ["fixacao_id"]
            isOneToOne: false
            referencedRelation: "fixacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_liquidacao_id_fkey"
            columns: ["liquidacao_id"]
            isOneToOne: false
            referencedRelation: "liquidacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_plano_conta_id_fkey"
            columns: ["plano_conta_id"]
            isOneToOne: false
            referencedRelation: "plano_contas"
            referencedColumns: ["id"]
          },
        ]
      }
      contrato_itens: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          contrato_id: string
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          empresa_id: string
          entregue_base_cache: number
          fator_base: number
          filial_id: string
          grupo_id: string
          id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          quantidade_base: number | null
          unidade_codigo: string
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          contrato_id: string
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id: string
          entregue_base_cache?: number
          fator_base: number
          filial_id: string
          grupo_id: string
          id?: string
          preco_unitario?: number
          produto_id: string
          quantidade: number
          quantidade_base?: number | null
          unidade_codigo: string
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          contrato_id?: string
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id?: string
          entregue_base_cache?: number
          fator_base?: number
          filial_id?: string
          grupo_id?: string
          id?: string
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
          quantidade_base?: number | null
          unidade_codigo?: string
        }
        Relationships: [
          {
            foreignKeyName: "contrato_itens_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contrato_itens_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contrato_itens_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contrato_itens_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contrato_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          criado_em: string
          criado_por: string | null
          data_contrato: string
          data_entrega_fim: string | null
          data_entrega_inicio: string | null
          deletado_em: string | null
          deletado_por: string | null
          empresa_id: string
          filial_id: string
          grupo_id: string
          id: string
          modalidade_preco: string
          moeda_id: string | null
          numero_contrato: string
          observacao: string | null
          pessoa_id: string
          safra_id: string | null
          status: string
          tipo_contrato: string
          tolerancia_pct: number
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          data_contrato: string
          data_entrega_fim?: string | null
          data_entrega_inicio?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id: string
          filial_id: string
          grupo_id: string
          id?: string
          modalidade_preco?: string
          moeda_id?: string | null
          numero_contrato: string
          observacao?: string | null
          pessoa_id: string
          safra_id?: string | null
          status?: string
          tipo_contrato: string
          tolerancia_pct?: number
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          data_contrato?: string
          data_entrega_fim?: string | null
          data_entrega_inicio?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id?: string
          filial_id?: string
          grupo_id?: string
          id?: string
          modalidade_preco?: string
          moeda_id?: string | null
          numero_contrato?: string
          observacao?: string | null
          pessoa_id?: string
          safra_id?: string | null
          status?: string
          tipo_contrato?: string
          tolerancia_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_moeda_id_fkey"
            columns: ["moeda_id"]
            isOneToOne: false
            referencedRelation: "moedas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_safra_id_fkey"
            columns: ["safra_id"]
            isOneToOne: false
            referencedRelation: "safras"
            referencedColumns: ["id"]
          },
        ]
      }
      cotacoes: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          criado_em: string
          criado_por: string | null
          data_cotacao: string
          deletado_em: string | null
          deletado_por: string | null
          grupo_id: string
          id: string
          moeda_id: string
          valor: number
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          data_cotacao: string
          deletado_em?: string | null
          deletado_por?: string | null
          grupo_id: string
          id?: string
          moeda_id: string
          valor: number
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          data_cotacao?: string
          deletado_em?: string | null
          deletado_por?: string | null
          grupo_id?: string
          id?: string
          moeda_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "cotacoes_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_moeda_id_fkey"
            columns: ["moeda_id"]
            isOneToOne: false
            referencedRelation: "moedas"
            referencedColumns: ["id"]
          },
        ]
      }
      cultivos: {
        Row: {
          area_plantada_ha: number
          atualizado_em: string
          atualizado_por: string | null
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          empresa_id: string
          filial_id: string
          grupo_id: string
          id: string
          produtividade_estimada_kg_ha: number
          produto_id: string
          safra_id: string
          status_colheita: string
        }
        Insert: {
          area_plantada_ha?: number
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id: string
          filial_id: string
          grupo_id: string
          id?: string
          produtividade_estimada_kg_ha?: number
          produto_id: string
          safra_id: string
          status_colheita?: string
        }
        Update: {
          area_plantada_ha?: number
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id?: string
          filial_id?: string
          grupo_id?: string
          id?: string
          produtividade_estimada_kg_ha?: number
          produto_id?: string
          safra_id?: string
          status_colheita?: string
        }
        Relationships: [
          {
            foreignKeyName: "cultivos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultivos_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultivos_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultivos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultivos_safra_id_fkey"
            columns: ["safra_id"]
            isOneToOne: false
            referencedRelation: "safras"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          ativo: boolean
          atualizado_em: string
          atualizado_por: string | null
          cpf_cnpj: string
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          grupo_id: string
          id: string
          nome_razao: string
          tipo_empresa: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          cpf_cnpj: string
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          grupo_id: string
          id?: string
          nome_razao: string
          tipo_empresa?: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          cpf_cnpj?: string
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          grupo_id?: string
          id?: string
          nome_razao?: string
          tipo_empresa?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresas_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      filiais: {
        Row: {
          ativo: boolean
          atualizado_em: string
          atualizado_por: string | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          cpf_cnpj: string | null
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          empresa_id: string
          endereco: string | null
          estado: string | null
          grupo_id: string
          id: string
          inscricao_estadual: string | null
          nome_razao: string
          numero_km: string | null
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id: string
          endereco?: string | null
          estado?: string | null
          grupo_id: string
          id?: string
          inscricao_estadual?: string | null
          nome_razao: string
          numero_km?: string | null
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id?: string
          endereco?: string | null
          estado?: string | null
          grupo_id?: string
          id?: string
          inscricao_estadual?: string | null
          nome_razao?: string
          numero_km?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "filiais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filiais_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      fixacoes: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          contrato_item_id: string
          criado_em: string
          criado_por: string | null
          data_fixacao: string
          deletado_em: string | null
          deletado_por: string | null
          empresa_id: string
          filial_id: string
          grupo_id: string
          id: string
          preco_fixado: number
          quantidade: number
          status: string
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          contrato_item_id: string
          criado_em?: string
          criado_por?: string | null
          data_fixacao: string
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id: string
          filial_id: string
          grupo_id: string
          id?: string
          preco_fixado: number
          quantidade: number
          status?: string
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          contrato_item_id?: string
          criado_em?: string
          criado_por?: string | null
          data_fixacao?: string
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id?: string
          filial_id?: string
          grupo_id?: string
          id?: string
          preco_fixado?: number
          quantidade?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixacoes_contrato_item_id_fkey"
            columns: ["contrato_item_id"]
            isOneToOne: false
            referencedRelation: "contrato_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixacoes_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixacoes_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      gersys_modulos: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          id: string
          nivel: string
          nome: string
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          id?: string
          nivel: string
          nome: string
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          id?: string
          nivel?: string
          nome?: string
        }
        Relationships: []
      }
      gersys_programas: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          gersys_submodulos_id: string
          id: string
          nivel: string
          nome: string
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          gersys_submodulos_id: string
          id?: string
          nivel: string
          nome: string
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          gersys_submodulos_id?: string
          id?: string
          nivel?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "gersys_programas_gersys_submodulos_id_fkey"
            columns: ["gersys_submodulos_id"]
            isOneToOne: false
            referencedRelation: "gersys_submodulos"
            referencedColumns: ["id"]
          },
        ]
      }
      gersys_submodulos: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          gersys_modulos_id: string
          id: string
          nivel: string
          nome: string
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          gersys_modulos_id: string
          id?: string
          nivel: string
          nome: string
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          gersys_modulos_id?: string
          id?: string
          nivel?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "gersys_submodulos_gersys_modulos_id_fkey"
            columns: ["gersys_modulos_id"]
            isOneToOne: false
            referencedRelation: "gersys_modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      grupos: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          id: string
          nome: string
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          id?: string
          nome: string
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      liquidacoes: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          contrato_item_id: string
          criado_em: string
          criado_por: string | null
          data_liquidacao: string
          deletado_em: string | null
          deletado_por: string | null
          empresa_id: string
          filial_id: string
          grupo_id: string
          id: string
          justificativa: string | null
          quantidade_base: number
          status: string
          valor_bruto: number
          valor_liquido: number
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          contrato_item_id: string
          criado_em?: string
          criado_por?: string | null
          data_liquidacao: string
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id: string
          filial_id: string
          grupo_id: string
          id?: string
          justificativa?: string | null
          quantidade_base: number
          status?: string
          valor_bruto: number
          valor_liquido: number
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          contrato_item_id?: string
          criado_em?: string
          criado_por?: string | null
          data_liquidacao?: string
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id?: string
          filial_id?: string
          grupo_id?: string
          id?: string
          justificativa?: string | null
          quantidade_base?: number
          status?: string
          valor_bruto?: number
          valor_liquido?: number
        }
        Relationships: [
          {
            foreignKeyName: "liquidacoes_contrato_item_id_fkey"
            columns: ["contrato_item_id"]
            isOneToOne: false
            referencedRelation: "contrato_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liquidacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liquidacoes_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liquidacoes_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      moedas: {
        Row: {
          ativo: boolean
          atualizado_em: string
          atualizado_por: string | null
          codigo: string
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          descricao: string
          grupo_id: string
          id: string
          simbolo: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          codigo: string
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          descricao: string
          grupo_id: string
          id?: string
          simbolo: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          codigo?: string
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          descricao?: string
          grupo_id?: string
          id?: string
          simbolo?: string
        }
        Relationships: [
          {
            foreignKeyName: "moedas_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes_estoque: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          criado_em: string
          criado_por: string | null
          data_movimento: string
          deletado_em: string | null
          deletado_por: string | null
          empresa_id: string
          filial_id: string
          grupo_id: string
          id: string
          observacao: string | null
          produto_id: string
          quantidade_base: number
          romaneio_id: string | null
          tipo: string
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          data_movimento?: string
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id: string
          filial_id: string
          grupo_id: string
          id?: string
          observacao?: string | null
          produto_id: string
          quantidade_base: number
          romaneio_id?: string | null
          tipo: string
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          data_movimento?: string
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id?: string
          filial_id?: string
          grupo_id?: string
          id?: string
          observacao?: string | null
          produto_id?: string
          quantidade_base?: number
          romaneio_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_estoque_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_romaneio_id_fkey"
            columns: ["romaneio_id"]
            isOneToOne: false
            referencedRelation: "romaneios"
            referencedColumns: ["id"]
          },
        ]
      }
      permissoes: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          codigo: string
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          gersys_programas_id: string
          id: string
          nome: string
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          codigo: string
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          gersys_programas_id: string
          id?: string
          nome: string
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          codigo?: string
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          gersys_programas_id?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "permissoes_gersys_programas_id_fkey"
            columns: ["gersys_programas_id"]
            isOneToOne: false
            referencedRelation: "gersys_programas"
            referencedColumns: ["id"]
          },
        ]
      }
      pessoas: {
        Row: {
          ativo: boolean
          atualizado_em: string
          atualizado_por: string | null
          cidade: string | null
          cpf_cnpj: string | null
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          eh_motorista: boolean
          email: string | null
          estado: string | null
          grupo_id: string
          id: string
          inscricao_estadual: string | null
          nome_razao: string
          relacao_comercial: string
          telefone: string | null
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          eh_motorista?: boolean
          email?: string | null
          estado?: string | null
          grupo_id: string
          id?: string
          inscricao_estadual?: string | null
          nome_razao: string
          relacao_comercial?: string
          telefone?: string | null
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          eh_motorista?: boolean
          email?: string | null
          estado?: string | null
          grupo_id?: string
          id?: string
          inscricao_estadual?: string | null
          nome_razao?: string
          relacao_comercial?: string
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pessoas_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_contas: {
        Row: {
          ativo: boolean
          atualizado_em: string
          atualizado_por: string | null
          codigo: string
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          descricao: string
          grupo_id: string
          id: string
          tipo: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          codigo: string
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          descricao: string
          grupo_id: string
          id?: string
          tipo?: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          codigo?: string
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          descricao?: string
          grupo_id?: string
          id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "plano_contas_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      produto_unidades: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          fator_base: number
          grupo_id: string
          id: string
          produto_id: string
          unidade_codigo: string
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          fator_base: number
          grupo_id: string
          id?: string
          produto_id: string
          unidade_codigo: string
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          fator_base?: number
          grupo_id?: string
          id?: string
          produto_id?: string
          unidade_codigo?: string
        }
        Relationships: [
          {
            foreignKeyName: "produto_unidades_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_unidades_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean
          atualizado_em: string
          atualizado_por: string | null
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          descricao: string
          eh_grao: boolean
          grupo_id: string
          id: string
          tipo_unidade: string
          unidade_base: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          descricao: string
          eh_grao?: boolean
          grupo_id: string
          id?: string
          tipo_unidade?: string
          unidade_base?: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          descricao?: string
          eh_grao?: boolean
          grupo_id?: string
          id?: string
          tipo_unidade?: string
          unidade_base?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean
          atualizado_em: string
          criado_em: string
          email: string
          empresa_id: string
          empresas_permitidas: string[]
          filiais_permitidas: string[]
          filial_id: string
          grupo_id: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          email?: string
          empresa_id?: string
          empresas_permitidas?: string[]
          filiais_permitidas?: string[]
          filial_id?: string
          grupo_id?: string
          id: string
          nome?: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          email?: string
          empresa_id?: string
          empresas_permitidas?: string[]
          filiais_permitidas?: string[]
          filial_id?: string
          grupo_id?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      romaneio_classificacao: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          empresa_id: string
          filial_id: string
          grupo_id: string
          id: string
          percentual_desconto: number
          percentual_medido: number
          peso_descontado_kg: number
          romaneio_id: string
          tipo_classificacao: string
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id: string
          filial_id: string
          grupo_id: string
          id?: string
          percentual_desconto?: number
          percentual_medido?: number
          peso_descontado_kg?: number
          romaneio_id: string
          tipo_classificacao: string
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id?: string
          filial_id?: string
          grupo_id?: string
          id?: string
          percentual_desconto?: number
          percentual_medido?: number
          peso_descontado_kg?: number
          romaneio_id?: string
          tipo_classificacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "romaneio_classificacao_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "romaneio_classificacao_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "romaneio_classificacao_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "romaneio_classificacao_romaneio_id_fkey"
            columns: ["romaneio_id"]
            isOneToOne: false
            referencedRelation: "romaneios"
            referencedColumns: ["id"]
          },
        ]
      }
      romaneio_pesagens: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          criado_em: string
          criado_por: string | null
          data_hora: string
          deletado_em: string | null
          deletado_por: string | null
          empresa_id: string
          filial_id: string
          grupo_id: string
          id: string
          peso_kg: number
          romaneio_id: string
          sequencia: number
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          data_hora?: string
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id: string
          filial_id: string
          grupo_id: string
          id?: string
          peso_kg: number
          romaneio_id: string
          sequencia: number
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          data_hora?: string
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id?: string
          filial_id?: string
          grupo_id?: string
          id?: string
          peso_kg?: number
          romaneio_id?: string
          sequencia?: number
        }
        Relationships: [
          {
            foreignKeyName: "romaneio_pesagens_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "romaneio_pesagens_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "romaneio_pesagens_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "romaneio_pesagens_romaneio_id_fkey"
            columns: ["romaneio_id"]
            isOneToOne: false
            referencedRelation: "romaneios"
            referencedColumns: ["id"]
          },
        ]
      }
      romaneios: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          cancelamento_justificativa: string | null
          contrato_item_id: string | null
          criado_em: string
          criado_por: string | null
          cultivo_id: string | null
          data_romaneio: string
          deletado_em: string | null
          deletado_por: string | null
          empresa_id: string
          estornado_em: string | null
          estornado_por: string | null
          estorno_justificativa: string | null
          filial_id: string
          finalizado_em: string | null
          finalizado_por: string | null
          grupo_id: string
          id: string
          motorista_nome: string | null
          numero: number
          observacao: string | null
          origem_criacao: string
          peso_bruto: number
          peso_liquido: number
          peso_liquido_seco_limpo: number
          peso_tara: number
          pessoa_id: string | null
          placa: string | null
          produto_id: string
          status: string
          tipo_operacao: string
          total_peso_descontado: number
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          cancelamento_justificativa?: string | null
          contrato_item_id?: string | null
          criado_em?: string
          criado_por?: string | null
          cultivo_id?: string | null
          data_romaneio?: string
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id: string
          estornado_em?: string | null
          estornado_por?: string | null
          estorno_justificativa?: string | null
          filial_id: string
          finalizado_em?: string | null
          finalizado_por?: string | null
          grupo_id: string
          id?: string
          motorista_nome?: string | null
          numero: number
          observacao?: string | null
          origem_criacao?: string
          peso_bruto?: number
          peso_liquido?: number
          peso_liquido_seco_limpo?: number
          peso_tara?: number
          pessoa_id?: string | null
          placa?: string | null
          produto_id: string
          status?: string
          tipo_operacao: string
          total_peso_descontado?: number
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          cancelamento_justificativa?: string | null
          contrato_item_id?: string | null
          criado_em?: string
          criado_por?: string | null
          cultivo_id?: string | null
          data_romaneio?: string
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id?: string
          estornado_em?: string | null
          estornado_por?: string | null
          estorno_justificativa?: string | null
          filial_id?: string
          finalizado_em?: string | null
          finalizado_por?: string | null
          grupo_id?: string
          id?: string
          motorista_nome?: string | null
          numero?: number
          observacao?: string | null
          origem_criacao?: string
          peso_bruto?: number
          peso_liquido?: number
          peso_liquido_seco_limpo?: number
          peso_tara?: number
          pessoa_id?: string | null
          placa?: string | null
          produto_id?: string
          status?: string
          tipo_operacao?: string
          total_peso_descontado?: number
        }
        Relationships: [
          {
            foreignKeyName: "romaneios_contrato_item_id_fkey"
            columns: ["contrato_item_id"]
            isOneToOne: false
            referencedRelation: "contrato_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "romaneios_cultivo_id_fkey"
            columns: ["cultivo_id"]
            isOneToOne: false
            referencedRelation: "cultivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "romaneios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "romaneios_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "romaneios_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "romaneios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "romaneios_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      safras: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          criado_em: string
          criado_por: string | null
          data_fim: string
          data_inicio: string
          deletado_em: string | null
          deletado_por: string | null
          descricao: string
          empresa_id: string
          filial_id: string
          grupo_id: string
          id: string
          status: string
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          data_fim: string
          data_inicio: string
          deletado_em?: string | null
          deletado_por?: string | null
          descricao: string
          empresa_id: string
          filial_id: string
          grupo_id: string
          id?: string
          status?: string
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          data_fim?: string
          data_inicio?: string
          deletado_em?: string | null
          deletado_por?: string | null
          descricao?: string
          empresa_id?: string
          filial_id?: string
          grupo_id?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "safras_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safras_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safras_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      saldos_estoque: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          empresa_id: string
          filial_id: string
          grupo_id: string
          id: string
          produto_id: string
          saldo_base_cache: number
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id: string
          filial_id: string
          grupo_id: string
          id?: string
          produto_id: string
          saldo_base_cache?: number
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id?: string
          filial_id?: string
          grupo_id?: string
          id?: string
          produto_id?: string
          saldo_base_cache?: number
        }
        Relationships: [
          {
            foreignKeyName: "saldos_estoque_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saldos_estoque_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saldos_estoque_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saldos_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_lancamento: {
        Row: {
          ativo: boolean
          atualizado_em: string
          atualizado_por: string | null
          categoria: string | null
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          descricao: string
          grupo_id: string
          id: string
          tipo_movimento: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          categoria?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          descricao: string
          grupo_id: string
          id?: string
          tipo_movimento: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          categoria?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          descricao?: string
          grupo_id?: string
          id?: string
          tipo_movimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "tipos_lancamento_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades_medida: {
        Row: {
          ativo: boolean
          atualizado_em: string
          atualizado_por: string | null
          codigo: string
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          descricao: string
          fator_universal_base: number | null
          grupo_id: string
          id: string
          tipo: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          codigo: string
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          descricao: string
          fator_universal_base?: number | null
          grupo_id: string
          id?: string
          tipo: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          codigo?: string
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          descricao?: string
          fator_universal_base?: number | null
          grupo_id?: string
          id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "unidades_medida_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          criado_em: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          criado_em?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          criado_em?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      usuario_filiais: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          empresa_id: string
          filial_id: string
          id: string
          usuario_id: string
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id: string
          filial_id: string
          id?: string
          usuario_id: string
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          empresa_id?: string
          filial_id?: string
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_filiais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_filiais_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_filiais_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuario_permissoes: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          id: string
          permissao_id: string
          usuario_id: string
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          id?: string
          permissao_id: string
          usuario_id: string
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          id?: string
          permissao_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_permissoes_permissao_id_fkey"
            columns: ["permissao_id"]
            isOneToOne: false
            referencedRelation: "permissoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_permissoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          ativo: boolean
          atualizado_em: string
          atualizado_por: string | null
          auth_user_id: string
          criado_em: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          email: string
          empresa_padrao_id: string | null
          filial_padrao_id: string | null
          grupo_id: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          auth_user_id: string
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          email: string
          empresa_padrao_id?: string | null
          filial_padrao_id?: string | null
          grupo_id: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          auth_user_id?: string
          criado_em?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          email?: string
          empresa_padrao_id?: string | null
          filial_padrao_id?: string | null
          grupo_id?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_empresa_padrao_id_fkey"
            columns: ["empresa_padrao_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_filial_padrao_id_fkey"
            columns: ["filial_padrao_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calc_tolerancia: {
        Args: {
          _entregue_kg: number
          _fator: number
          _peso_kg: number
          _tolerancia_pct: number
          _total_kg: number
        }
        Returns: {
          excesso_kg: number
          excesso_neg: number
          limite_kg: number
          limite_neg: number
          saldo_final_kg: number
          saldo_kg: number
          status: string
        }[]
      }
      eh_admin: { Args: never; Returns: boolean }
      entregue_verdade_item: { Args: { _item_id: string }; Returns: number }
      estornar_romaneio: {
        Args: { _justificativa: string; _romaneio_id: string }
        Returns: Json
      }
      fator_base: {
        Args: { _produto_id: string; _unidade: string }
        Returns: number
      }
      finalizar_romaneio: { Args: { _romaneio_id: string }; Returns: Json }
      fmt_qtd: { Args: { _un: string; _v: number }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      pode_acessar_filial: { Args: { _filial_id: string }; Returns: boolean }
      pode_gravar: { Args: never; Returns: boolean }
      reconciliar_saldos_contratos: {
        Args: never
        Returns: {
          cache_base: number
          contrato_item_id: string
          diferenca: number
          numero_contrato: string
          verdade_base: number
        }[]
      }
      reconciliar_saldos_estoque: {
        Args: never
        Returns: {
          cache_base: number
          diferenca: number
          filial_id: string
          produto_id: string
          verdade_base: number
        }[]
      }
      usuario_grupo_id: { Args: never; Returns: string }
      usuario_id_atual: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "ADMINISTRADOR" | "OPERADOR" | "CONSULTA"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["ADMINISTRADOR", "OPERADOR", "CONSULTA"],
    },
  },
} as const
