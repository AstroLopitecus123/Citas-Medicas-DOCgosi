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

  /**
   * ✅ Registrar nuevo historial médico
   * POST /api/historiales/{citaId}
   */
  registrarHistorial(citaId: number, historial: Partial<Historial>): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${citaId}`,
      historial,
      { headers: this.getAuthHeaders(), responseType: 'text' as 'json' }
    );
  }

  /**
   * ✅ Obtener historial por cita
   * GET /api/historiales/cita/{citaId}
   */
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
      // 👇 Evita que aparezca cualquier 404 en consola
      if (err.status === 404) {
        return of(null);
      }
      // Si no es 404, también lo silenciamos (para evitar logs molestos)
      return of(null);
    })
  );
}

  /**
   * ✅ Listar todos los historiales (solo para administración)
   * GET /api/historiales
   */
  listarHistoriales(): Observable<Historial[]> {
    return this.http.get<Historial[]>(
      this.apiUrl,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * ✅ Actualizar historial (si el médico quiere editarlo)
   * PUT /api/historiales/{id}
   */
  actualizarHistorial(id: number, historial: Partial<Historial>): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      historial,
      { headers: this.getAuthHeaders(), responseType: 'text' as 'json' }
    );
  }

  /**
   * ✅ Eliminar historial (opcional, solo admin)
   * DELETE /api/historiales/{id}
   */
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
}