import { UsuarioService } from '../services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { inject } from '@angular/core';

export class RestablecerController {
  private usuarioService = inject(UsuarioService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token: string = '';
  nuevaContrasena: string = '';
  mensaje: string = '';
  error: string = '';

  constructor() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  restablecer() {
    if (!this.nuevaContrasena) {
      this.error = 'Por favor, ingrese su nueva contraseña.';
      return;
    }

    this.usuarioService.restablecerContrasena(this.token, this.nuevaContrasena).subscribe({
      next: (res) => {
        this.mensaje = '✅ Contraseña restablecida correctamente. Redirigiendo al login...';
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err) => {
        this.error = '❌ El enlace de recuperación no es válido o ha expirado.';
        console.error(err);
      }
    });
  }
}
