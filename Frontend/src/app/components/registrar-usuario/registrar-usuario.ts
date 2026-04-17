import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegistrarUsuarioController } from '../../controller/registrar-usuario.controller';

@Component({
  selector: 'app-registrar-usuario',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './registrar-usuario.html',
  styleUrls: ['./registrar-usuario.css'],
  providers: [RegistrarUsuarioController]
})
export class RegistrarUsuarioComponent {

  constructor(
    public ctrl: RegistrarUsuarioController
  ) {
  }
}
