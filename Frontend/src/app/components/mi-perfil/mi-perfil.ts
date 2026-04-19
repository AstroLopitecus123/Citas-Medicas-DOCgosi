import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { NotificationService } from '../../services/notification.service';
import { UsuarioFull } from '../../models/usuario-full.model';
import { Pais } from '../../models/pais.model';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-perfil.html',
  styleUrls: ['./mi-perfil.css']
})
export class MiPerfilComponent implements OnInit {
  usuario: UsuarioFull = new UsuarioFull();
  usuarioEditado: UsuarioFull = new UsuarioFull();
  listaPaises: Pais[] = [];
  editando = false;
  cargando = true;

  constructor(
    private usuarioService: UsuarioService,
    private ns: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    const usuarioLocal = localStorage.getItem('usuario');
    const id = usuarioLocal ? JSON.parse(usuarioLocal).id : null;

    if (id) {
      this.usuarioService.obtenerUsuario(id).subscribe({
        next: data => {
          this.usuario = new UsuarioFull(data);
          this.usuario.pais = new Pais(this.usuario.pais ?? {});
          this.usuarioEditado = new UsuarioFull(this.usuario);
          this.cargarPaises();
        },
        error: err => {
          this.ns.error('No se pudo cargar la información del perfil');
          this.cargando = false;
        }
      });
    }
  }

  cargarPaises() {
    this.usuarioService.listarPaises().subscribe({
      next: paises => {
        this.listaPaises = paises ?? [];
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  activarEdicion() {
    this.editando = true;
    this.usuarioEditado = new UsuarioFull(this.usuario);
  }

  cancelarEdicion() {
    this.editando = false;
  }

  guardarCambios() {
    this.usuarioService.actualizarUsuario(this.usuarioEditado).subscribe({
      next: updated => {
        this.usuario = new UsuarioFull(updated);
        localStorage.setItem('usuario', JSON.stringify(this.usuario));
        this.editando = false;
        this.ns.success('Perfil actualizado correctamente');
      },
      error: () => this.ns.error('Error al guardar los cambios')
    });
  }

  comparePais(p1: Pais | null, p2: Pais | null): boolean {
    return !!p1 && !!p2 ? p1.id === p2.id : p1 === p2;
  }
}
