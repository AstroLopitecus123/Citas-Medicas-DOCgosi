import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  fechaCreacion: string;
  leida: boolean;
  rolDestino: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {

  private apiUrl = `${environment.apiUrl}/api/notificaciones`;
  private refresh$ = new Subject<void>();

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('token') || '';
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  // Permite suscribirse a actualizaciones desde cualquier componente
  get refreshObservable() {
    return this.refresh$.asObservable();
  }

  // Notifica a los suscriptores que deben refrescar conteos
  notificarCambio() {
    this.refresh$.next();
  }

  getMisNotificaciones(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(this.apiUrl, this.getHeaders());
  }

  contarNoLeidas(): Observable<{ cantidad: number }> {
    return this.http.get<{ cantidad: number }>(`${this.apiUrl}/no-leidas`, this.getHeaders());
  }

  marcarComoLeida(id: number): Observable<Notificacion> {
    return this.http.put<Notificacion>(`${this.apiUrl}/${id}/leer`, {}, this.getHeaders());
  }
}
