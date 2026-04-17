// src/app/services/pais.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pais } from '../models/pais.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaisService {
  private apiUrl = `${environment.apiUrl}/api/paises`;

  constructor(private http: HttpClient) {}

  // Listar todos los países
  listar(): Observable<Pais[]> {
    return this.http.get<Pais[]>(this.apiUrl);
  }

  // Obtener un país por ID
  obtenerPorId(id: number): Observable<Pais> {
    return this.http.get<Pais>(`${this.apiUrl}/${id}`);
  }

  // Crear un país
  crear(pais: Omit<Pais, 'id'>): Observable<Pais> {
    return this.http.post<Pais>(this.apiUrl, pais);
  }

  // Actualizar un país
  actualizar(id: number, pais: Omit<Pais, 'id'>): Observable<Pais> {
    return this.http.put<Pais>(`${this.apiUrl}/${id}`, pais);
  }

  // Eliminar un país
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
