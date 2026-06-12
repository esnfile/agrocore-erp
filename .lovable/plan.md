# Dashboards Colapsáveis — 5 Módulos

Concordo com a proposta. Ela está alinhada à paleta moderna que acabamos de aplicar (verde/azul/âmbar via tokens semânticos) e ao padrão visual do projeto. Abaixo o plano de execução, com pequenos ajustes para manter consistência com o que já existe.

## Ajustes em relação ao seu prompt

1. **Cores via tokens** — não usaremos hex direto nos componentes. Tudo via `hsl(var(--success))`, `--info`, `--warning`, `--destructive`, `--primary` (já configurados em `index.css`). Isso garante dark mode e padrão do projeto.
2. **Componente Collapse** — usaremos o `Collapsible` do Radix (já instalado em `src/components/ui/collapsible.tsx`), com animação `accordion-down/up` já disponível em `tailwind.config.ts`.
3. **Trends (↑ +12%)** — os mocks atuais não têm histórico para calcular variação percentual real. Vou **omitir os trends** nesta entrega (deixaria valores fake). Mantemos apenas valor + ícone de alerta quando aplicável. Se quiser trends de verdade, depois calculamos comparando com período anterior.
4. **Dashboard "Caixas e Bancos"** — não temos hoje uma tela única "Caixas e Bancos"; o equivalente é `ContasFinanceirasPage.tsx`. Vou aplicar o dashboard lá. "Limite Disponível" só existe para Cartões, não para contas bancárias — vou substituir esse card por **"Qtd. Contas Ativas"** (informação real disponível).
5. **Fluxo de Caixa** — manter como está (já reestilizado). Não vou adicionar o card opcional "Previsão vs Realizado" para não ampliar o escopo; podemos fazer numa próxima rodada.

## Componente reutilizável

Criar `src/components/CollapsibleDashboard.tsx`:

- Wrap em `Collapsible` (recolhido por padrão).
- Header com título + chevron animado + botão "Expandir/Recolher".
- Lazy-load: `onOpenChange` dispara `onExpand()` apenas na primeira abertura.
- Skeleton enquanto carrega; cache via estado do componente pai.
- Animação suave (`data-[state=open]:animate-accordion-down`).

Criar `src/components/DashboardCard.tsx`:

- Props: `title`, `value`, `icon`, `accent` ('success' | 'info' | 'warning' | 'destructive' | 'primary').
- Border-left colorida conforme `accent` (mesmo padrão dos cards de Fluxo de Caixa).
- Sem trend nesta versão.

## Telas que recebem dashboard


| #   | Página           | Arquivo                                                               |
| --- | ---------------- | --------------------------------------------------------------------- |
| 1   | Contratos        | `src/pages/comercial/` (verificar/criar conforme estrutura existente) |
| 2   | Gestão de Safras | `src/pages/fazenda/SafrasPage.tsx`                                    |
| 3   | Contas           | `src/pages/financeiro/ContasPage.tsx`                                 |
| 4   | Caixas e Bancos  | `src/pages/financeiro/ContasFinanceirasPage.tsx`                      |
| 5   | Fluxo de Caixa   | já feito (sem mudança)                                                |


Para cada uma:

- Adicionar `<CollapsibleDashboard>` acima dos filtros/listagem.
- 4 cards KPI + 1 gráfico de barras (Recharts, padrão do projeto).
- Cálculos rodam só ao expandir; resultado fica em `useState`.

## KPIs e gráficos por tela

**Contratos**: Ativos (count), Volume em Trânsito (ton), Valor em Aberto (R$), Vencidos (count). Gráfico: barras horizontais por status.

**Safras**: Área Plantada (ha), Área Colhida (ha), % Colheita, Custos Acumulados (R$). Gráfico: barras agrupadas Plantado vs Colhido por cultura.

**Contas**: A Pagar (R$), A Receber (R$), Vencido (R$), A Vencer (R$). Gráfico: barras agrupadas A Pagar vs A Receber por mês (próximos 6 meses).

**Caixas e Bancos**: Saldo Total, Saldo Caixa, Saldo Bancos, Qtd. Contas Ativas. Gráfico: barras horizontais — saldo por conta.

## Detalhes técnicos

- Recharts já em uso (`DashboardPage.tsx`) — mesma config: `CartesianGrid stroke-muted`, tooltip com `hsl(var(--card))`, eixos `text-xs`.
- Cores do gráfico via `hsl(var(--chart-1..5))` já definidas.
- Responsividade: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` nos cards; `ResponsiveContainer` no gráfico (altura 256px desktop, reduz no mobile via classes).
- Filtros de empresa/filial seguem o `OrganizationContext` (igual ao resto do app).
- Mock services existentes (`contratoService`, `safraService`, `financeiroContaService`, `financeiroContaFinanceiraService`) — sem mudanças no backend mock; agregações feitas no cliente ao expandir.

## Fora de escopo

- Trends percentuais reais (precisa histórico).
- Drill-down ao clicar nos cards.
- Exportar dashboard.
- Mudanças em `mock-data.ts` ou `services.ts`.  
  
4. **Dashboard "Caixas e Bancos"** — Ficou errado, não é caixas e bancos, essa é a Tela Caixas, ficou caixas e banco, mas é a tela de lançamentos de Caixa... E não nas contas financeiras...   
Pode readaptar para ela 