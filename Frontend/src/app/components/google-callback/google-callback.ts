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
    // El id_token llega en el fragmento de la URL (#id_token=...)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const idToken = params.get('id_token');

    if (!idToken) {
      this.ns.error('No se recibió respuesta de Google. Intenta de nuevo.');
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioService.loginConGoogle(idToken).subscribe({
      next: (res) => {
        if (res.usuario) {
          this.ns.success(`¡Bienvenido, ${res.usuario.nombre}!`);
          this.app.loginActualizado$.next();
          const rol = res.usuario.rol?.toUpperCase();
          if (rol === 'ADMIN') this.router.navigate(['/admin']);
          else if (rol === 'MEDICO') this.router.navigate(['/medico/dashboard']);
          else if (rol === 'RECEPCION') this.router.navigate(['/recepcion/dashboard']);
          else this.router.navigate(['/paciente/dashboard']);
        }
      },
      error: () => {
        this.ns.error('Error al iniciar sesión con Google. Intenta de nuevo.');
        this.router.navigate(['/login']);
      }
    });
  }
}
