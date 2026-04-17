import { RolUsuario, EstadoUsuario } from './tipos';
import { Pais } from './pais.model';
import { Especialidad } from './especialidad.model';

export class UsuarioFull {
  medicoId: number = 0;               // ⚡ ID de la tabla Medico
  id: number = 0;                      // ID del usuario
  nombre: string = '';
  apellido: string = '';
  correo: string = '';
  rol: RolUsuario = 'PACIENTE';
  fechaRegistro: string = new Date().toISOString();
  estado: EstadoUsuario = 'ACTIVADO';
  telefono: string = '';
  fechaNacimiento: string = '';
  dni: string = '';
  pais: Pais = new Pais();
  especialidad?: Especialidad;         // ⚡ la asignada al médico
  especialidadSeleccionada?: Especialidad; // para el select en el frontend

  constructor(data?: any) {
    if (data) {
      // ⚡ data puede ser un Medico con un objeto usuario dentro
      const usuario = data.usuario ?? data;

      // ⚡ IDs
      this.medicoId = data.id ?? 0;   // ID de la tabla Medico
      this.id = usuario.id ?? 0;      // ID del usuario

      // ⚡ Datos del usuario
      this.nombre = usuario.nombre ?? '';
      this.apellido = usuario.apellido ?? '';
      this.correo = usuario.correo ?? '';
      this.rol = usuario.rol ?? 'PACIENTE';
      this.fechaRegistro = usuario.fechaRegistro ?? new Date().toISOString();
      this.estado = usuario.estado ?? 'ACTIVADO';
      this.telefono = usuario.telefono ?? '';
      this.fechaNacimiento = usuario.fechaNacimiento ?? '';
      this.dni = usuario.dni ?? '';
      this.pais = new Pais(usuario.pais);

      // ⚡ Especialidad del médico
      this.especialidad = data.especialidad ?? undefined;
      this.especialidadSeleccionada = this.especialidad;
    }
  }
}
