// --- Archivo: especialidad.model.ts ---

import { EstadoEspecialidad } from './tipos'; // Importa el tipo

export class Especialidad {
  // Propiedades
  id!: number;
  nombre!: string;
  estado!: EstadoEspecialidad;
  fechaCreacion!: string;
  descripcion?: string; // Opcional

  /**
   * Constructor
   */
  constructor(data?: any) {
    // Usamos Object.assign porque esta clase
    // no contiene otras clases anidadas.
    if (data) {
      Object.assign(this, data);
    }
  }
}
