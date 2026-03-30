import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw } from "lucide-react";

const mockMoedas = [
  { id: "cur1", codigo: "BRL", nome: "Real Brasileiro", simbolo: "R$", ativo: true },
  { id: "cur2", codigo: "USD", nome: "Dólar Americano", simbolo: "$", ativo: true },
  { id: "cur3", codigo: "EUR", nome: "Euro", simbolo: "€", ativo: true },
];

const mockCotacoes = [
  { id: "c1", moeda: "USD", taxa: 5.4521, dataHora: "2026-03-30 09:30", fonte: "API Automática" },
  { id: "c2", moeda: "EUR", taxa: 5.9103, dataHora: "2026-03-30 09:30", fonte: "API Automática" },
  { id: "c3", moeda: "USD", taxa: 5.4480, dataHora: "2026-03-30 09:20", fonte: "API Automática" },
  { id: "c4", moeda: "EUR", taxa: 5.9050, dataHora: "2026-03-30 09:20", fonte: "API Automática" },
  { id: "c5", moeda: "USD", taxa: 5.4200, dataHora: "2026-03-29 17:00", fonte: "Manual" },
];

export default function MoedasCotacoesPage() {
  const [tab, setTab] = useState("moedas");

  return (
    <div className="space-y-6">
      <PageHeader title="Moedas e Cotações" description="Gerencie moedas aceitas e acompanhe cotações atualizadas." />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="moedas">Moedas</TabsTrigger>
          <TabsTrigger value="cotacoes">Cotações</TabsTrigger>
        </TabsList>

        <TabsContent value="moedas" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Moeda</Button>
          </div>
          <DataTable
            data={mockMoedas}
            columns={[
              { key: "codigo", header: "Código" },
              { key: "nome", header: "Nome" },
              { key: "simbolo", header: "Símbolo" },
              { key: "ativo", header: "Status", render: (row) => (
                <Badge variant={row.ativo ? "default" : "secondary"}>{row.ativo ? "Ativo" : "Inativo"}</Badge>
              )},
            ]}
          />
        </TabsContent>

        <TabsContent value="cotacoes" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline"><RefreshCw className="h-4 w-4 mr-1" /> Atualizar Cotações</Button>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Cotação Manual</Button>
          </div>
          <DataTable
            data={mockCotacoes}
            columns={[
              { key: "moeda", header: "Moeda" },
              { key: "taxa", header: "Taxa (BRL)", render: (row) => `R$ ${row.taxa.toFixed(4)}` },
              { key: "dataHora", header: "Data/Hora" },
              { key: "fonte", header: "Fonte" },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
