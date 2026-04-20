import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useOrganization } from "@/contexts/OrganizationContext";
import { romaneioService, motoristaService, veiculoService, contratoService, pontoEstoqueService } from "@/lib/services";
import { produtos as mockProdutos, empresas, filiais } from "@/lib/mock-data";
import type { Romaneio, Contrato, Motorista, Veiculo, PontoEstoque } from "@/lib/mock-data";
import type { OrigemRomaneio, TipoRomaneio } from "../romaneio-types";
import { SAFRAS_REF, CULTIVOS_REF, ORIGEM_LABELS, TIPO_LABELS, resolveContratoUnidadeInfo, fmtDualUnit, fmtContratoSaldo } from "../romaneio-types";
import { FormRow } from "@/components/FormRow";

interface StepIdentificacaoProps {
  romaneio: Romaneio | null;
  pesagensCount: number;
  onSaved: (rom: Romaneio) => void;
  ctx: { grupoId: string; empresaId: string; filialId: string } | null;
}

export function StepIdentificacao({ romaneio, pesagensCount, onSaved, ctx }: StepIdentificacaoProps) {
  const { empresas: orgEmpresas, filiais: orgFiliais } = useOrganization();

  // Form state
  const [empresaId, setEmpresaId] = useState(romaneio?.empresaId || ctx?.empresaId || "");
  const [filialId, setFilialId] = useState(romaneio?.filialId || ctx?.filialId || "");
  const [origem, setOrigem] = useState<OrigemRomaneio>(romaneio?.origem || "CONTRATO");
  const [tipoRomaneio, setTipoRomaneio] = useState<TipoRomaneio>(romaneio?.tipoRomaneio || "ENTRADA");
  const [contratoId, setContratoId] = useState(romaneio?.contratoId || "");
  const [safraId, setSafraId] = useState(romaneio?.safraId || "");
  const [cultivoId, setCultivoId] = useState(romaneio?.cultivoId || "");
  const [pessoaId] = useState(romaneio?.pessoaId || "");
  const [produtoId, setProdutoId] = useState(romaneio?.produtoId || "");
  const [motoristaNome, setMotoristaNome] = useState(romaneio?.motoristaNome || "");
  const [motoristaDocumento, setMotoristaDocumento] = useState(romaneio?.motoristaDocumento || "");
  const [placaVeiculo, setPlacaVeiculo] = useState(romaneio?.placaVeiculo || "");
  const [tipoVeiculo, setTipoVeiculo] = useState("");
  const [pontoEstoqueId, setPontoEstoqueId] = useState(romaneio?.pontoEstoqueId || "");
  const [observacao, setObservacao] = useState(romaneio?.observacao || "");
  const [saving, setSaving] = useState(false);

  // Suggestions
  const [motoristaSugg, setMotoristaSugg] = useState<Motorista[]>([]);
  const [showMotSugg, setShowMotSugg] = useState(false);
  const [motHighlight, setMotHighlight] = useState(0);
  const [veiculoSugg, setVeiculoSugg] = useState<Veiculo[]>([]);
  const [showVeicSugg, setShowVeicSugg] = useState(false);
  const [veicHighlight, setVeicHighlight] = useState(0);
  const [quickMotOpen, setQuickMotOpen] = useState(false);
  const [quickMotNome, setQuickMotNome] = useState("");
  const [quickMotDoc, setQuickMotDoc] = useState("");
  const [quickVeicOpen, setQuickVeicOpen] = useState(false);
  const [quickVeicPlaca, setQuickVeicPlaca] = useState("");
  const [quickVeicTipo, setQuickVeicTipo] = useState("");

  // Data
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [pontosEstoque, setPontosEstoque] = useState<PontoEstoque[]>([]);
  const [contratosLoaded, setContratosLoaded] = useState(false);

  const produtos = mockProdutos.filter((p) => p.deletadoEm === null);
  const filiaisFiltradas = filiais.filter((f) => f.empresaId === empresaId && f.deletadoEm === null);
  const cultivosFiltrados = CULTIVOS_REF.filter((c) => c.safraId === safraId);

  // CORREÇÃO 1: Lock structural fields ONLY after first pesagem is persisted
  const structuralLocked = pesagensCount > 0;
  const isEditable = !romaneio || (romaneio.status !== "FINALIZADO" && romaneio.status !== "CANCELADO");
  const canEditStructural = isEditable && !structuralLocked;

  const loadContratos = async () => {
    if (!empresaId || !filialId || contratosLoaded) return;
    const c = await contratoService.listar(empresaId, filialId);
    setContratos(c.filter((ct) => ct.status === "ABERTO" || ct.status === "PARCIAL"));
    setContratosLoaded(true);
  };

  const loadPontosEstoque = async () => {
    if (!empresaId || !filialId) { setPontosEstoque([]); return; }
    const p = await pontoEstoqueService.listar(empresaId, filialId);
    setPontosEstoque(p.filter((pe) => pe.ativo));
  };

  useEffect(() => {
    if (empresaId && filialId) {
      loadPontosEstoque();
      loadContratos();
    } else {
      setPontosEstoque([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId, filialId]);

  // Clear ponto de estoque if it no longer belongs to selected filial
  useEffect(() => {
    if (pontoEstoqueId && pontosEstoque.length > 0 && !pontosEstoque.find((p) => p.id === pontoEstoqueId)) {
      setPontoEstoqueId("");
    }
  }, [pontosEstoque, pontoEstoqueId]);

  // CORREÇÃO 2: Cascade clear on empresa change
  const handleEmpresaChange = (newEmpresaId: string) => {
    setEmpresaId(newEmpresaId);
    // Clear all dependent fields
    setFilialId("");
    setPontoEstoqueId("");
    setContratoId("");
    setSafraId("");
    setCultivoId("");
    setContratosLoaded(false);
    // Clear derived fields from vínculo
    if (origem === "CONTRATO") {
      setProdutoId("");
      setTipoRomaneio("ENTRADA");
    }
    if (origem === "COLHEITA") {
      setProdutoId("");
    }
  };

  // Cascade clear on filial change
  const handleFilialChange = (newFilialId: string) => {
    setFilialId(newFilialId);
    setContratosLoaded(false);
    // Ponto de estoque will be auto-cleared by the useEffect above
  };

  // Auto-derive tipo from contract
  const handleContratoChange = (cId: string) => {
    setContratoId(cId);
    const contrato = contratos.find((c) => c.id === cId);
    if (contrato) {
      setProdutoId(contrato.produtoId);
      if (contrato.tipoContrato === "COMPRA") {
        setTipoRomaneio("ENTRADA");
      } else {
        setTipoRomaneio("SAIDA");
      }
    }
  };

  const handleCultivoChange = (cId: string) => {
    setCultivoId(cId);
    const cultivo = CULTIVOS_REF.find((c) => c.id === cId);
    if (cultivo) {
      const prod = produtos.find((p) => p.descricao.toLowerCase().includes(cultivo.produto.toLowerCase()));
      if (prod) setProdutoId(prod.id);
    }
  };

  // Auto-set tipo for Colheita
  useEffect(() => {
    if (origem === "COLHEITA") {
      setTipoRomaneio("ENTRADA");
    }
  }, [origem]);

  const searchMotorista = async (termo: string) => {
    setMotoristaNome(termo);
    if (!empresaId || termo.length < 2) { setShowMotSugg(false); return; }
    const results = await motoristaService.buscarPorNome(empresaId, filialId, termo);
    setMotoristaSugg(results);
    setMotHighlight(0);
    setShowMotSugg(results.length > 0);
  };

  const selectMotorista = (m: Motorista) => {
    setMotoristaNome(m.nome);
    setMotoristaDocumento(m.documento);
    setShowMotSugg(false);
  };

  const handleMotoristaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showMotSugg || motoristaSugg.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setMotHighlight((i) => (i + 1) % motoristaSugg.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setMotHighlight((i) => (i - 1 + motoristaSugg.length) % motoristaSugg.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const m = motoristaSugg[motHighlight];
      if (m) selectMotorista(m);
    } else if (e.key === "Escape") {
      setShowMotSugg(false);
    }
  };

  // Auto-open quick register popup if motorista typed doesn't match any existing record
  const handleMotoristaBlur = () => {
    setTimeout(async () => {
      setShowMotSugg(false);
      if (!isEditable || !empresaId || !motoristaNome.trim()) return;
      // Skip if a suggestion was just selected (documento was filled)
      if (motoristaDocumento) return;
      const results = await motoristaService.buscarPorNome(empresaId, filialId, motoristaNome);
      const exact = results.find((m) => m.nome.toLowerCase() === motoristaNome.trim().toLowerCase());
      if (!exact && !quickMotOpen) {
        setQuickMotNome(motoristaNome);
        setQuickMotDoc("");
        setQuickMotOpen(true);
      }
    }, 200);
  };

  const searchVeiculo = async (termo: string) => {
    setPlacaVeiculo(termo.toUpperCase());
    if (!empresaId || termo.length < 2) { setShowVeicSugg(false); return; }
    const results = await veiculoService.buscarPorPlaca(empresaId, filialId, termo);
    setVeiculoSugg(results);
    setVeicHighlight(0);
    setShowVeicSugg(results.length > 0);
  };

  const selectVeiculo = (v: Veiculo) => {
    setPlacaVeiculo(v.placa);
    setTipoVeiculo(v.tipoVeiculo || "");
    setShowVeicSugg(false);
  };

  const handleVeiculoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showVeicSugg || veiculoSugg.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setVeicHighlight((i) => (i + 1) % veiculoSugg.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setVeicHighlight((i) => (i - 1 + veiculoSugg.length) % veiculoSugg.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const v = veiculoSugg[veicHighlight];
      if (v) selectVeiculo(v);
    } else if (e.key === "Escape") {
      setShowVeicSugg(false);
    }
  };

  // Auto-open quick register popup if placa typed doesn't match any existing record
  const handleVeiculoBlur = () => {
    setTimeout(async () => {
      setShowVeicSugg(false);
      if (!isEditable || !empresaId || !placaVeiculo.trim()) return;
      // Skip if a suggestion was just selected (tipo was filled)
      if (tipoVeiculo) return;
      const results = await veiculoService.buscarPorPlaca(empresaId, filialId, placaVeiculo);
      const exact = results.find((v) => v.placa.toUpperCase() === placaVeiculo.trim().toUpperCase());
      if (!exact && !quickVeicOpen) {
        setQuickVeicPlaca(placaVeiculo);
        setQuickVeicTipo("");
        setQuickVeicOpen(true);
      }
    }, 200);
  };

  // CORREÇÃO 3: Block quick register when not editable (finalizado/cancelado)
  const quickRegisterMotorista = async () => {
    if (!ctx || !quickMotNome || !isEditable) return;
    const m = await motoristaService.salvar({ nome: quickMotNome, documento: quickMotDoc }, ctx);
    setMotoristaNome(m.nome);
    setMotoristaDocumento(m.documento);
    setQuickMotOpen(false); setQuickMotNome(""); setQuickMotDoc("");
    toast({ title: "Motorista cadastrado" });
  };

  const quickRegisterVeiculo = async () => {
    if (!ctx || !quickVeicPlaca || !isEditable) return;
    const v = await veiculoService.salvar({ placa: quickVeicPlaca.toUpperCase(), tipoVeiculo: quickVeicTipo }, ctx);
    setPlacaVeiculo(v.placa);
    setTipoVeiculo(v.tipoVeiculo || "");
    setQuickVeicOpen(false); setQuickVeicPlaca(""); setQuickVeicTipo("");
    toast({ title: "Veículo cadastrado" });
  };

  const validate = (): string | null => {
    if (!empresaId) return "Selecione a empresa";
    if (!filialId) return "Selecione a filial";
    if (origem === "CONTRATO" && !contratoId) return "Selecione o contrato";
    if (origem === "COLHEITA" && (!safraId || !cultivoId)) return "Selecione safra e cultivo";
    if (origem === "AVULSO" && !tipoRomaneio) return "Selecione o tipo do romaneio";
    if (!produtoId) return "Selecione o produto";
    if (!motoristaNome) return "Informe o motorista";
    if (!placaVeiculo) return "Informe a placa do veículo";
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) { toast({ title: error, variant: "destructive" }); return; }
    if (!ctx) return;

    setSaving(true);
    try {
      const data: Partial<Romaneio> = {
        id: romaneio?.id,
        empresaId,
        filialId,
        origem,
        tipoRomaneio,
        contratoId: origem === "CONTRATO" ? contratoId : romaneio?.contratoId || null,
        safraId: origem === "COLHEITA" ? safraId : romaneio?.safraId || null,
        cultivoId: origem === "COLHEITA" ? cultivoId : romaneio?.cultivoId || null,
        pessoaId: pessoaId || null,
        produtoId,
        motoristaNome,
        motoristaDocumento,
        placaVeiculo,
        pontoEstoqueId: pontoEstoqueId || null,
        observacao,
        status: romaneio ? romaneio.status : "AGUARDANDO_PESAGEM",
      };
      const saved = await romaneioService.salvar(data, { ...ctx, empresaId, filialId });
      if (!romaneio) {
        saved.status = "AGUARDANDO_PESAGEM";
      }
      toast({ title: romaneio ? "Romaneio atualizado" : "Romaneio criado" });
      onSaved(saved);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Lock warning */}
      {structuralLocked && isEditable && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          ⚠️ Campos estruturais (Origem, Tipo, Empresa, Filial) estão travados porque já existem pesagens registradas.
        </div>
      )}

      {/* Bloco 1 — Contexto Organizacional */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Contexto Organizacional</CardTitle></CardHeader>
        <CardContent>
          <FormRow columns={2}>
            <div>
              <Label>Empresa *</Label>
              <Select value={empresaId} onValueChange={handleEmpresaChange} disabled={!canEditStructural}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {empresas.filter((e) => e.deletadoEm === null).map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Filial *</Label>
              <Select value={filialId} onValueChange={handleFilialChange} disabled={!canEditStructural}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {filiaisFiltradas.map((f) => <SelectItem key={f.id} value={f.id}>{f.nomeRazao}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </FormRow>
        </CardContent>
      </Card>

      {/* Bloco 2 — Origem e Tipo */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Origem e Tipo do Romaneio</CardTitle></CardHeader>
        <CardContent>
          <FormRow columns={origem === "AVULSO" ? 2 : 1}>
            <div>
              <Label>Origem *</Label>
              <Select value={origem} onValueChange={(v) => setOrigem(v as OrigemRomaneio)} disabled={!canEditStructural}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONTRATO">{ORIGEM_LABELS.CONTRATO}</SelectItem>
                  <SelectItem value="COLHEITA">{ORIGEM_LABELS.COLHEITA}</SelectItem>
                  <SelectItem value="AVULSO">{ORIGEM_LABELS.AVULSO}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Tipo only visible for AVULSO */}
            {origem === "AVULSO" && (
              <div>
                <Label>Tipo *</Label>
                <Select value={tipoRomaneio} onValueChange={(v) => setTipoRomaneio(v as TipoRomaneio)} disabled={!canEditStructural}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENTRADA">{TIPO_LABELS.ENTRADA}</SelectItem>
                    <SelectItem value="SAIDA">{TIPO_LABELS.SAIDA}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </FormRow>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {origem === "CONTRATO" ? "🔗 Fluxo Comercial" : origem === "COLHEITA" ? "🌱 Fluxo Agrícola" : "📝 Preenchimento Manual"}
            </Badge>
            {origem !== "AVULSO" && (
              <Badge variant="outline" className="text-xs">
                Tipo: {TIPO_LABELS[tipoRomaneio]}
                {origem === "CONTRATO" && " (derivado do contrato)"}
                {origem === "COLHEITA" && " (sempre Entrada)"}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bloco 3 — Vínculo Principal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            {origem === "CONTRATO" ? "Vínculo Comercial" : origem === "COLHEITA" ? "Vínculo Agrícola" : "Dados do Produto"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {origem === "CONTRATO" && (
            <>
              <div>
                <Label>Contrato *</Label>
                <Select value={contratoId} onValueChange={handleContratoChange} disabled={!isEditable || structuralLocked}>
                  <SelectTrigger><SelectValue placeholder="Selecione o contrato" /></SelectTrigger>
                  <SelectContent>
                    {contratos.map((c) => {
                      const semSaldo = c.quantidadeSaldo <= 0;
                      return (
                        <SelectItem key={c.id} value={c.id} disabled={semSaldo}>
                          {c.numeroContrato} — {c.tipoContrato}
                          {semSaldo ? " (sem saldo)" : ` ${fmtContratoSaldo(c)}`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {contratoId && (() => {
                  const ct = contratos.find((c) => c.id === contratoId);
                  if (!ct) return null;
                  const uInfo = resolveContratoUnidadeInfo(ct);
                  return (
                    <div className="mt-2 rounded-md bg-muted/50 border p-2 text-xs space-y-0.5">
                      <p><span className="text-muted-foreground">Total contratado:</span> <strong>{fmtDualUnit(uInfo.totalOriginal, uInfo)}</strong></p>
                      <p><span className="text-muted-foreground">Já entregue:</span> <strong>{fmtDualUnit(uInfo.entregueOriginal, uInfo)}</strong></p>
                      <p><span className="text-muted-foreground">Saldo disponível:</span> <strong className={ct.quantidadeSaldo <= 0 ? "text-destructive" : "text-green-700"}>{fmtDualUnit(uInfo.saldoOriginal, uInfo)}</strong></p>
                    </div>
                  );
                })()}
              </div>
              <div>
                <Label>Produto</Label>
                <Select value={produtoId} onValueChange={setProdutoId} disabled={!!contratoId}>
                  <SelectTrigger><SelectValue placeholder="Herdado do contrato" /></SelectTrigger>
                  <SelectContent>
                    {produtos.map((p) => <SelectItem key={p.id} value={p.id}>{p.descricao}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {origem === "COLHEITA" && (
            <>
              <FormRow columns={2}>
                <div>
                  <Label>Safra *</Label>
                  <Select value={safraId} onValueChange={(v) => { setSafraId(v); setCultivoId(""); }} disabled={!isEditable || structuralLocked}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {SAFRAS_REF.map((s) => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cultivo *</Label>
                  <Select value={cultivoId} onValueChange={handleCultivoChange} disabled={!isEditable || !safraId || structuralLocked}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {cultivosFiltrados.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </FormRow>
              <div>
                <Label>Produto</Label>
                <Select value={produtoId} onValueChange={setProdutoId} disabled={!!cultivoId}>
                  <SelectTrigger><SelectValue placeholder="Herdado do cultivo" /></SelectTrigger>
                  <SelectContent>
                    {produtos.map((p) => <SelectItem key={p.id} value={p.id}>{p.descricao}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {origem === "AVULSO" && (
            <div>
              <Label>Produto *</Label>
              <Select value={produtoId} onValueChange={setProdutoId} disabled={!isEditable}>
                <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                <SelectContent>
                  {produtos.map((p) => <SelectItem key={p.id} value={p.id}>{p.descricao}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Ponto de Estoque — filtered by filial */}
          <div>
            <Label>Ponto de Estoque</Label>
            <Select value={pontoEstoqueId || "none"} onValueChange={(v) => setPontoEstoqueId(v === "none" ? "" : v)} disabled={!isEditable}>
              <SelectTrigger><SelectValue placeholder="Selecione (obrigatório p/ finalizar)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {pontosEstoque.map((p) => <SelectItem key={p.id} value={p.id}>{p.descricao} ({p.tipo})</SelectItem>)}
              </SelectContent>
            </Select>
            {filialId && pontosEstoque.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">Nenhum ponto de estoque ativo para esta filial.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bloco 4 — Identificação da Carga */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Identificação da Carga</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <FormRow columns={2}>
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label>Motorista *</Label>
                  <Input
                    value={motoristaNome}
                    onChange={(e) => { setMotoristaDocumento(""); searchMotorista(e.target.value); }}
                    placeholder="Nome do motorista"
                    onBlur={handleMotoristaBlur}
                    disabled={!isEditable}
                  />
                  {showMotSugg && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
                      {motoristaSugg.map((m) => (
                        <button key={m.id} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-accent" onMouseDown={(e) => e.preventDefault()} onClick={() => { setMotoristaNome(m.nome); setMotoristaDocumento(m.documento); setShowMotSugg(false); }}>
                          {m.nome} {m.documento && `— ${m.documento}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {isEditable && (
                  <Button type="button" variant="outline" size="icon" className="mt-5" onClick={() => { setQuickMotNome(motoristaNome); setQuickMotDoc(motoristaDocumento); setQuickMotOpen(true); }}><Plus className="h-4 w-4" /></Button>
                )}
              </div>
            </div>
            <div>
              <Label>Documento</Label>
              <Input value={motoristaDocumento} onChange={(e) => setMotoristaDocumento(e.target.value)} disabled={!isEditable} />
            </div>
          </FormRow>
          <FormRow columns={2}>
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label>Placa do Veículo *</Label>
                  <Input
                    value={placaVeiculo}
                    onChange={(e) => { setTipoVeiculo(""); searchVeiculo(e.target.value); }}
                    placeholder="Placa"
                    onBlur={handleVeiculoBlur}
                    disabled={!isEditable}
                  />
                  {showVeicSugg && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
                      {veiculoSugg.map((v) => (
                        <button key={v.id} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-accent" onMouseDown={(e) => e.preventDefault()} onClick={() => { setPlacaVeiculo(v.placa); setTipoVeiculo(v.tipoVeiculo || ""); setShowVeicSugg(false); }}>
                          {v.placa} {v.tipoVeiculo && `— ${v.tipoVeiculo}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {isEditable && (
                  <Button type="button" variant="outline" size="icon" className="mt-5" onClick={() => { setQuickVeicPlaca(placaVeiculo); setQuickVeicTipo(tipoVeiculo); setQuickVeicOpen(true); }}><Plus className="h-4 w-4" /></Button>
                )}
              </div>
            </div>
            <div>
              <Label>Tipo do Veículo</Label>
              <Input value={tipoVeiculo} onChange={(e) => setTipoVeiculo(e.target.value)} placeholder="Ex: Carreta, Truck" disabled={!isEditable} />
            </div>
          </FormRow>
        </CardContent>
      </Card>

      {/* Bloco 5 — Observação */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Observação</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={2} placeholder="Observação inicial" disabled={!isEditable} />
        </CardContent>
      </Card>

      {/* Actions */}
      {isEditable && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : (romaneio ? "Salvar e Avançar" : "Criar e Avançar")}
          </Button>
        </div>
      )}

      {/* Quick Motorista */}
      <Dialog open={quickMotOpen} onOpenChange={setQuickMotOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cadastro Rápido — Motorista</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome *</Label><Input value={quickMotNome} onChange={(e) => setQuickMotNome(e.target.value)} /></div>
            <div><Label>Documento</Label><Input value={quickMotDoc} onChange={(e) => setQuickMotDoc(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickMotOpen(false)}>Cancelar</Button>
            <Button onClick={quickRegisterMotorista} disabled={!quickMotNome}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Veículo */}
      <Dialog open={quickVeicOpen} onOpenChange={setQuickVeicOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cadastro Rápido — Veículo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Placa *</Label><Input value={quickVeicPlaca} onChange={(e) => setQuickVeicPlaca(e.target.value.toUpperCase())} /></div>
            <div><Label>Tipo</Label><Input value={quickVeicTipo} onChange={(e) => setQuickVeicTipo(e.target.value)} placeholder="Ex: Carreta, Truck" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickVeicOpen(false)}>Cancelar</Button>
            <Button onClick={quickRegisterVeiculo} disabled={!quickVeicPlaca}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
