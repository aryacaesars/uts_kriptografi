// Titik integrasi untuk modul Anggota 3; tidak menyediakan implementasi/dummy Hill.
let hillModule = null;

export function registerHillModule(module) {
  for (const name of ["encryptHill", "decryptHill", "validateHillMatrix"]) {
    if (typeof module[name] !== "function") throw new Error(`Modul Hill harus mengekspor ${name}.`);
  }
  hillModule = module;
}

export function getHillModule() { return hillModule; }
