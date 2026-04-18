import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { LoginController } from '../../controller/login.controller';
import { EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  @Output() loginExitoso = new EventEmitter<void>();
  ctrl: LoginController;

  constructor(
    usuarioService: UsuarioService,
    router: Router
  ) {
    this.ctrl = new LoginController(usuarioService, router, this.loginExitoso);
  }
}
