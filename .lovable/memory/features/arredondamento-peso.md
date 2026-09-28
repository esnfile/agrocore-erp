---
name: Arredondamento de peso
description: PLSL/peso classificado gravados em kg inteiro (half-even) na gravação, nunca só na exibição
type: feature
---
- PLSL, pesoClassificado e totalPesoDescontado são arredondados para kg inteiro no ponto de gravação (romaneioService.salvar), regra half-even.
- Exibição não arredonda por conta própria: contratado − entregue = saldo sempre fecha na tela.
- Ex.: 24.377,5 kg → grava 24.378; contrato 100.000 → saldo 75.622.
