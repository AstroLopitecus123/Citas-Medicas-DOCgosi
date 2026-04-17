import { Cita } from './cita.model';

export class Historial {
  id?: number; // ← antes era !
  cita!: Cita;
  fechaRegistro?: string;
  fechaActualizacion?: string;
  diagnostico?: string;
  receta?: string;
  notas?: string;

  constructor(data?: any) {
    if (data) {
      this.id = data.id;
      this.diagnostico = data.diagnostico;
      this.receta = data.receta;
      this.notas = data.notas;
      this.fechaRegistro = data.fechaRegistro;
      this.fechaActualizacion = data.fechaActualizacion;

      if (data.cita) {
        this.cita = new Cita(data.cita);
      }
    }
  }
}
