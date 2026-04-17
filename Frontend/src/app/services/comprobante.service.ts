import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Comprobante } from '../models/comprobante.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComprobanteService {
  private apiUrl = `${environment.apiUrl}/api/comprobantes`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  generar(pagoId: number, tipo: string, url: string): Observable<Comprobante> {
    return this.http.post<any>(
      `${this.apiUrl}/generar?pagoId=${pagoId}&tipo=${tipo}&url=${url}`,
      {},
      { headers: this.getHeaders() }
    ).pipe(map(res => new Comprobante(res)));
  }
}
