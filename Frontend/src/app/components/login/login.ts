import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { LoginController } from '../../controller/login.controller';
import { EventEmitter, Output } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  @Output() loginExitoso = new EventEmitter<void>();
  ctrl: LoginController;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private ns: NotificationService,
    private ngZone: NgZone
  ) {
    this.ctrl = new LoginController(this.usuarioService, this.router, this.loginExitoso, this.ns);
  }

  ngOnInit() {
    // Inicializar Google Sign-In
    setTimeout(() => {
      if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
          client_id: '473447043826-0d5crfghn3m7cug1ibfefnr24lsmp5g8.apps.googleusercontent.com',
          callback: (response: any) => {
            // Asegurarse de que Angular detecte el cambio de contexto
            if (this.ngZone) {
               this.ngZone.run(() => this.handleGoogleLogin(response));
            } else {
               this.handleGoogleLogin(response);
            }
          }
        });

        google.accounts.id.renderButton(
          document.getElementById('googleBtn'),
          { 
            theme: 'outline', 
            size: 'large', 
            width: 280, // El ancho debe ser un número, no '100%'
            text: 'continue_with',
            shape: 'pill'
          }
        );
      }
    }, 500);
  }

  handleGoogleLogin(response: any) {
    const idToken = response.credential;
    this.usuarioService.loginConGoogle(idToken).subscribe({
      next: (res) => {
        if (res.usuario) {
          if (this.ns) this.ns.success(`¡Bienvenido, ${res.usuario.nombre}!`);
          this.loginExitoso.emit();
          this.redirigirPorRol(res.usuario);
        }
      },
      error: (err) => {
        if (this.ns) this.ns.error('Error al iniciar sesión con Google');
      }
    });
  }

  private redirigirPorRol(usuario: any) {
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
  }
}
