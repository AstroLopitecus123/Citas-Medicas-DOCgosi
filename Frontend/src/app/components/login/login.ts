import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { LoginController } from '../../controller/login.controller';
import { EventEmitter, Output } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

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

  private readonly GOOGLE_CLIENT_ID = '473447043826-0d5crfghn3m7cug1ibfefnr24lsmp5g8.apps.googleusercontent.com';
  private readonly REDIRECT_URI = `${window.location.origin}/auth/google/callback`;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private ns: NotificationService
  ) {
    this.ctrl = new LoginController(this.usuarioService, this.router, this.loginExitoso, this.ns);
  }

  ngOnInit() {}

  /**
   * Redirige al usuario a Google OAuth sin popup.
   * Evita completamente el error de Cross-Origin-Opener-Policy.
   */
  loginConGoogle(): void {
    const nonce = Math.random().toString(36).substring(2);
    sessionStorage.setItem('google_nonce', nonce);

    const params = new URLSearchParams({
      client_id: this.GOOGLE_CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      response_type: 'id_token',
      scope: 'openid email profile',
      nonce: nonce,
      prompt: 'select_account'
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
}

