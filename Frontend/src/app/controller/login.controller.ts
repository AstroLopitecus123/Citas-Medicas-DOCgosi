import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { UsuarioFull } from '../models/usuario-full.model';
import { EventEmitter } from '@angular/core';
import { NotificationService } from '../services/notification.service';

export class LoginController {
  correo: string = '';
  contrasena: string = '';
  mensaje: string = '';
  error: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private loginExitoso?: EventEmitter<void>,
    private ns?: NotificationService
  ) { }

  iniciarSesion() {
    this.error = '';
    this.usuarioService.login({ correo: this.correo, contrasena: this.contrasena }).subscribe({
      next: (res) => {
        if ('id' in res) {
          const usuario = new UsuarioFull(res);
          localStorage.setItem('usuario', JSON.stringify(usuario));
          if (this.loginExitoso) this.loginExitoso.emit();
          
          if (this.ns) this.ns.success(`¡Bienvenido de nuevo, ${usuario.nombre}!`);

          // 🚀 Redirección inteligente basada en rol
          const rol = usuario.rol?.toUpperCase();
          if (rol === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else if (rol === 'MEDICO') {
            this.router.navigate(['/medico/dashboard']);
          } else if (rol === 'RECEPCION') {
            this.router.navigate(['/recepcion/dashboard']);
          } else {
            this.router.navigate(['/paciente/dashboard']);
          }
        } else if ('message' in res) {
          this.error = `${res.message}`;
          if (this.ns) this.ns.error(String(res.message));
        } else {
          this.error = 'Error inesperado al iniciar sesión.';
          if (this.ns) this.ns.error('Error inesperado');
        }
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.error = 'Correo o contraseña incorrectos.';
        if (this.ns) this.ns.error('Correo o contraseña incorrectos');
      }
    });
  }
}
