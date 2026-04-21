import { Component, OnInit, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RegistrarUsuarioController } from '../../controller/registrar-usuario.controller';
import { NotificationService } from '../../services/notification.service';
import { AppComponent } from '../../app';
import { NarratorDirective } from '../../directives/narrator.directive';
import { UsuarioService } from '../../services/usuario.service';

declare var google: any;

@Component({
  selector: 'app-registrar-usuario',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, NarratorDirective],
  templateUrl: './registrar-usuario.html',
  styleUrls: ['./registrar-usuario.css'],
  providers: [RegistrarUsuarioController]
})
export class RegistrarUsuarioComponent implements OnInit {

  constructor(
    public ctrl: RegistrarUsuarioController,
    private router: Router,
    private ns: NotificationService,
    private app: AppComponent,
    private usuarioService: UsuarioService,
    private ngZone: NgZone
  ) {
    this.ctrl.setUtils(this.router, this.ns, this.app);
  }

  ngOnInit(): void {
    this.renderizarBotonGoogle();
  }

  private renderizarBotonGoogle() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '473447043826-0d5crfghn3m7cug1ibfefnr24lsmp5g8.apps.googleusercontent.com',
        callback: (resp: any) => this.ngZone.run(() => this.handleGoogleCredential(resp))
      });

      google.accounts.id.renderButton(
        document.getElementById("googleBtnRegister"),
        { theme: "outline", size: "large", text: "signup_with", width: 250, shape: "pill" }
      );
    }
  }

  private handleGoogleCredential(response: any) {
    this.usuarioService.loginConGoogle(response.credential).subscribe({
      next: (res) => {
        if (res.usuario) {
          this.ns.success('¡Registro exitoso con Google!');
          // Notificar al AppComponent que el login cambió
          this.app.loginActualizado$.next();
          this.redirigirPorRol(res.usuario);
        }
      },
      error: (err) => {
        console.error('Error Google Register:', err);
        this.ns.error('Error al registrar con Google');
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
