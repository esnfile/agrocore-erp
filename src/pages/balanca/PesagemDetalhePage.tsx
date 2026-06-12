import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RomaneioStatusBadge } from "@/pages/romaneios/components/RomaneioStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormRow } from "@/components/FormRow";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  romaneioService,
  romaneioPesagemService,
  pontoEstoqueService,
  motoristaService,
  veiculoService,
} from "@/lib/services";
import {
  produtos as mockProdutos,
  type Romaneio,
  type RomaneioPesagem,
  type PontoEstoque,
  type Motorista,
  type Veiculo,
  type TipoRomaneio,
} from "@/lib/mock-data";
import { StepPesagens } from "@/pages/romaneios/steps/StepPesagens";
import { ArrowLeft, Check, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function PesagemDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { grupoAtual, empresaAtual, filialAtual } = useOrganization();
  const isNovo = id === "novo";

  const [romaneio, setRomaneio] = useState<Romaneio | null>(null);
  const [pesagens, setPesagens] = useState<RomaneioPesagem[]>([]);
  const [pontos, setPontos] = useState<PontoEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingHeader, setSavingHeader] = useState(false);

  // Header form state (used in novo mode and pre-1st-pesagem editing)
  const [tipoRomaneio, setTipoRomaneio] = useState<TipoRomaneio>("ENTRADA");
  const [produtoId, setProdutoId] = useState("");
  const [pontoEstoqueId, setPontoEstoqueId] = useState("");

  const [motoristaId, setMotoristaId] = useState("");
  const [motoristaNome, setMotoristaNome] = useState("");
  const [motoristaDocumento, setMotoristaDocumento] = useState("");
  const [motSugg, setMotSugg] = useState<Motorista[]>([]);
  const [showMotSugg, setShowMotSugg] = useState(false);
  const [motHi, setMotHi] = useState(0);
  const [quickMotOpen, setQuickMotOpen] = useState(false);
  const [quickMotNome, setQuickMotNome] = useState("");
  const [quickMotDoc, setQuickMotDoc] = useState("");

  const [veiculoId, setVeiculoId] = useState("");
  const [placaVeiculo, setPlacaVeiculo] = useState("");
  const [tipoVeiculo, setTipoVeiculo] = useState("");
  const [veicSugg, setVeicSugg] = useState<Veiculo[]>([]);
  const [showVeicSugg, setShowVeicSugg] = useState(false);
  const [veicHi, setVeicHi] = useState(0);
  const [quickVeicOpen, setQuickVeicOpen] = useState(false);
  const [quickVeicPlaca, setQuickVeicPlaca] = useState("");
  const [quickVeicTipo, setQuickVeicTipo] = useState("");

  const blurMotRef = useRef<number | null>(null);
  const blurVeicRef = useRef<number | null>(null);

  const ctx = useMemo(
    () =>
      grupoAtual && empresaAtual && filialAtual
        ? { grupoId: grupoAtual.id, empresaId: empresaAtual.id, filialId: filialAtual.id }
        : null,
    [grupoAtual, empresaAtual, filialAtual]
  );

  const produtosAtivos = useMemo(
    () => mockProdutos.filter((p) => p.deletadoEm === null && p.ativo),
    []
  );

  const load = useCallback(async () => {
    setLoading(true);
    if (isNovo) {
      if (ctx) {
        const pts = await pontoEstoqueService.listar(ctx.empresaId, ctx.filialId);
        setPontos(pts.filter((p) => p.ativo));
      }
      setLoading(false);
      return;
    }
    if (!id) return;
    const r = await romaneioService.obterPorId(id);
    if (r) {
      setRomaneio(r);
      const p = await romaneioPesagemService.listarPorRomaneio(r.id);
      setPesagens(p);
      const pts = await pontoEstoqueService.listar(r.empresaId, r.filialId);
      setPontos(pts);
      // hydrate header form (in case user edits before 1st pesagem)
      setTipoRomaneio(r.tipoRomaneio);
      setProdutoId(r.produtoId || "");
      setPontoEstoqueId(r.pontoEstoqueId || "");
      setMotoristaId(r.motoristaId || "");
      setMotoristaNome(r.motoristaNome || "");
      setMotoristaDocumento(r.motoristaDocumento || "");
      setVeiculoId(r.veiculoId || "");
      setPlacaVeiculo(r.placaVeiculo || "");
    }
    setLoading(false);
  }, [id, isNovo, ctx]);

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

  // ===== Motorista autocomplete =====
  const searchMotorista = async (termo: string) => {
    setMotoristaNome(termo); setMotoristaId(""); setMotoristaDocumento("");
    if (!ctx || termo.length < 2) { setShowMotSugg(false); return; }
    const r = await motoristaService.buscarPorNome(ctx.empresaId, ctx.filialId, termo);
    setMotSugg(r); setMotHi(0); setShowMotSugg(r.length > 0);
  };
  const selectMotorista = (m: Motorista) => {
    setMotoristaId(m.id); setMotoristaNome(m.nome); setMotoristaDocumento(m.documento || "");
    setShowMotSugg(false);
  };
  const handleMotKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showMotSugg || motSugg.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setMotHi((i) => (i + 1) % motSugg.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setMotHi((i) => (i - 1 + motSugg.length) % motSugg.length); }
    else if (e.key === "Enter") { e.preventDefault(); const m = motSugg[motHi]; if (m) selectMotorista(m); }
    else if (e.key === "Escape") setShowMotSugg(false);
  };
  const handleMotBlur = () => {
    if (blurMotRef.current) window.clearTimeout(blurMotRef.current);
    blurMotRef.current = window.setTimeout(async () => {
      setShowMotSugg(false);
      if (!ctx || !motoristaNome.trim() || motoristaId) return;
      const r = await motoristaService.buscarPorNome(ctx.empresaId, ctx.filialId, motoristaNome);
      const exact = r.find((m) => m.nome.toLowerCase() === motoristaNome.trim().toLowerCase());
      if (exact) { selectMotorista(exact); return; }
      if (!quickMotOpen) {
        setQuickMotNome(motoristaNome); setQuickMotDoc(""); setQuickMotOpen(true);
      }
    }, 200);
  };
  const quickRegMotorista = async () => {
    if (!ctx || !quickMotNome.trim()) { toast({ title: "Informe o nome", variant: "destructive" }); return; }
    const m = await motoristaService.salvar({ nome: quickMotNome.trim(), documento: quickMotDoc.trim() }, ctx);
    setMotoristaId(m.id); setMotoristaNome(m.nome); setMotoristaDocumento(m.documento || "");
    setQuickMotOpen(false);
    toast({ title: "Motorista cadastrado" });
  };

  // ===== Veículo autocomplete =====
  const searchVeiculo = async (termo: string) => {
    const up = termo.toUpperCase();
    setPlacaVeiculo(up); setVeiculoId(""); setTipoVeiculo("");
    if (!ctx || up.length < 2) { setShowVeicSugg(false); return; }
    const r = await veiculoService.buscarPorPlaca(ctx.empresaId, ctx.filialId, up);
    setVeicSugg(r); setVeicHi(0); setShowVeicSugg(r.length > 0);
  };
  const selectVeiculo = (v: Veiculo) => {
    setVeiculoId(v.id); setPlacaVeiculo(v.placa); setTipoVeiculo(v.tipoVeiculo || "");
    setShowVeicSugg(false);
  };
  const handleVeicKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showVeicSugg || veicSugg.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setVeicHi((i) => (i + 1) % veicSugg.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setVeicHi((i) => (i - 1 + veicSugg.length) % veicSugg.length); }
    else if (e.key === "Enter") { e.preventDefault(); const v = veicSugg[veicHi]; if (v) selectVeiculo(v); }
    else if (e.key === "Escape") setShowVeicSugg(false);
  };
  const handleVeicBlur = () => {
    if (blurVeicRef.current) window.clearTimeout(blurVeicRef.current);
    blurVeicRef.current = window.setTimeout(async () => {
      setShowVeicSugg(false);
      if (!ctx || !placaVeiculo.trim() || veiculoId) return;
      const r = await veiculoService.buscarPorPlaca(ctx.empresaId, ctx.filialId, placaVeiculo);
      const exact = r.find((v) => v.placa.toUpperCase() === placaVeiculo.trim().toUpperCase());
      if (exact) { selectVeiculo(exact); return; }
      if (!quickVeicOpen) {
        setQuickVeicPlaca(placaVeiculo); setQuickVeicTipo(""); setQuickVeicOpen(true);
      }
    }, 200);
  };
  const quickRegVeiculo = async () => {
    if (!ctx || !quickVeicPlaca.trim()) { toast({ title: "Informe a placa", variant: "destructive" }); return; }
    const v = await veiculoService.salvar(
      { placa: quickVeicPlaca.trim().toUpperCase(), tipoVeiculo: quickVeicTipo.trim() },
      ctx
    );
    setVeiculoId(v.id); setPlacaVeiculo(v.placa); setTipoVeiculo(v.tipoVeiculo || "");
    setQuickVeicOpen(false);
    toast({ title: "Veículo cadastrado" });
  };

  const validateHeader = (): string | null => {
    if (!produtoId) return "Selecione o produto";
    if (!pontoEstoqueId) return "Selecione o ponto de estoque";
    if (!motoristaId || !motoristaNome.trim()) return "Informe o motorista (cadastre se necessário)";
    if (!veiculoId || !placaVeiculo.trim()) return "Informe o veículo (cadastre se necessário)";
    return null;
  };

  const handleSalvarCabecalho = async () => {
    if (!ctx) return;
    const err = validateHeader();
    if (err) { toast({ title: err, variant: "destructive" }); return; }
    setSavingHeader(true);
    try {
      const duplicado = await romaneioService.verificarDuplicado({
        empresaId: ctx.empresaId,
        filialId: ctx.filialId,
        origem: "AVULSO",
        tipoRomaneio,
        produtoId,
        pontoEstoqueId,
        motoristaId,
        veiculoId,
        excludeId: romaneio?.id,
      });
      if (duplicado) {
        toast({ title: "Romaneio já existe", description: "Selecione-o na listagem.", variant: "destructive" });
        return;
      }
      const payload: Partial<Romaneio> = {
        ...(romaneio ? { id: romaneio.id } : {}),
        origem: "AVULSO",
        tipoRomaneio,
        produtoId,
        pontoEstoqueId,
        motoristaId,
        motoristaNome,
        motoristaDocumento,
        veiculoId,
        placaVeiculo,
        status: romaneio?.status ?? "AGUARDANDO_PESAGEM",
        origemCriacao: romaneio?.origemCriacao ?? "TELA_PESAGEM",
      };
      const saved = await romaneioService.salvar(payload, ctx);
      toast({ title: isNovo ? "Romaneio criado. Inicie a pesagem." : "Cabeçalho atualizado." });
      if (isNovo) {
        navigate(`/balanca/pesagem/${saved.id}`, { replace: true });
      } else {
        setRomaneio(saved);
      }
    } finally {
      setSavingHeader(false);
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

  // Header is editable only while no pesagem has been registered yet
  const headerEditable = isNovo || pesagens.length === 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Pesagem" description="Carregando..." />
      </div>
    );
  }

  const produtoNome = mockProdutos.find((p) => p.id === produtoId)?.descricao || "—";
  const pontoNome = pontos.find((p) => p.id === pontoEstoqueId)?.descricao || "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/balanca/pesagem")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title={isNovo ? "Novo Romaneio — Pesagem" : `Pesagem — Romaneio ${romaneio?.id.substring(0, 10)}`}
          description={isNovo ? "Preencha o cabeçalho e inicie a pesagem" : "Registre as pesagens do romaneio"}
        />
        {!isNovo && romaneio && <RomaneioStatusBadge status={romaneio.status} className="text-xs" />}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Identificação</span>
            {headerEditable ? (
              <Badge variant="outline" className="text-[10px]">Editável</Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">Bloqueado (pesagem registrada)</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {headerEditable ? (
            <div className="space-y-4">
              <FormRow columns={3}>
                <div>
                  <Label>Tipo *</Label>
                  <Select value={tipoRomaneio} onValueChange={(v) => setTipoRomaneio(v as TipoRomaneio)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENTRADA">Entrada</SelectItem>
                      <SelectItem value="SAIDA">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Produto *</Label>
                  <Select value={produtoId} onValueChange={setProdutoId}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {produtosAtivos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.descricao}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ponto de Estoque *</Label>
                  <Select value={pontoEstoqueId} onValueChange={setPontoEstoqueId}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {pontos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.descricao}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </FormRow>
              <FormRow columns={2}>
                <div className="relative">
                  <Label>Motorista *</Label>
                  <Input
                    value={motoristaNome}
                    onChange={(e) => searchMotorista(e.target.value)}
                    onKeyDown={handleMotKey}
                    onBlur={handleMotBlur}
                    onFocus={() => motSugg.length > 0 && setShowMotSugg(true)}
                    placeholder="Digite o nome do motorista"
                    autoComplete="off"
                  />
                  {showMotSugg && (
                    <div className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded-md border bg-popover shadow-md">
                      {motSugg.map((m, i) => (
                        <button
                          type="button"
                          key={m.id}
                          onMouseDown={(e) => { e.preventDefault(); selectMotorista(m); }}
                          className={`block w-full text-left px-3 py-2 text-sm hover:bg-accent ${i === motHi ? "bg-accent" : ""}`}
                        >
                          <div className="font-medium">{m.nome}</div>
                          {m.documento && <div className="text-xs text-muted-foreground">{m.documento}</div>}
                        </button>
                      ))}
                    </div>
                  )}
                  {motoristaDocumento && (
                    <p className="text-xs text-muted-foreground mt-1">Doc: {motoristaDocumento}</p>
                  )}
                </div>
                <div className="relative">
                  <Label>Veículo (Placa) *</Label>
                  <Input
                    value={placaVeiculo}
                    onChange={(e) => searchVeiculo(e.target.value)}
                    onKeyDown={handleVeicKey}
                    onBlur={handleVeicBlur}
                    onFocus={() => veicSugg.length > 0 && setShowVeicSugg(true)}
                    placeholder="Digite a placa"
                    autoComplete="off"
                    className="font-mono uppercase"
                  />
                  {showVeicSugg && (
                    <div className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded-md border bg-popover shadow-md">
                      {veicSugg.map((v, i) => (
                        <button
                          type="button"
                          key={v.id}
                          onMouseDown={(e) => { e.preventDefault(); selectVeiculo(v); }}
                          className={`block w-full text-left px-3 py-2 text-sm hover:bg-accent ${i === veicHi ? "bg-accent" : ""}`}
                        >
                          <div className="font-mono font-medium">{v.placa}</div>
                          {v.tipoVeiculo && <div className="text-xs text-muted-foreground">{v.tipoVeiculo}</div>}
                        </button>
                      ))}
                    </div>
                  )}
                  {tipoVeiculo && (
                    <p className="text-xs text-muted-foreground mt-1">Tipo: {tipoVeiculo}</p>
                  )}
                </div>
              </FormRow>
              <div className="flex justify-end">
                <Button onClick={handleSalvarCabecalho} disabled={savingHeader} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isNovo ? "Salvar e Iniciar Pesagem" : "Salvar Cabeçalho"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <Badge variant="outline">{romaneio?.tipoRomaneio}</Badge>
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
                <p className="font-medium">{romaneio?.motoristaNome || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Veículo</p>
                <p className="font-medium font-mono">{romaneio?.placaVeiculo || "—"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pesagens block — only after romaneio exists */}
      {!isNovo && romaneio && (
        <>
          <StepPesagens romaneio={romaneio} pesagens={pesagens} onRefresh={refresh} ctx={ctx} />

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleConfirmar} className="gap-2" size="lg">
              <Check className="h-4 w-4" /> Confirmar Pesagem
            </Button>
          </div>
        </>
      )}

      {isNovo && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Salve o cabeçalho acima para liberar o registro das pesagens.
          </CardContent>
        </Card>
      )}

      {/* Quick add Motorista */}
      <Dialog open={quickMotOpen} onOpenChange={setQuickMotOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Cadastrar Motorista</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Nome *</Label>
              <Input value={quickMotNome} onChange={(e) => setQuickMotNome(e.target.value)} autoFocus />
            </div>
            <div>
              <Label>CPF / Documento</Label>
              <Input value={quickMotDoc} onChange={(e) => setQuickMotDoc(e.target.value)} placeholder="Opcional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickMotOpen(false)}>Cancelar</Button>
            <Button onClick={quickRegMotorista}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick add Veículo */}
      <Dialog open={quickVeicOpen} onOpenChange={setQuickVeicOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Cadastrar Veículo</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Placa *</Label>
              <Input
                value={quickVeicPlaca}
                onChange={(e) => setQuickVeicPlaca(e.target.value.toUpperCase())}
                className="font-mono uppercase"
                autoFocus
              />
            </div>
            <div>
              <Label>Tipo de Veículo</Label>
              <Input value={quickVeicTipo} onChange={(e) => setQuickVeicTipo(e.target.value)} placeholder="Ex: Truck, Carreta..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickVeicOpen(false)}>Cancelar</Button>
            <Button onClick={quickRegVeiculo}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
