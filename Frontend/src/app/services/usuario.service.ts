import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginResponse, Usuario } from '../models/usuario.model';
import { UsuarioFull } from '../models/usuario-full.model';
import { environment } from '../../environments/environment';
import { Pais } from '../models/pais.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private usuariosUrl = `${environment.apiUrl}/api/usuarios`;
  private authUrl = `${environment.apiUrl}/auth`;

  // 🆕 OBSERVABLE GLOBAL DEL USUARIO
  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.cargarUsuarioLocalStorage());
  usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {}

  // 🆕 Cargar usuario desde localStorage al iniciar la app
  private cargarUsuarioLocalStorage(): Usuario | null {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
  }

  listarUsuarios(): Observable<UsuarioFull[]> {
    const token = localStorage.getItem('token') || '';
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<UsuarioFull[]>(this.usuariosUrl, { headers });
  }

  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.authUrl}/registro`, usuario);
  }

  eliminarUsuario(id: number): Observable<string> {
    const token = localStorage.getItem('token') || '';
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.delete(`${this.usuariosUrl}/${id}`, { headers, responseType: 'text' });
  }

  actualizarEstado(id: number, nuevoEstado: string): Observable<any> {
    return this.http.put(`${this.usuariosUrl}/${id}/estado`, { estado: nuevoEstado });
  }

  actualizarRol(id: number, nuevoRol: string): Observable<any> {
    const token = localStorage.getItem('token') || '';
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.put(`${this.usuariosUrl}/${id}/rol`, { rol: nuevoRol }, { headers });
  }

  // 🆙 LOGIN ADAPTADO + BehaviorSubject
  login(datos: { correo: string, contrasena: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, datos)
      .pipe(
        tap(res => {

          // Guardar token
          if (res.token) {
            localStorage.setItem('token', res.token);
          }

          // Guardar usuario y enviar al observable global
          if (res.usuario) {

            // Normalizar rol
            const rolBackend = res.usuario.rol?.toUpperCase();
            if (rolBackend === 'ADMIN' || rolBackend === 'MEDICO' || rolBackend === 'RECEPCION') {
              res.usuario.rol = rolBackend;
            } else {
              res.usuario.rol = 'PACIENTE';
            }

            // Guardar localmente
            localStorage.setItem('usuario', JSON.stringify(res.usuario));

            // 🆕 Notificar a toda la app
            this.usuarioSubject.next(res.usuario);
          }
        })
      );
  }

  actualizarUsuario(usuario: UsuarioFull): Observable<UsuarioFull> {
    const token = localStorage.getItem('token') || '';
    const headers = { Authorization: `Bearer ${token}` };

    return this.http.put<UsuarioFull>(`${this.usuariosUrl}/${usuario.id}`, usuario, { headers });
  }

  listarPaises(): Observable<Pais[]> {
    return this.http.get<Pais[]>(`${environment.apiUrl}/api/paises`);
  }

  obtenerUsuario(id: number) {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    return this.http.get<Usuario>(`${environment.apiUrl}/api/usuarios/${id}`, { headers });
  }

  recuperarContrasena(correo: string): Observable<any> {
    return this.http.post(`${this.authUrl}/recuperar`, { correo });
  }

  restablecerContrasena(token: string, nuevaContrasena: string): Observable<any> {
    return this.http.post(`${this.authUrl}/restablecer`, { token, nuevaContrasena });
  }
}
