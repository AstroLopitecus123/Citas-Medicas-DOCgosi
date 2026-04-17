import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { LoginController } from '../../controller/login.controller';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  ctrl: LoginController;

  constructor(
    usuarioService: UsuarioService,
    router: Router
  ) {
    this.ctrl = new LoginController(usuarioService, router);
  }
}
