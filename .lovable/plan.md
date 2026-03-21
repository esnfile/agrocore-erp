

# Plan: Replace MAX/MIN with Explicit Weighing Types (ENTRADA/SAIDA)

## Problem
`recalcularPesos` uses `Math.max/Math.min` across all weighings, which is semantically wrong. The system must use the explicit `tipoPesagem` field to determine which weighing is Bruto (ENTRADA) and which is Tara (SAIDA).

## Changes

### 1. Service Layer — `services.ts`

**a) Replace `recalcularPesos` logic (line ~2823-2838)**
- Instead of `MAX/MIN`, find the pesagem with `tipoPesagem === "ENTRADA"` → its `peso` = `pesoBruto`
- Find pesagem with `tipoPesagem === "SAIDA"` → its `peso` = `pesoTara`
- `pesoLiquido = pesoBruto - pesoTara`
- If either is missing, set the available one and leave the rest at 0

**b) Update `editarPesagem` to also accept `novoTipo` parameter (line ~2865)**
- Add optional `novoTipo?: TipoPesagem` parameter
- When provided, update `pesagem.tipoPesagem = novoTipo`
- Validate: if changing type, check no duplicate type exists (e.g., can't have 2 ENTRADAs)
- Continue calling `recalcularPesos` after

**c) Update `romaneioPesagemService.salvar` — block duplicates**
- Before creating, check if a pesagem with the same `tipoPesagem` already exists for this romaneio
- If yes, return error: "Já existe uma pesagem de ENTRADA/SAIDA registrada. Edite a existente."

**d) Update `romaneioService.finalizar` validation (line ~2751)**
- Replace `pesagens.length < 2` check with: must have exactly 1 ENTRADA and 1 SAIDA
- Add warning if ENTRADA peso < SAIDA peso

### 2. Romaneios Page — `RomaneiosPage.tsx`

**a) Pesagem edit inline (line ~794-830) — add Type editing**
- Add a `Select` for tipo (ENTRADA/SAIDA) next to the peso input when editing
- New state: `editPesagemTipo` to track the edited type
- Pass both `novoPeso` and `novoTipo` to `editarPesagem`

**b) Update pesagem list display (line ~790-837)**
- Show icons: ⬇️ for ENTRADA, ⬆️ for SAIDA
- Badge already shows tipo — enhance with arrow icons

**c) Update "Registrar Pesagem" button — disable when 2 pesagens exist**
- Check pesagens array: if already has 1 ENTRADA + 1 SAIDA, hide/disable the button
- Show message: "Pesagens completas (1 Entrada + 1 Saída). Use edição para corrigir."

**d) Update finalizarRomaneio validation (line ~304-314)**
- Check for exactly 1 ENTRADA + 1 SAIDA instead of `pesagens.length < 2`
- Show specific error if ENTRADA < SAIDA: "Peso de entrada menor que saída"

**e) Update calculated summary (line ~842-851)**
- Label Bruto as "(Pesagem ENTRADA)" and Tara as "(Pesagem SAÍDA)"

### 3. Mock Data — `mock-data.ts`
No structural changes needed — `RomaneioPesagem` already has `tipoPesagem: TipoPesagem` field.

## Files Modified
1. `src/lib/services.ts` — `recalcularPesos`, `editarPesagem`, `salvar` (pesagem), `finalizar` (romaneio)
2. `src/pages/romaneios/RomaneiosPage.tsx` — edit UI, validation, display

## Validation Checklist
- Modal has mandatory "Tipo de Pesagem" dropdown (already exists)
- Pesagens listed with ⬇️/⬆️ icons
- Calculation uses types, NOT MAX/MIN
- Blocks registration if 1 ENTRADA + 1 SAIDA already exist
- Warning if ENTRADA < SAIDA
- Edit allows changing Type
- Finalization blocked without exactly 1 ENTRADA + 1 SAIDA

