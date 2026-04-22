import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SolicitudEmpleo {
  id?: number;
  nombre: string;
  apellido: string;
  correo: string;
  dni: string;
  telefono: string;
  puesto: 'MEDICO' | 'RECEPCION';
  estado?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  mensaje?: string;
  fechaSolicitud?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private apiUrl = `${environment.apiUrl}/api/solicitudes`;

  constructor(private http: HttpClient) {}

  enviarSolicitud(solicitud: SolicitudEmpleo): Observable<SolicitudEmpleo> {
    return this.http.post<SolicitudEmpleo>(this.apiUrl, solicitud);
  }

  listarTodas(): Observable<SolicitudEmpleo[]> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<SolicitudEmpleo[]>(this.apiUrl, { headers });
  }

  procesarSolicitud(id: number, estado: 'APROBADA' | 'RECHAZADA'): Observable<SolicitudEmpleo> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.put<SolicitudEmpleo>(`${this.apiUrl}/${id}/estado`, { estado }, { headers });
  }
}
