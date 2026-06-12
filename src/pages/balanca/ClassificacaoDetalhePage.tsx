import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useOrganization } from "@/contexts/OrganizationContext";
import { romaneioService } from "@/lib/services";
import { produtos as mockProdutos, type Romaneio } from "@/lib/mock-data";
import { StepClassificacao } from "@/pages/romaneios/steps/StepClassificacao";
import { RomaneioStatusBadge } from "@/pages/romaneios/components/RomaneioStatusBadge";
import { ArrowLeft } from "lucide-react";

export default function ClassificacaoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { grupoAtual, empresaAtual, filialAtual } = useOrganization();

  const [romaneio, setRomaneio] = useState<Romaneio | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const r = await romaneioService.obterPorId(id);
    if (r) setRomaneio(r);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const refresh = async () => {
    if (!romaneio) return;
    const updated = await romaneioService.obterPorId(romaneio.id);
    if (updated) {
      setRomaneio(updated);
      if (updated.status === "CLASSIFICADO" || updated.status === "AGUARDANDO_VINCULO") {
        setTimeout(() => navigate("/balanca/classificacao"), 800);
      }
    }
  };

  const ctx = grupoAtual && empresaAtual && filialAtual
    ? { grupoId: grupoAtual.id, empresaId: empresaAtual.id, filialId: filialAtual.id }
    : null;

  if (loading || !romaneio) {
    return (
      <div className="space-y-4">
        <PageHeader title="Classificação" description="Carregando..." />
      </div>
    );
  }

  const produtoNome = mockProdutos.find((p) => p.id === romaneio.produtoId)?.descricao || "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/balanca/classificacao")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title={`Classificação — Romaneio ${romaneio.id.substring(0, 10)}`}
          description="Classifique a qualidade do romaneio"
        />
        <RomaneioStatusBadge status={romaneio.status} className="text-xs" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Tipo</p>
              <Badge variant="outline">{romaneio.tipoRomaneio}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Produto</p>
              <p className="font-medium">{produtoNome}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Motorista</p>
              <p className="font-medium">{romaneio.motoristaNome || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Veículo</p>
              <p className="font-medium font-mono">{romaneio.placaVeiculo || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Peso Físico</p>
              <p className="font-bold">{romaneio.pesoLiquidoFisico.toFixed(0)} kg</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepClassificacao romaneio={romaneio} onRefresh={refresh} ctx={ctx} />
    </div>
  );
}
