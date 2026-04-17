import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListaUsuariosController } from '../../controller/lista-usuarios.controller';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-usuarios.html',
  styleUrls: ['./lista-usuarios.css']
})
export class ListaUsuariosComponent implements OnInit {
  constructor(public ctrl: ListaUsuariosController) {}

  ngOnInit(): void {
    this.ctrl.cargarUsuarios();
  }
}