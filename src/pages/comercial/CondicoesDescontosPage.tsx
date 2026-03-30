import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

/* ── Mock: Modelos de Condição ── */
const mockModelos = [
  { id: "m1", nome: "Padrão Soja", descricao: "Descontos padrão para soja", itensCount: 3, ativo: true },
  { id: "m2", nome: "Padrão Milho", descricao: "Descontos padrão para milho", itensCount: 2, ativo: true },
  { id: "m3", nome: "Especial Parceiro", descricao: "Condições especiais", itensCount: 4, ativo: false },
];

/* ── Mock: Tipos de Desconto ── */
const mockTiposDesconto = [
  { id: "t1", nome: "FUNRURAL", tipo: "percentual", ordemAplicacao: 1, ativo: true },
  { id: "t2", nome: "Taxa Administrativa", tipo: "percentual", ordemAplicacao: 2, ativo: true },
  { id: "t3", nome: "Armazenagem", tipo: "valor_fixo_unitario", ordemAplicacao: 3, ativo: true },
  { id: "t4", nome: "Frete Fixo", tipo: "valor_fixo_total", ordemAplicacao: 4, ativo: false },
];

/* ── Mock: Descontos por Empresa ── */
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

        {/* ── Modelos ── */}
        <TabsContent value="modelos" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Modelo</Button>
          </div>
          <DataTable
            data={mockModelos}
            columns={[
              { header: "Nome", accessorKey: "nome" },
              { header: "Descrição", accessorKey: "descricao" },
              { header: "Itens", accessorKey: "itensCount" },
              {
                header: "Status",
                accessorKey: "ativo",
                cell: ({ row }: any) => (
                  <Badge variant={row.original.ativo ? "default" : "secondary"}>
                    {row.original.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                ),
              },
            ]}
          />
        </TabsContent>

        {/* ── Tipos de Desconto ── */}
        <TabsContent value="tipos" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Tipo</Button>
          </div>
          <DataTable
            data={mockTiposDesconto}
            columns={[
              { header: "Nome", accessorKey: "nome" },
              {
                header: "Tipo",
                accessorKey: "tipo",
                cell: ({ row }: any) => tipoLabel[row.original.tipo] ?? row.original.tipo,
              },
              { header: "Ordem", accessorKey: "ordemAplicacao" },
              {
                header: "Status",
                accessorKey: "ativo",
                cell: ({ row }: any) => (
                  <Badge variant={row.original.ativo ? "default" : "secondary"}>
                    {row.original.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                ),
              },
            ]}
          />
        </TabsContent>

        {/* ── Descontos por Empresa ── */}
        <TabsContent value="empresa" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Desconto</Button>
          </div>
          <DataTable
            data={mockDescontosEmpresa}
            columns={[
              { header: "Empresa", accessorKey: "empresa" },
              { header: "Tipo de Desconto", accessorKey: "tipoDesconto" },
              {
                header: "Valor Padrão",
                accessorKey: "valorPadrao",
                cell: ({ row }: any) => row.original.valorPadrao.toFixed(2),
              },
              {
                header: "Status",
                accessorKey: "ativo",
                cell: ({ row }: any) => (
                  <Badge variant={row.original.ativo ? "default" : "secondary"}>
                    {row.original.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                ),
              },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
