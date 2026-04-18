import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegistrarUsuarioController } from '../../controller/registrar-usuario.controller';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-registrar-usuario',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './registrar-usuario.html',
  styleUrls: ['./registrar-usuario.css'],
  providers: [RegistrarUsuarioController]
})
export class RegistrarUsuarioComponent {

  constructor(
    public ctrl: RegistrarUsuarioController,
    private router: Router,
    private ns: NotificationService
  ) {
    // Vincular utilidades al controlador
    this.ctrl.setUtils(this.router, this.ns);
  }
}
