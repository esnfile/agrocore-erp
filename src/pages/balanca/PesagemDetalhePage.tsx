import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useOrganization } from "@/contexts/OrganizationContext";
import { romaneioService, romaneioPesagemService, pontoEstoqueService } from "@/lib/services";
import { produtos as mockProdutos, type Romaneio, type RomaneioPesagem, type PontoEstoque } from "@/lib/mock-data";
import { StepPesagens } from "@/pages/romaneios/steps/StepPesagens";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function PesagemDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { grupoAtual, empresaAtual, filialAtual } = useOrganization();

  const [romaneio, setRomaneio] = useState<Romaneio | null>(null);
  const [pesagens, setPesagens] = useState<RomaneioPesagem[]>([]);
  const [pontos, setPontos] = useState<PontoEstoque[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const r = await romaneioService.obterPorId(id);
    if (r) {
      setRomaneio(r);
      const p = await romaneioPesagemService.listarPorRomaneio(r.id);
      setPesagens(p);
      const pts = await pontoEstoqueService.listar(r.empresaId, r.filialId);
      setPontos(pts);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const refresh = async () => {
    if (!romaneio) return;
    const updated = await romaneioService.obterPorId(romaneio.id);
    if (updated) {
      setRomaneio(updated);
      const p = await romaneioPesagemService.listarPorRomaneio(updated.id);
      setPesagens(p);
    }
  };

  const handleConfirmar = async () => {
    if (!romaneio) return;
    if (pesagens.length === 0) {
      toast({ title: "Registre pelo menos uma pesagem antes de confirmar", variant: "destructive" });
      return;
    }
    if (romaneio.status === "AGUARDANDO_CLASSIFICACAO") {
      toast({ title: "Pesagem já confirmada" });
      navigate("/balanca/pesagem");
      return;
    }
    if (romaneio.status === "PESAGEM_PARCIAL") {
      toast({
        title: "Pesagens incompletas",
        description: "Registre as duas pesagens (Entrada e Saída) para confirmar.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Pesagem confirmada", description: "Romaneio enviado para classificação." });
    navigate("/balanca/pesagem");
  };

  const ctx = grupoAtual && empresaAtual && filialAtual
    ? { grupoId: grupoAtual.id, empresaId: empresaAtual.id, filialId: filialAtual.id }
    : null;

  if (loading || !romaneio) {
    return (
      <div className="space-y-4">
        <PageHeader title="Pesagem" description="Carregando..." />
      </div>
    );
  }

  const produtoNome = mockProdutos.find((p) => p.id === romaneio.produtoId)?.descricao || "—";
  const pontoNome = pontos.find((p) => p.id === romaneio.pontoEstoqueId)?.descricao || "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/balanca/pesagem")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title={`Pesagem — Romaneio ${romaneio.id.substring(0, 10)}`}
          description={`Status: ${romaneio.status}`}
        />
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
              <p className="text-xs text-muted-foreground">Estoque</p>
              <p className="font-medium">{pontoNome}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Motorista</p>
              <p className="font-medium">{romaneio.motoristaNome || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Veículo</p>
              <p className="font-medium font-mono">{romaneio.placaVeiculo || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepPesagens romaneio={romaneio} pesagens={pesagens} onRefresh={refresh} ctx={ctx} />

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleConfirmar} className="gap-2" size="lg">
          <Check className="h-4 w-4" /> Confirmar Pesagem
        </Button>
      </div>
    </div>
  );
}
