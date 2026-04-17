import { UsuarioService } from '../services/usuario.service';
import { inject } from '@angular/core';

export class RecuperarController {
  private usuarioService = inject(UsuarioService);

  correo: string = '';
  mensaje: string = '';
  error: string = '';
  enviado: boolean = false;

  recuperar() {
    if (!this.correo) {
      this.error = 'Por favor, ingrese su correo electrónico.';
      return;
    }

    this.usuarioService.recuperarContrasena(this.correo).subscribe({
      next: (res) => {
        this.mensaje = '📧 Se ha enviado un correo con las instrucciones para recuperar su contraseña.';
        this.enviado = true;
        this.error = '';
      },
      error: (err) => {
        this.error = '❌ No se pudo enviar el correo. Verifique que el correo esté registrado.';
        console.error(err);
      }
    });
  }
}
