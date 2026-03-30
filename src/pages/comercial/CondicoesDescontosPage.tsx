import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

const mockModelos = [
  { id: "m1", nome: "Padrão Soja", descricao: "Descontos padrão para soja", itensCount: 3, ativo: true },
  { id: "m2", nome: "Padrão Milho", descricao: "Descontos padrão para milho", itensCount: 2, ativo: true },
  { id: "m3", nome: "Especial Parceiro", descricao: "Condições especiais", itensCount: 4, ativo: false },
];

const mockTiposDesconto = [
  { id: "t1", nome: "FUNRURAL", tipo: "percentual", ordemAplicacao: 1, ativo: true },
  { id: "t2", nome: "Taxa Administrativa", tipo: "percentual", ordemAplicacao: 2, ativo: true },
  { id: "t3", nome: "Armazenagem", tipo: "valor_fixo_unitario", ordemAplicacao: 3, ativo: true },
  { id: "t4", nome: "Frete Fixo", tipo: "valor_fixo_total", ordemAplicacao: 4, ativo: false },
];

const mockDescontosEmpresa = [
  { id: "de1", empresa: "Agro Norte Ltda", tipoDesconto: "FUNRURAL", valorPadrao: 1.5, ativo: true },
  { id: "de2", empresa: "Agro Norte Ltda", tipoDesconto: "Taxa Administrativa", valorPadrao: 0.8, ativo: true },
  { id: "de3", empresa: "Fazenda Boa Vista", tipoDesconto: "FUNRURAL", valorPadrao: 1.5, ativo: true },
  { id: "de4", empresa: "Fazenda Boa Vista", tipoDesconto: "Armazenagem", valorPadrao: 12.0, ativo: true },
];

const tipoLabel: Record<string, string> = {
  percentual: "Percentual (%)",
  valor_fixo_unitario: "Fixo / Ton",
  valor_fixo_total: "Fixo Total",
};

export default function CondicoesDescontosPage() {
  const [tab, setTab] = useState("modelos");

  return (
    <div className="space-y-6">
      <PageHeader title="Condições e Descontos" description="Gerencie modelos de condição, tipos de desconto e valores por empresa." />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="modelos">Modelos de Condição</TabsTrigger>
          <TabsTrigger value="tipos">Tipos de Desconto</TabsTrigger>
          <TabsTrigger value="empresa">Descontos por Empresa</TabsTrigger>
        </TabsList>

        <TabsContent value="modelos" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Modelo</Button>
          </div>
          <DataTable
            data={mockModelos}
            columns={[
              { key: "nome", header: "Nome" },
              { key: "descricao", header: "Descrição" },
              { key: "itensCount", header: "Itens" },
              { key: "ativo", header: "Status", render: (row) => (
                <Badge variant={row.ativo ? "default" : "secondary"}>{row.ativo ? "Ativo" : "Inativo"}</Badge>
              )},
            ]}
          />
        </TabsContent>

        <TabsContent value="tipos" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Tipo</Button>
          </div>
          <DataTable
            data={mockTiposDesconto}
            columns={[
              { key: "nome", header: "Nome" },
              { key: "tipo", header: "Tipo", render: (row) => tipoLabel[row.tipo] ?? row.tipo },
              { key: "ordemAplicacao", header: "Ordem" },
              { key: "ativo", header: "Status", render: (row) => (
                <Badge variant={row.ativo ? "default" : "secondary"}>{row.ativo ? "Ativo" : "Inativo"}</Badge>
              )},
            ]}
          />
        </TabsContent>

        <TabsContent value="empresa" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Desconto</Button>
          </div>
          <DataTable
            data={mockDescontosEmpresa}
            columns={[
              { key: "empresa", header: "Empresa" },
              { key: "tipoDesconto", header: "Tipo de Desconto" },
              { key: "valorPadrao", header: "Valor Padrão", render: (row) => row.valorPadrao.toFixed(2) },
              { key: "ativo", header: "Status", render: (row) => (
                <Badge variant={row.ativo ? "default" : "secondary"}>{row.ativo ? "Ativo" : "Inativo"}</Badge>
              )},
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
