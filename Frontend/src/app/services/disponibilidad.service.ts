import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Disponibilidad } from '../models/disponibilidad.model';
import { environment } from '../../environments/environment';
import { map } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadService {
  private apiUrl = `${environment.apiUrl}/api/disponibilidades`;

  constructor(private http: HttpClient) { }

  listarPorMedico(medicoId: number): Observable<Disponibilidad[]> {
    return this.http.get<any[]>(`${this.apiUrl}/medico/${medicoId}`)
      .pipe(map(data => data.map(d => new Disponibilidad(d))));
  }

  listarPorRango(medicoId: number, inicio: string, fin: string): Observable<Disponibilidad[]> {
    const token = localStorage.getItem('token') || '';
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<Disponibilidad[]>(
      `${this.apiUrl}/medico/${medicoId}/rango?inicio=${inicio}&fin=${fin}`,
      { headers }
    ).pipe(map(res => res.map(d => new Disponibilidad(d))));
  }

  guardarDisponibilidades(disponibilidades: Disponibilidad[]): Observable<Disponibilidad[]> {
    const medicoId = disponibilidades[0].medico.id;
    const token = localStorage.getItem('token') || '';

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<any[]>(`${this.apiUrl}/medico/${medicoId}`, disponibilidades, { headers })
      .pipe(map(data => data.map(d => new Disponibilidad(d))));
  }


  eliminarPorRango(medicoId: number, inicio: string, fin: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/medico/${medicoId}/rango?inicio=${inicio}&fin=${fin}`);
  }
}
