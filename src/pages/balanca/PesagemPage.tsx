import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FormRow } from "@/components/FormRow";
import { useOrganization } from "@/contexts/OrganizationContext";
import { romaneioService } from "@/lib/services";
import { produtos as mockProdutos, empresas, filiais, type Romaneio } from "@/lib/mock-data";
import { Plus, Scale } from "lucide-react";

export default function PesagemPage() {
  const navigate = useNavigate();
  const { grupoAtual, empresaAtual, filialAtual } = useOrganization();

  const [items, setItems] = useState<Romaneio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProduto, setFilterProduto] = useState<string>("TODOS");
  const [filterEmpresa, setFilterEmpresa] = useState<string>(empresaAtual?.id || "TODAS");
  const [filterFilial, setFilterFilial] = useState<string>(filialAtual?.id || "TODAS");

  useEffect(() => {
    if (empresaAtual) setFilterEmpresa(empresaAtual.id);
    if (filialAtual) setFilterFilial(filialAtual.id);
  }, [empresaAtual, filialAtual]);

  const load = useCallback(async () => {
    setLoading(true);
    let data: Romaneio[] = [];
    if (filterEmpresa === "TODAS") {
      for (const emp of empresas.filter((e) => e.deletadoEm === null && e.grupoId === grupoAtual?.id)) {
        for (const fil of filiais.filter((f) => f.empresaId === emp.id && f.deletadoEm === null)) {
          const r = await romaneioService.listar(emp.id, fil.id);
          data = data.concat(r);
        }
      }
    } else if (filterFilial === "TODAS") {
      for (const fil of filiais.filter((f) => f.empresaId === filterEmpresa && f.deletadoEm === null)) {
        const r = await romaneioService.listar(filterEmpresa, fil.id);
        data = data.concat(r);
      }
    } else {
      data = await romaneioService.listar(filterEmpresa, filterFilial);
    }
    setItems(data.filter((r) => r.status === "AGUARDANDO_PESAGEM" || r.status === "PESAGEM_PARCIAL"));
    setLoading(false);
  }, [filterEmpresa, filterFilial, grupoAtual]);

  useEffect(() => { load(); }, [load]);

  const produtoMap = useMemo(() => {
    const m: Record<string, string> = {};
    mockProdutos.forEach((p) => { m[p.id] = p.descricao; });
    return m;
  }, []);

  const filtered = useMemo(() => {
    if (filterProduto === "TODOS") return items;
    return items.filter((r) => r.produtoId === filterProduto);
  }, [items, filterProduto]);

  const filiaisFiltradas = filterEmpresa !== "TODAS"
    ? filiais.filter((f) => f.empresaId === filterEmpresa && f.deletadoEm === null)
    : [];

  const ctx = grupoAtual && empresaAtual && filialAtual
    ? { grupoId: grupoAtual.id, empresaId: empresaAtual.id, filialId: filialAtual.id }
    : null;

  return (
    <div className="space-y-4">
      <PageHeader title="Pesagem de Romaneios" description="Tela do operador de balança — registre pesagens dos romaneios pendentes" />

      <div className="rounded-lg border bg-card p-3">
        <FormRow columns={3}>
          <div>
            <label className="text-xs text-muted-foreground font-medium">Empresa</label>
            <Select value={filterEmpresa} onValueChange={(v) => { setFilterEmpresa(v); setFilterFilial("TODAS"); }}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas as empresas</SelectItem>
                {empresas.filter((e) => e.deletadoEm === null && e.grupoId === grupoAtual?.id).map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium">Filial</label>
            <Select value={filterFilial} onValueChange={setFilterFilial} disabled={filterEmpresa === "TODAS"}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas as filiais</SelectItem>
                {filiaisFiltradas.map((f) => <SelectItem key={f.id} value={f.id}>{f.nomeRazao}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium">Produto</label>
            <Select value={filterProduto} onValueChange={setFilterProduto}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os produtos</SelectItem>
                {mockProdutos.filter((p) => p.deletadoEm === null && p.ativo).map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.descricao}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FormRow>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} romaneio{filtered.length !== 1 && "s"} aguardando pesagem
        </p>
        <Button onClick={() => navigate("/balanca/pesagem/novo")} disabled={!ctx} className="gap-1">
          <Plus className="h-4 w-4" /> Novo Romaneio
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        {loading ? (
          <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Romaneio</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Motorista</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhum romaneio aguardando pesagem.</TableCell></TableRow>
              ) : filtered.map((r) => (
                <TableRow key={r.id} className="cursor-pointer hover:bg-accent/30" onClick={() => navigate(`/balanca/pesagem/${r.id}`)}>
                  <TableCell className="font-mono text-xs">{r.id.substring(0, 10)}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{r.tipoRomaneio}</Badge></TableCell>
                  <TableCell>{produtoMap[r.produtoId] || "—"}</TableCell>
                  <TableCell>{r.motoristaNome || "—"}</TableCell>
                  <TableCell className="font-mono">{r.placaVeiculo || "—"}</TableCell>
                  <TableCell className="text-xs">{format(new Date(r.criadoEm), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "PESAGEM_PARCIAL" ? "secondary" : "outline"} className="text-[10px]">
                      {r.status === "PESAGEM_PARCIAL" ? "Pesagem Parcial" : "Aguard. Pesagem"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="default" className="gap-1" onClick={() => navigate(`/balanca/pesagem/${r.id}`)}>
                      <Scale className="h-3 w-3" /> Pesar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
