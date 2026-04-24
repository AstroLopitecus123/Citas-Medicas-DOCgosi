
import { RolUsuario, EstadoUsuario } from './tipos';

export class Usuario {

  correo!: string;
  id?: number;
  nombre?: string;
  apellido?: string;
  contrasena?: string;
  rol?: RolUsuario;
  fechaRegistro?: string;
  estado?: EstadoUsuario;
  paisId?: number;
  telefono?: string;
  fechaNacimiento?: string;
  dni?: string;
  correoUsuario?: string; // Propiedad extra para el formulario
  configuracionVisual?: string;
  constructor(data?: any) {
    if (data) {
      Object.assign(this, data);
    }
  }

}

export class LoginResponse {
  token?: string;
  id?: number;
  nombre?: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  fechaNacimiento?: string;
  dni?: string;
  paisNombre?: string;
  rol?: string;

  constructor(data?: any) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

