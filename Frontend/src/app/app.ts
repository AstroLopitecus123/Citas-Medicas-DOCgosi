import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Usuario, LoginResponse, RolUsuario } from './models/tipos';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'Frontend Citas';
  usuario: Usuario | null = null;
  isLoggedIn = false;
  mostrarModal = false;
  loginActualizado$ = new Subject<void>();


  constructor(private router: Router, private http: HttpClient) {
  this.verificarLogin();

  // 🔥 Escuchar el evento de login y refrescar datos
  this.loginActualizado$.subscribe(() => {
    console.log("🔥 Login detectado — actualizando header sin recargar");
    this.verificarLogin();
  });
}


  abrirModalCerrarSesion() {
    this.mostrarModal = true;
  }

  cancelarCerrarSesion() {
    this.mostrarModal = false;
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    sessionStorage.clear();

    this.usuario = null;
    this.isLoggedIn = false;
    this.mostrarModal = false;

    this.router.navigate(['/']);
  }

  verificarLogin() {
    const usuarioStr = localStorage.getItem('usuario');
    console.log('⏳ Valor raw de localStorage usuario:', usuarioStr);

    if (usuarioStr) {
      try {
        const parsedUsuario: Usuario = JSON.parse(usuarioStr);
        console.log('✅ Usuario parseado:', parsedUsuario);

        // Normaliza rol
        parsedUsuario.rol = this.normalizarRol(parsedUsuario.rol);
        console.log('🔹 Rol normalizado:', parsedUsuario.rol);

        this.usuario = parsedUsuario;
        this.isLoggedIn = true;
      } catch (e) {
        console.error('❌ Error al parsear usuario desde localStorage', e);
        this.usuario = null;
        this.isLoggedIn = false;
      }
    } else {
      console.log('⚠️ No hay usuario en localStorage');
      this.usuario = null;
      this.isLoggedIn = false;
    }
  }

  private normalizarRol(rol?: string): RolUsuario {
    console.log('🎯 Rol recibido para normalizar:', rol);
    const rolUpper = rol?.toUpperCase();
    if (
      rolUpper === 'ADMIN' ||
      rolUpper === 'MEDICO' ||
      rolUpper === 'RECEPCION' ||
      rolUpper === 'PACIENTE'
    ) {
      console.log('✅ Rol válido:', rolUpper);
      return rolUpper as RolUsuario;
    }
    console.log('⚠️ Rol inválido, asignando PACIENTE');
    return 'PACIENTE';
  }

  login(datos: { correo: string; contrasena: string }): Observable<LoginResponse> {
  console.log('🚀 Intentando login con:', datos);

  return this.http.post<LoginResponse>(`/api/auth/login`, datos).pipe(
    tap(res => {
      console.log('📥 Respuesta del backend:', res);

      if (res.token) {
        localStorage.setItem('token', res.token);
        console.log('✅ Token guardado:', res.token);
      }

      if (res.usuario) {
        console.log('📌 Usuario recibido del backend:', res.usuario);

        res.usuario.rol = this.normalizarRol(res.usuario.rol);
        console.log('🔹 Rol normalizado antes de guardar:', res.usuario.rol);

        localStorage.setItem('usuario', JSON.stringify(res.usuario));

        // 🔥 ACTUALIZACIÓN INMEDIATA
        this.usuario = { ...res.usuario };
        this.isLoggedIn = true;

        // 🔥 EMITIR QUE SE LOGGEÓ (EL HEADER SE ACTUALIZA SIN RECARGAR)
        this.loginActualizado$.next();
      }
    })
  );
}


  onRouteChange(component: any) {
    // Si el componente tiene el evento loginExitoso, nos suscribimos
    if (component?.loginExitoso) {
      component.loginExitoso.subscribe(() => {
        console.log("🔥 Login detectado — actualizando usuario sin recargar");
        this.verificarLogin();
      });
    }
  }
}
