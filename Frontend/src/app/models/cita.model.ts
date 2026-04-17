import { UsuarioFull } from './usuario-full.model';
import { Medico } from './medico.model';
import { EstadoCita } from './tipos';
import { Historial } from './historial.model';
import { Pago } from './pago.model';


export type EstadoPago = 'PENDIENTE' | 'PAGADO' | 'RECHAZADO';

export class Cita {
  id!: number;
  paciente!: UsuarioFull;
  medico!: Medico;
  fecha!: string;
  estado!: EstadoCita;
  fechaCreacion!: string;
  fechaActualizacion!: string;
  motivo?: string;
  historial?: Historial;
  tieneHistorial: boolean = false;
  pago?: Pago;


  // ➕ Nuevo
  estadoPago!: EstadoPago;
  monto?: number;
  metodoPago?: string;
  transaccionId?: string;
  fechaPago?: string;

  menuAbierto?: boolean = false;

  constructor(data?: any) {
    this.id = 0;
    this.fecha = '';
    this.estado = 'PENDIENTE';
    this.estadoPago = 'PENDIENTE';  // ⭐ default
    this.motivo = '';
    this.fechaCreacion = '';
    this.fechaActualizacion = '';
    this.paciente = new UsuarioFull();
    this.medico = new Medico();

    if (data) {
      this.id = data.id ?? this.id;
      this.fecha = data.fecha ?? this.fecha;
      this.estado = data.estado ?? this.estado;
      this.estadoPago = data.estadoPago ?? this.estadoPago;

      this.motivo = data.motivo ?? this.motivo;
      this.fechaCreacion = data.fechaCreacion ?? this.fechaCreacion;
      this.fechaActualizacion =
        data.fechaActualizacion ?? this.fechaActualizacion;

      // 🧾 Datos de pago
      this.monto = data.monto ?? this.monto;
      this.metodoPago = data.metodoPago ?? this.metodoPago;
      this.transaccionId = data.transaccionId ?? this.transaccionId;
      this.fechaPago = data.fechaPago ?? this.fechaPago;

      // 👤 Paciente
      this.paciente = data.paciente
        ? new UsuarioFull(data.paciente)
        : new UsuarioFull();

      // 🩺 Medico
      this.medico = data.medico ? new Medico(data.medico) : new Medico();
      if (!this.medico.usuario) {
        this.medico.usuario = new UsuarioFull();
      }

      this.menuAbierto = data.menuAbierto ?? false;
    }
  }
}
