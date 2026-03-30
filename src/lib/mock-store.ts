// ============================================================
// AgroERP — In-Memory Mutable Store for Mock Data
// Allows changes to persist across page navigations during session
// ============================================================
import {
  descontoTipos as initialDescontoTipos,
  descontoEmpresaConfigs as initialDescontoEmpresaConfigs,
} from "./mock-data";
import type { DescontoTipo, DescontoEmpresaConfig } from "./mock-data";

// Mutable copies that persist across component mounts
let _descontoTipos: DescontoTipo[] = [...initialDescontoTipos];
let _descontoEmpresaConfigs: DescontoEmpresaConfig[] = [...initialDescontoEmpresaConfigs];

export const descontoStore = {
  getDescontoTipos(): DescontoTipo[] {
    return _descontoTipos;
  },
  setDescontoTipos(items: DescontoTipo[]) {
    _descontoTipos = items;
  },
  getDescontoEmpresaConfigs(): DescontoEmpresaConfig[] {
    return _descontoEmpresaConfigs;
  },
  setDescontoEmpresaConfigs(items: DescontoEmpresaConfig[]) {
    _descontoEmpresaConfigs = items;
  },
};
