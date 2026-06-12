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
  mostrarContrasena: boolean = false;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private loginExitoso?: EventEmitter<void>,
    private ns?: NotificationService
  ) { }

  togglePassword() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  iniciarSesion() {
    this.error = '';

    const correo = this.correo.trim();
    const contrasena = this.contrasena.trim();

    // Correo obligatorio
    if (!correo) {
      this.error = 'Debes ingresar tu correo.';
      if (this.ns) this.ns.error(this.error);
      return;
    }

    // Correo entre 11 y 50 caracteres
    if (correo.length < 11 || correo.length > 50) {
      this.error = 'El correo debe tener entre 11 y 50 caracteres.';
      if (this.ns) this.ns.error(this.error);
      return;
    }

    // Contraseña obligatoria
    if (!contrasena) {
      this.error = 'Debes ingresar tu contraseña.';
      if (this.ns) this.ns.error(this.error);
      return;
    }

    // Contraseña entre 8 y 15 caracteres
    if (contrasena.length < 8 || contrasena.length > 15) {
      this.error = 'La contraseña debe tener entre 8 y 15 caracteres.';
      if (this.ns) this.ns.error(this.error);
      return;
    }

    this.usuarioService.login({ correo: this.correo, contrasena: this.contrasena }).subscribe({
      next: (res) => {
        if ('id' in res) {
          const usuario = new UsuarioFull(res);
          localStorage.setItem('usuario', JSON.stringify(usuario));
          if (this.loginExitoso) this.loginExitoso.emit();

          if (this.ns) this.ns.success(`¡Bienvenido de nuevo, ${usuario.nombre}!`);

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
        this.error = err.error?.message || 'Correo o contraseña incorrectos.';
        if (this.ns) this.ns.error(this.error);
      }
    });
  }
}
