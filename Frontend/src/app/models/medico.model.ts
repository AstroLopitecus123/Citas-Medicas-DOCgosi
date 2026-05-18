

import { UsuarioFull } from './usuario-full.model';
import { Especialidad } from './especialidad.model'; 

import { EstadoMedico } from './tipos';

export class Medico {

  id!: number;
  usuario!: UsuarioFull;       
  especialidad?: Especialidad; 
  estado?: EstadoMedico;
  fechaCreacion?: string;

  constructor(data?: any) {
    if (data) {

      this.id = data.id ?? 0;
      this.estado = data.estado;
      this.fechaCreacion = data.fechaCreacion;

      if (data.usuario) {
        this.usuario = new UsuarioFull(data.usuario);
      }

      if (data.especialidad) {

        this.especialidad = new Especialidad(data.especialidad);
      }
    }
  }

}
