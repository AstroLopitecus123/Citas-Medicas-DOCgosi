import { Component, ViewEncapsulation } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Usuario, LoginResponse, RolUsuario } from './models/tipos';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { ChatbotComponent } from './components/chatbot/chatbot';
import { ToastComponent } from './components/toast/toast';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, ChatbotComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'RETO Salud';
  usuario: Usuario | null = null;
  isLoggedIn = false;
  mostrarModal = false;
  loading = false;
  isMenuOpen = false;
  loginActualizado$ = new Subject<void>();
  isPanelRoute = false;


  constructor(
    private router: Router, 
    private http: HttpClient,
    private ns: NotificationService
  ) {
    this.verificarLogin();
    
    // 🛡️ Inicialización forzada usando el pathname real del navegador
    this.actualizarEstadoPanel(window.location.pathname);

    // ⏱️ Control de Animación de Transición de Página (Smart Context Detection)
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // Determinamos si la nueva ruta es del panel
        const willBePanelRoute = this.checkIfUrlIsPanel(event.url);
        
        // 🔄 Solo mostramos el loader si cambiamos de contexto (de Home a Panel o viceversa)
        // O si es la carga inicial de la aplicación
        if (this.isPanelRoute !== willBePanelRoute || event.id === 1) {
          this.loading = true;
          console.log('🚀 Cambio de contexto detectado — Activando Preloader Premium');
        }
      } 
      else if (event instanceof NavigationEnd) {
        // Al terminar, actualizamos el estado real y ocultamos el loader con un pequeño delay para suavidad
        this.actualizarEstadoPanel(event.urlAfterRedirects);
        setTimeout(() => {
          this.loading = false;
        }, 800);
      } 
      else if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.loading = false;
      }
    });

    // 🔥 Escuchar el evento de login y refrescar datos
    this.loginActualizado$.subscribe(() => {
      console.log("🔥 Login detectado — actualizando header sin recargar");
      this.verificarLogin();
    });
  }


  abrirModalCerrarSesion() {
    this.mostrarModal = true;
    this.isMenuOpen = false; // Cierra el menú en móvil si estaba abierto
  }

  cancelarCerrarSesion() {
    this.mostrarModal = false;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  cerrarSesion() {
    this.mostrarModal = false;
    this.ns.info('Cerrando sesión...');

    // 🚀 Primero navegamos al Home para evitar errores en componentes del Dashboard que dependen del usuario
    this.router.navigate(['/']).then(() => {
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
      sessionStorage.clear();

      this.usuario = null;
      this.isLoggedIn = false;
      console.log('✅ Sesión limpiada correctamente tras navegación');
    });
  }

  // Helper para verificar si una URL pertenece a la interfaz de paneles
  private checkIfUrlIsPanel(url: string): boolean {
    const panelKeywords = [
      '/admin', '/medico', '/recepcion', '/paciente', 
      '/mis-citas', '/mi-historial', '/mi-perfil', 
      '/usuarios', '/medicos', '/especialidades', 
      '/checkout', '/pagar-tarjeta', '/gestionar-disponibilidad'
    ];
    return panelKeywords.some(keyword => url.includes(keyword));
  }

  private actualizarEstadoPanel(url: string) {
    this.isPanelRoute = this.checkIfUrlIsPanel(url);
    console.log('🛡️ Estado Panel Actualizado:', this.isPanelRoute, 'para URL:', url);
  }

  getDashboardRoute(): string {
    if (!this.usuario) return '/login';
    const rol = this.usuario.rol?.toUpperCase();
    if (rol === 'ADMIN') return '/admin';
    if (rol === 'MEDICO') return '/medico/dashboard';
    if (rol === 'RECEPCION') return '/recepcion/dashboard';
    if (rol === 'PACIENTE') return '/paciente/dashboard';
    return '/paciente/dashboard'; // Default para cualquier logueado
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
