import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Especialidad } from '../models/especialidad.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {

  private apiUrl = `${environment.apiUrl}/api/especialidades`;

  constructor(private http: HttpClient) {}

  listarEspecialidades(): Observable<Especialidad[]> {
    const token = localStorage.getItem('token') || '';
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<Especialidad[]>(this.apiUrl, { headers });
  }

  obtenerPorId(id: number): Observable<Especialidad> {
    const token = localStorage.getItem('token') || '';
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<Especialidad>(`${this.apiUrl}/${id}`, { headers });
  }

  crear(especialidad: Especialidad): Observable<Especialidad> {
    const token = localStorage.getItem('token') || '';
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post<Especialidad>(this.apiUrl, especialidad, { headers });
  }

  actualizar(id: number, especialidad: Especialidad): Observable<Especialidad> {
    const token = localStorage.getItem('token') || '';
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.put<Especialidad>(`${this.apiUrl}/${id}`, especialidad, { headers });
  }

  eliminar(id: number): Observable<void> {
    const token = localStorage.getItem('token') || '';
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  cambiarEstado(id: number, nuevoEstado: string): Observable<Especialidad> {
    const token = localStorage.getItem('token') || '';
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.put<Especialidad>(
      `${this.apiUrl}/${id}/estado?estado=${nuevoEstado}`,
      {},
      { headers }
    );
  }
}

