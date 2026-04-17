import { Injectable } from '@angular/core';
import { DisponibilidadService } from '../services/disponibilidad.service';
import { Disponibilidad } from '../models/disponibilidad.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GestionarDisponibilidadController {

  constructor(private disponibilidadService: DisponibilidadService) {}

  listarPorMedico(medicoId: number): Observable<Disponibilidad[]> {
    return this.disponibilidadService.listarPorMedico(medicoId);
  }

  listarPorRango(medicoId: number, inicio: string, fin: string): Observable<Disponibilidad[]> {
    return this.disponibilidadService.listarPorRango(medicoId, inicio, fin);
  }

  guardarDisponibilidades(disponibilidades: Disponibilidad[]): Observable<Disponibilidad[]> {
    // Lógica adicional opcional antes de enviar al service
    return this.disponibilidadService.guardarDisponibilidades(disponibilidades);
  }

  eliminarPorRango(medicoId: number, inicio: string, fin: string): Observable<void> {
    return this.disponibilidadService.eliminarPorRango(medicoId, inicio, fin);
  }
}
