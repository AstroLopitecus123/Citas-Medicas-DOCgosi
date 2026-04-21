import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NominaRequest {
  empleadoId: number;
  monto: number;
  tipoPeriodo: string;
  fechaInicioPeriodo: string;
  fechaFinPeriodo: string;
  descripcion: string;
}

export interface NominaResponse {
  id: number;
  empleadoId: number;
  empleadoNombre: string;
  empleadoRol: string;
  monto: number;
  tipoPeriodo: string;
  fechaInicioPeriodo: string;
  fechaFinPeriodo: string;
  estado: string;
  fechaPago?: string;
  descripcion?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class NominaService {
  private apiUrl = `${environment.apiUrl}/api/nominas`;

  constructor(private http: HttpClient) {}

  private headers() {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  crearNomina(req: NominaRequest): Observable<NominaResponse> {
    return this.http.post<NominaResponse>(this.apiUrl, req, { headers: this.headers() });
  }

  pagarNomina(id: number): Observable<NominaResponse> {
    return this.http.put<NominaResponse>(`${this.apiUrl}/${id}/pagar`, {}, { headers: this.headers() });
  }

  obtenerTodas(): Observable<NominaResponse[]> {
    return this.http.get<NominaResponse[]>(this.apiUrl, { headers: this.headers() });
  }

  misNominas(usuarioId: number): Observable<NominaResponse[]> {
    return this.http.get<NominaResponse[]>(`${this.apiUrl}/mis-nominas/${usuarioId}`, { headers: this.headers() });
  }
}
