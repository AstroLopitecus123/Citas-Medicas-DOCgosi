import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medico } from '../models/medico.model';
import { environment } from '../../environments/environment';
import { UsuarioFull } from '../models/usuario-full.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private apiUrl = `${environment.apiUrl}/api/medicos`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('⚠️ No se encontró token en localStorage.');
      throw new Error('Usuario no autenticado');
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  listarMedicos(): Observable<UsuarioFull[]> {
    return this.http.get<UsuarioFull[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  obtenerPorUsuarioId(usuarioId: number): Observable<Medico> {
    const url = `${this.apiUrl}/usuario/${usuarioId}`;
    const headers = this.getAuthHeaders();
    return this.http.get<Medico>(url, { headers });
  }

  obtenerPorId(id: number): Observable<Medico> {
    return this.http.get<Medico>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  crear(medico: Medico): Observable<Medico> {
    return this.http.post<Medico>(this.apiUrl, medico, { headers: this.getAuthHeaders() });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  asignarEspecialidad(medicoId: number, especialidadId: number): Observable<UsuarioFull> {
    return this.http.put<UsuarioFull>(
      `${this.apiUrl}/${medicoId}/especialidad/${especialidadId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  listarPorEspecialidad(especialidadId: number, fecha: string): Observable<Medico[]> {
    const params = new HttpParams().set('fecha', fecha);

    // Nota: especialidadId va en la URL, no como parámetro
    return this.http.get<Medico[]>(`${this.apiUrl}/especialidad/${especialidadId}`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  listarHorariosDisponibles(medicoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/disponibilidades/medico/${medicoId}`, {
      headers: this.getAuthHeaders()
    });
  }

}
