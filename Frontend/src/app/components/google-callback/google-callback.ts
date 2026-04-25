import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { NotificationService } from '../../services/notification.service';
import { AppComponent } from '../../app';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:16px;">
      <div class="preloader-spinner" style="width:48px;height:48px;border:4px solid #e0e0e0;border-top-color:#1a7f4b;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
      <p style="font-family:Inter,sans-serif;color:#666;">Verificando tu cuenta de Google...</p>
    </div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
  `
})
export class GoogleCallbackComponent implements OnInit {
  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private ns: NotificationService,
    private app: AppComponent
  ) {}

  ngOnInit(): void {
    console.log('--- Iniciando verificación de Google Callback ---');
    
    // Intentar capturar el token tanto del hash como de los parámetros normales
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const queryParams = new URLSearchParams(window.location.search);
    
    const idToken = hashParams.get('id_token') || queryParams.get('id_token');

    console.log('Token detectado:', idToken ? 'SÍ (oculto por seguridad)' : 'NO');

    if (!idToken) {
      console.error('No se encontró id_token en la URL');
      this.ns.error('No se recibió respuesta de Google. Intenta de nuevo.');
      this.router.navigate(['/login']);
      return;
    }

    console.log('Enviando token al servidor...');
    this.usuarioService.loginConGoogle(idToken).subscribe({
      next: (res) => {
        console.log('Respuesta del servidor exitosa:', res);
        
        // El servidor devuelve una estructura plana (id, nombre, rol, token, etc.)
        // No viene envuelto en un objeto "usuario"
        if (res && res.token) {
          const nombreUsuario = res.nombre || 'Usuario';
          this.ns.success(`¡Bienvenido, ${nombreUsuario}!`);
          
          // Notificar al resto de la app que el login se completó
          this.app.loginActualizado$.next();
          
          const rol = res.rol?.toUpperCase();
          console.log('Redirigiendo a panel por rol:', rol);
          
          if (rol === 'ADMIN') this.router.navigate(['/admin']);
          else if (rol === 'MEDICO') this.router.navigate(['/medico/dashboard']);
          else if (rol === 'RECEPCION') this.router.navigate(['/recepcion/dashboard']);
          else this.router.navigate(['/paciente/dashboard']);
        } else {
          console.error('El servidor respondió pero falta el token o datos esenciales');
          this.ns.error('La sesión no pudo ser validada. Intenta de nuevo.');
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        console.error('Error en la llamada al servidor (loginConGoogle):', err);
        // Extraer el mensaje de error detallado que configuramos en el backend
        const msgError = err.error?.error || 'Error desconocido al validar con Google';
        this.ns.error('Error: ' + msgError);
        this.router.navigate(['/login']);
      }

    });
  }
}
