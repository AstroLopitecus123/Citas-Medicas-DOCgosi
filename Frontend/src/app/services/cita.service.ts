import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita } from '../models/cita.model';
import { Medico } from '../models/medico.model';
import { Especialidad } from '../models/especialidad.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Usuario no autenticado');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  // CITAS
  listarTodas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/citas`, { headers: this.getAuthHeaders() });
  }

  obtenerPorId(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.apiUrl}/citas/${id}`, { headers: this.getAuthHeaders() });
  }

  listarPorUsuario(idUsuario: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/citas/usuario/${idUsuario}`, { headers: this.getAuthHeaders() });
  }

  listarPorMedico(idMedico: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/citas/medico/${idMedico}`, { headers: this.getAuthHeaders() });
  }

  crear(cita: Cita): Observable<Cita> {
    return this.http.post<Cita>(`${this.apiUrl}/citas`, cita, { headers: this.getAuthHeaders() });
  }

  confirmarCita(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/citas/${id}/confirmar`, {}, {
      headers: this.getAuthHeaders(),
      responseType: 'text' as 'json'
    });
  }

  reprogramarCita(id: number, cita: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/citas/${id}/reprogramar`, cita, {
    headers: this.getAuthHeaders(),
    responseType: 'text' as 'json'
  });
}

  cancelarCita(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/citas/${id}/cancelar`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  solicitarReprogramar(id: number, cita: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/citas/${id}/solicitar-reprogramar`, cita, {
      headers: this.getAuthHeaders()
    });
  }

  confirmarReprogramar(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/citas/${id}/confirmar-reprogramar`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  solicitarCancelar(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/citas/${id}/solicitar-cancelar`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  confirmarCancelar(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/citas/${id}/confirmar-cancelar`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // MÉDICOS Y ESPECIALIDADES
  listarMedicosPorEspecialidad(especialidadId: number): Observable<Medico[]> {
    return this.http.get<Medico[]>(`${this.apiUrl}/medicos/especialidad/${especialidadId}`, { headers: this.getAuthHeaders() });
  }

  listarHorariosDisponibles(medicoId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/medicos/${medicoId}/horarios`, { headers: this.getAuthHeaders() });
  }

  listarEspecialidades(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(`${this.apiUrl}/especialidades`, { headers: this.getAuthHeaders() });
  }
}
