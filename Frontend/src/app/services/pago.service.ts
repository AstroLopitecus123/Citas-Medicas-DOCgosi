import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Pago } from '../models/pago.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  private apiUrl = `${environment.apiUrl}/api/pagos`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // 🔹 Pago en efectivo
  pagarEfectivo(body: {
    citaId: number;
    usuarioId: number;
    monto: number;
  }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/efectivo`,   // <--- ESTA ERA LA URL CORRECTA
      body,
      { headers: this.getHeaders() }
    );
  }

  // =======================================================
  // 🔹 PAGO CON TARJETA (RequestBody)
  // =======================================================
  pagarTarjeta(body: {
    citaId: number;
    usuarioId: number;
    monto: number;
    referencia: string;
    exito: boolean;
  }): Observable<Pago> {

    return this.http.post<Pago>(
      `${this.apiUrl}/tarjeta`,
      body,
      { headers: this.getHeaders() }
    );
  }

  // =======================================================
  // 🔹 Obtener pagos por cita
  // =======================================================
  obtenerPagosPorCita(citaId: number): Observable<Pago[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/cita/${citaId}`,
      { headers: this.getHeaders() }
    ).pipe(map(data => data.map(p => new Pago(p))));
  }

  // =======================================================
  // 🔹 Anular pago
  // =======================================================
  anularPago(pagoId: number): Observable<Pago> {
    return this.http.put<any>(
      `${this.apiUrl}/anular/${pagoId}`,
      {},
      { headers: this.getHeaders() }
    ).pipe(map(res => new Pago(res)));
  }
}
