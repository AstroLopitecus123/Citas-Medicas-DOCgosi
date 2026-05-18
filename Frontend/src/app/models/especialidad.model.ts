

import { EstadoEspecialidad } from './tipos'; 

export class Especialidad {

  id!: number;
  nombre!: string;
  estado!: EstadoEspecialidad;
  fechaCreacion!: string;
  descripcion?: string; 

  constructor(data?: any) {

    if (data) {
      Object.assign(this, data);
    }
  }
}
