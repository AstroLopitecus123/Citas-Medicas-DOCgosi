import { Medico } from './medico.model';
import { EstadoDisponibilidad } from './tipos';

export class Disponibilidad {

  id!: number;
  medico!: Medico;
  fecha!: string;         // yyyy-mm-dd
  horaInicio!: string;    // HH:mm:ss
  horaFin!: string;       // HH:mm:ss
  estado!: EstadoDisponibilidad;
  fechaCreacion!: string;

  constructor(data?: any) {
    if (data) {
      this.id = data.id ?? 0;
      this.fecha = data.fecha ?? '';
      this.horaInicio = data.horaInicio ?? '';
      this.horaFin = data.horaFin ?? '';

      // Convertir string del backend a enum, si existe
      if (data.estado) {
        if (Object.values(EstadoDisponibilidad).includes(data.estado)) {
          this.estado = data.estado as EstadoDisponibilidad;
        } else {
          this.estado = EstadoDisponibilidad.NO_DISPONIBLE;
        }
      } else {
        this.estado = EstadoDisponibilidad.NO_DISPONIBLE;
      }

      this.fechaCreacion = data.fechaCreacion ?? new Date().toISOString();

      if (data.medico) {
        this.medico = new Medico(data.medico);
      }
    } else {
      this.estado = EstadoDisponibilidad.NO_DISPONIBLE;
      this.fechaCreacion = new Date().toISOString();
    }
  }

  // ---------------------
  // Formateo de horas
  // ---------------------
  get horaInicioFormateada(): string {
    return this.formatearHora(this.horaInicio);
  }

  get horaFinFormateada(): string {
    return this.formatearHora(this.horaFin);
  }

  private formatearHora(hora: string): string {
    const [h, m] = hora.split(':').map(Number);
    const ampm = h >= 12 ? 'p.m.' : 'a.m.';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  }
}
