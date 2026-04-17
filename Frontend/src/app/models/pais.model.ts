// --- Archivo: pais.model.ts ---

import { EstadoPais } from './tipos'; 

export class Pais {
  id: number = 0;
  nombre: string = '';
  prefijoTelefono: string = '';
  estado: EstadoPais = 'ACTIVO'; // Valor por defecto si aplica

  constructor(data?: any) {
    if (data) {
      this.id = data.id ?? 0;
      this.nombre = data.nombre ?? '';
      this.prefijoTelefono = data.prefijoTelefono ?? '';
      this.estado = data.estado ?? 'ACTIVO';
    }
  }
}
