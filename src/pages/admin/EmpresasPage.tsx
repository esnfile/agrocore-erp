import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { empresaService } from "@/lib/services";
import type { Empresa } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const columns: Column<Empresa>[] = [
  { key: "nomeFantasia", header: "Nome Fantasia" },
  { key: "razaoSocial", header: "Razão Social" },
  { key: "cnpj", header: "CNPJ" },
  { key: "email", header: "E-mail" },
  {
    key: "ativo",
    header: "Status",
    render: (row) => (
      <Badge variant={row.ativo ? "default" : "secondary"}>
        {row.ativo ? "Ativo" : "Inativo"}
      </Badge>
    ),
  },
];

export default function EmpresasPage() {
  const [data, setData] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    empresaService.listar().then((list) => {
      setData(list);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (row: Empresa) => {
    await empresaService.excluir(row.id);
    setData((prev) => prev.filter((e) => e.id !== row.id));
    toast({ title: "Empresa excluída", description: `${row.nomeFantasia} foi desativada.` });
  };

  return (
    <>
      <PageHeader title="Empresas" description="Gerencie as empresas do grupo" />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchPlaceholder="Buscar empresa..."
        onNew={() => navigate("/admin/empresas/nova")}
        onEdit={(row) => navigate(`/admin/empresas/${row.id}`)}
        onDelete={handleDelete}
      />
    </>
  );
}
