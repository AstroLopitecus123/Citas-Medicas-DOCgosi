export type RolUsuario = 'ADMIN' | 'MEDICO' | 'PACIENTE' | 'RECEPCION';
export type EstadoUsuario = 'ACTIVADO' | 'DESACTIVADO';
export type EstadoPais = 'ACTIVO' | 'INACTIVO';
export type EstadoMedico = 'ACTIVO' | 'INACTIVO';
export type EstadoEspecialidad = 'ACTIVA' | 'INACTIVA';

export enum EstadoDisponibilidad {
  DISPONIBLE = 'DISPONIBLE',
  NO_DISPONIBLE = 'NO_DISPONIBLE',
}

export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'REPROGRAMADA' | 'CANCELADA' | 'SOLICITUD_REPROGRAMACION' | 'SOLICITUD_CANCELACION';

export interface Usuario {
  id?: number;
  nombre?: string;
  correo?: string;
  rol?: RolUsuario;
  [key: string]: any;
}

export interface LoginResponse {
  token?: string;
  usuario?: Usuario;
}
