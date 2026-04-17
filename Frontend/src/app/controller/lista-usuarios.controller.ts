import { Injectable } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import { UsuarioFull } from '../models/usuario-full.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ListaUsuariosController {

  usuarios: UsuarioFull[] = [];                   // Todos los usuarios
  usuariosFiltrados: UsuarioFull[] = [];          // Usuarios después del filtro
  usuariosPaginados: (UsuarioFull | null)[] = []; // Usuarios de la página actual (relleno con null)

  filtro: string = '';                             // Texto del buscador
  paginaActual: number = 1;                        // Página actual
  itemsPorPagina: number = 10;                     // Usuarios por página
  totalPaginas: number = 1;                        // Total de páginas
  menuAbierto: number | null = null;               // ID del usuario con menú abierto

  constructor(private usuarioService: UsuarioService,
    private router: Router
  ) { }

  cargarUsuarios(): void {
    this.usuarioService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data.map(u => new UsuarioFull(u));

        this.aplicarFiltroYPaginacion();
      },
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  filtrarUsuarios(): void {
    this.paginaActual = 1;
    this.aplicarFiltroYPaginacion();
  }
  private aplicarFiltroYPaginacion(): void {
    const texto = this.filtro.toLowerCase().trim();

    this.usuariosFiltrados = this.usuarios.filter(u =>
      u.nombre.toLowerCase().includes(texto) ||
      u.apellido.toLowerCase().includes(texto) ||
      u.correo.toLowerCase().includes(texto) ||
      u.rol.toLowerCase().includes(texto) ||
      u.pais.nombre.toLowerCase().includes(texto)
    );

    this.totalPaginas = Math.ceil(this.usuariosFiltrados.length / this.itemsPorPagina) || 1;

    this.actualizarPagina();
  }

  /** Actualiza la página actual y asegura 10 filas siempre */
  actualizarPagina(): void {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;

    const pagina: (UsuarioFull | null)[] = this.usuariosFiltrados.slice(inicio, fin);

    // Rellenar con filas vacías
    while (pagina.length < this.itemsPorPagina) {
      pagina.push(null);
    }

    this.usuariosPaginados = pagina;
  }

  /** Navegación */
  siguientePagina(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.actualizarPagina();
    }
  }

  anteriorPagina(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.actualizarPagina();
    }
  }

  /** Menú de acciones */
  toggleMenu(usuario: UsuarioFull | null): void {
    if (!usuario) return;
    this.menuAbierto = this.menuAbierto === usuario.id ? null : usuario.id;
  }

  eliminarUsuario(usuario: UsuarioFull | null): void {
    if (!usuario) return;

    const confirmacion = confirm(`¿Eliminar a ${usuario.nombre} ${usuario.apellido}?`);
    if (!confirmacion) return;

    this.menuAbierto = null;

    this.usuarioService.eliminarUsuario(usuario.id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
        this.aplicarFiltroYPaginacion();
        alert(`Usuario ${usuario.nombre} eliminado correctamente.`);
      },
      error: (err) => {
        console.error('Error al eliminar usuario:', err);
        alert('No se pudo eliminar el usuario. Puede tener citas asociadas.');
      }
    });
  }
  actualizarEstado(usuario: any, nuevoEstado: string): void {
    if (!usuario) return;

    this.usuarioService.actualizarEstado(usuario.id, nuevoEstado).subscribe({
      next: (res) => {
        usuario.estado = nuevoEstado;
        console.log(`Estado de ${usuario.nombre} actualizado a ${nuevoEstado}`);
      },
      error: (err) => console.error('Error al actualizar estado', err)
    });
  }

  actualizarRol(usuario: any, nuevoRol: string): void {
    if (!usuario) return;

    this.usuarioService.actualizarRol(usuario.id, nuevoRol).subscribe({
      next: (res) => {
        usuario.rol = nuevoRol;
        console.log(`Rol de ${usuario.nombre} actualizado a ${nuevoRol}`);
      },
      error: (err) => console.error('Error al actualizar rol', err)
    });
  }

  editarUsuario(usuario: UsuarioFull | null): void {
    if (!usuario) return;
    this.menuAbierto = null;
    this.router.navigate(['/mis-citas', usuario.id]);
  }
}