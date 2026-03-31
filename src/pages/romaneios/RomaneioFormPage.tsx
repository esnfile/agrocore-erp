import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@/contexts/OrganizationContext";
import { romaneioService, romaneioPesagemService } from "@/lib/services";
import type { Romaneio, RomaneioPesagem } from "@/lib/mock-data";
import { RomaneioStepper } from "./components/RomaneioStepper";
import { StepIdentificacao } from "./steps/StepIdentificacao";
import { StepPesagens } from "./steps/StepPesagens";
import { StepVinculo } from "./steps/StepVinculo";
import { StepClassificacao } from "./steps/StepClassificacao";
import { StepFechamento } from "./steps/StepFechamento";
import { getCurrentStepForStatus, getMaxStepForStatus, isStepAccessible, type StatusRomaneioNew } from "./romaneio-types";
import { ArrowLeft } from "lucide-react";

export default function RomaneioFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { grupoAtual, empresaAtual, filialAtual } = useOrganization();

  const [romaneio, setRomaneio] = useState<Romaneio | null>(null);
  const [pesagens, setPesagens] = useState<RomaneioPesagem[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(!!id);

  const ctx = grupoAtual && empresaAtual && filialAtual
    ? { grupoId: grupoAtual.id, empresaId: empresaAtual.id, filialId: filialAtual.id }
    : null;

  const loadRomaneio = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const rom = await romaneioService.obterPorId(id);
    if (rom) {
      setRomaneio(rom);
      const p = await romaneioPesagemService.listarPorRomaneio(rom.id);
      setPesagens(p);
      const step = getCurrentStepForStatus(rom.status as StatusRomaneioNew);
      setCurrentStep(step);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { loadRomaneio(); }, [loadRomaneio]);

  const refresh = async () => {
    if (!romaneio) return;
    const updated = await romaneioService.obterPorId(romaneio.id);
    if (updated) {
      setRomaneio(updated);
      const p = await romaneioPesagemService.listarPorRomaneio(updated.id);
      setPesagens(p);
    }
  };

  const handleSaved = (saved: Romaneio) => {
    setRomaneio(saved);
    if (!id) {
      navigate(`/romaneios/${saved.id}`, { replace: true });
    }
    setCurrentStep(2);
  };

  const handleStepClick = (step: number) => {
    if (!romaneio) return;
    if (isStepAccessible(step, romaneio.status as StatusRomaneioNew)) {
      setCurrentStep(step);
    }
  };

  const status = (romaneio?.status || "RASCUNHO") as StatusRomaneioNew;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Romaneio" description="Carregando..." />
        <div className="flex items-center justify-center p-12 text-muted-foreground">Carregando romaneio...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/romaneios")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title={romaneio ? `Romaneio ${romaneio.id.substring(0, 8)}` : "Novo Romaneio"}
          description={romaneio ? `Status: ${status}` : "Criação de novo romaneio operacional"}
        />
      </div>

      <RomaneioStepper currentStep={currentStep} status={status} onStepClick={handleStepClick} />

      {currentStep === 1 && (
        <StepIdentificacao romaneio={romaneio} onSaved={handleSaved} ctx={ctx} />
      )}

      {currentStep === 2 && romaneio && (
        <StepPesagens romaneio={romaneio} pesagens={pesagens} onRefresh={refresh} ctx={ctx} />
      )}

      {currentStep === 3 && romaneio && (
        <StepVinculo romaneio={romaneio} onRefresh={refresh} ctx={ctx} />
      )}

      {currentStep === 4 && romaneio && (
        <StepClassificacao romaneio={romaneio} onRefresh={refresh} ctx={ctx} />
      )}

      {currentStep === 5 && romaneio && (
        <StepFechamento romaneio={romaneio} onRefresh={refresh} ctx={ctx} />
      )}

      {/* Navigation buttons */}
      {romaneio && currentStep > 1 && (
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}>
            ← Voltar
          </Button>
          {currentStep < 5 && isStepAccessible(currentStep + 1, status) && (
            <Button onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}>
              Avançar →
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
