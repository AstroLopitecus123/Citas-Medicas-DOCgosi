import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { NotificationService } from '../../services/notification.service';
import { UsuarioFull } from '../../models/usuario-full.model';
import { Pais } from '../../models/pais.model';
import { ImageCropperComponent } from 'ngx-image-cropper';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageCropperComponent],
  templateUrl: './mi-perfil.html',
  styleUrls: ['./mi-perfil.css']
})
export class MiPerfilComponent implements OnInit {
  usuario: UsuarioFull = new UsuarioFull();
  usuarioEditado: UsuarioFull = new UsuarioFull();
  listaPaises: Pais[] = [];
  editando = false;
  cargando = true;
  subiendoFoto = false;

  // Cropper properties
  imageChangedEvent: any = '';
  croppedImage: any = '';
  mostrandoCropper = false;

  mostrarModalPassword = false;
  pwdActual = '';
  pwdNueva = '';
  pwdConfirmar = '';

  verPadActual = false;
  verPadNueva = false;
  verPadConfirmar = false;

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

  abrirModalPassword() {
    this.pwdActual = '';
    this.pwdNueva = '';
    this.pwdConfirmar = '';
    this.mostrarModalPassword = true;
  }

  cerrarModalPassword() {
    this.mostrarModalPassword = false;
  }

  ejecutarCambioPassword() {
    if (!this.pwdActual || !this.pwdNueva || !this.pwdConfirmar) {
      this.ns.error('Todos los campos son obligatorios');
      return;
    }

    if (this.pwdNueva !== this.pwdConfirmar) {
      this.ns.error('Las nuevas contraseñas no coinciden');
      return;
    }

    if (this.pwdNueva.length < 8) {
      this.ns.error('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    this.usuarioService.cambiarPassword(this.usuario.id, this.pwdActual, this.pwdNueva).subscribe({
      next: (res) => {
        this.ns.success('¡Contraseña actualizada correctamente!');
        this.cerrarModalPassword();
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al cambiar la contraseña';
        this.ns.error(msg);
      }
    });
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.imageChangedEvent = event;
      this.mostrandoCropper = true;
    }
  }

  imageCropped(event: any) {
    this.croppedImage = event.blob;
  }

  cancelarRecorte() {
    this.mostrandoCropper = false;
    this.imageChangedEvent = '';
    this.croppedImage = '';
  }

  confirmarRecorte() {
    if (this.croppedImage) {
      this.subiendoFoto = true;
      const file = new File([this.croppedImage], 'perfil_recortado.png', { type: 'image/png' });
      this.usuarioService.subirFoto(this.usuario.id, file).subscribe({
        next: (data) => {
          this.usuario.fotoUrl = data.fotoUrl;
          this.usuarioEditado.fotoUrl = data.fotoUrl;

          const localUser = localStorage.getItem('usuario');
          if (localUser) {
            const userObj = JSON.parse(localUser);
            userObj.fotoUrl = data.fotoUrl;
            localStorage.setItem('usuario', JSON.stringify(userObj));
          }

          this.subiendoFoto = false;
          this.mostrandoCropper = false;
          this.imageChangedEvent = '';
          this.ns.success('Foto de perfil actualizada correctamente');
        },
        error: (err) => {
          console.error('Error al subir la foto:', err);
          this.subiendoFoto = false;
          this.mostrandoCropper = false;
          this.ns.error('No se pudo subir la foto de perfil');
        }
      });
    }
  }
}
