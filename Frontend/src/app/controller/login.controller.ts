import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { UsuarioFull } from '../models/usuario-full.model';
import { EventEmitter } from '@angular/core';

export class LoginController {
  correo: string = '';
  contrasena: string = '';
  mensaje: string = '';
  error: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private loginExitoso?: EventEmitter<void>
  ) { }

  iniciarSesion() {
    this.error = '';
    this.usuarioService.login({ correo: this.correo, contrasena: this.contrasena }).subscribe({
      next: (res) => {
        if ('id' in res) {
          const usuario = new UsuarioFull(res);
          localStorage.setItem('usuario', JSON.stringify(usuario));
          if (this.loginExitoso) this.loginExitoso.emit();
          this.router.navigate(['/mis-citas']);
        } else if ('message' in res) {
          this.error = `❌ ${res.message}`;
        } else {
          this.error = '❌ Error inesperado al iniciar sesión.';
        }
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.error = '❌ Correo o contraseña incorrectos.';
      }
    });
  }
}
