import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Historial } from '../models/historial.model';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private apiUrl = `${environment.apiUrl}/api/historiales`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  registrarHistorial(citaId: number, historial: Partial<Historial>): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${citaId}`,
      historial,
      { headers: this.getAuthHeaders(), responseType: 'text' as 'json' }
    );
  }

  obtenerHistorialPorCita(citaId: number): Observable<Historial | null> {
  return this.http.get<Historial>(
    `${this.apiUrl}/cita/${citaId}`,
    {
      headers: this.getAuthHeaders(),
      observe: 'body',
      responseType: 'json'
    }
  ).pipe(
    catchError((err) => {

      if (err.status === 404) {
        return of(null);
      }

      return of(null);
    })
  );
}

  listarHistoriales(): Observable<Historial[]> {
    return this.http.get<Historial[]>(
      this.apiUrl,
      { headers: this.getAuthHeaders() }
    );
  }

  actualizarHistorial(id: number, historial: Partial<Historial>): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      historial,
      { headers: this.getAuthHeaders(), responseType: 'text' as 'json' }
    );
  }

  eliminarHistorial(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders(), responseType: 'text' as 'json' }
    );
  }

  obtenerPorCita(citaId: number): Observable<Historial> {
    return this.http.get<Historial>(
      `${this.apiUrl}/cita/${citaId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  obtenerHistorialPorPaciente(pacienteId: number): Observable<Historial[]> {
    return this.http.get<Historial[]>(
      `${this.apiUrl}/paciente/${pacienteId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  listarTodasConCitas(): Observable<Historial[]> {
    return this.http.get<Historial[]>(
      `${this.apiUrl}/todas-con-citas`,
      { headers: this.getAuthHeaders() }
    );
  }
}