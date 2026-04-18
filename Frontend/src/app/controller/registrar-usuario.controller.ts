import { Injectable } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import { PaisService } from '../services/pais.service';
import { Usuario } from '../models/usuario.model';
import { Pais } from '../models/pais.model';

@Injectable()
export class RegistrarUsuarioController {

  // Mensajes
  private readonly MENSAJES = {
    registroExitoso: 'Usuario registrado correctamente',
    completarCampos: 'Por favor completa correctamente todos los campos'
  };
  confirmarContrasena: string = '';
  // Valores default
  private readonly defaultUsuario ={
    nombre: '',
    apellido: '',
    correo: '',
    correoUsuario: '',
    contrasena: '',
    rol: 'PACIENTE' as const,
    paisId: undefined,
    fechaNacimiento: '',
    dni: '',
    telefono: ''
  };

  private readonly defaultTouched = {
    nombre: false,
    apellido: false,
    correo: false,
    contrasena: false,
    confirmarContrasena: false,
    dni: false,
    telefono: false,
    fechaNacimiento: false,
    paisId: false
  };

  // Estado reactivo
  usuario: Usuario = new Usuario(this.defaultUsuario);
  mostrarContrasena = false;
  mostrarConfirmarContrasena = false;

  touched: typeof this.defaultTouched = { ...this.defaultTouched };

  mensaje: string = '';
  error: string = '';
  correoError: string = '';
  dniError: string = '';
  telefonoError: string = '';


  // Paises
  paises: Pais[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private paisService: PaisService
  ) {
    this.cargarPaises();
  }

  /** ------------------ GETTERS DE VALIDACIÓN ------------------ */

  get emailValido(): boolean {
    const correoUsuario = this.usuario.correoUsuario?.trim() || '';
    return correoUsuario.length > 0 && /^[a-zA-Z0-9._-]+$/.test(correoUsuario);
  }


  get fechaFutura(): boolean {
    if (!this.usuario.fechaNacimiento) return false;
    const hoy = new Date();
    const fecha = new Date(this.usuario.fechaNacimiento);
    return fecha > hoy;
  }

  get dniValido(): boolean {
    const dniStr = (this.usuario.dni || '').toString();
    return dniStr.length >= 8;
  }

  get telefonoValido(): boolean {
    const telStr = (this.usuario.telefono || '').toString();
    return telStr.length >= 9;
  }

  get passwordChecks() {
    const pass = this.usuario.contrasena || '';
    const confirm = this.confirmarContrasena || '';
    const camposTocados = Object.values(this.touched).some(v => v);

    return {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      number: /\d/.test(pass),
      empty: camposTocados && !pass && !confirm,
      match: camposTocados && pass === confirm && !!pass
    };
  }

  get formularioValido(): boolean {
    return !!(
      this.usuario.nombre &&
      this.usuario.apellido &&
      this.usuario.correoUsuario &&
      this.emailValido &&
      this.dniValido &&
      this.telefonoValido &&
      this.usuario.fechaNacimiento &&
      !this.fechaFutura &&
      this.usuario.paisId &&
      this.passwordChecks.length &&
      this.passwordChecks.uppercase &&
      this.passwordChecks.number &&
      this.passwordChecks.match
    );
  }

  get mostrarErrorCampos(): boolean {
    return !!this.error && !this.formularioValido;
  }

  /** ------------------ MÉTODOS ------------------ */

  inicializarFormulario() {
    this.usuario = new Usuario(this.defaultUsuario);
    this.confirmarContrasena = '';
    this.touched = { ...this.defaultTouched };
    this.mensaje = '';
    this.error = '';
  }

  cargarPaises() {
    this.paisService.listar().subscribe({
      next: (data) => {
        // Usa .map() para crear instancias de la clase Pais
        this.paises = data.map(paisObj => new Pais(paisObj));
      },
      error: (err) => console.error('Error al cargar países:', err)
    });
  }

  togglePassword() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  toggleConfirmarPassword() {
    this.mostrarConfirmarContrasena = !this.mostrarConfirmarContrasena;
  }

  setTouched(field: keyof typeof this.touched) {
    this.touched[field] = true;
  }

  registrar(): void {
    // Concatenar @gmail.com antes de enviar
    if (this.usuario.correoUsuario) {
      this.usuario.correo = this.usuario.correoUsuario + '@gmail.com';
    }

    // Marcar todos los campos como tocados
    Object.keys(this.touched).forEach(k => this.touched[k as keyof typeof this.touched] = true);

    // Resetear errores de campo
    this.correoError = '';
    this.dniError = '';
    this.telefonoError = '';
    this.error = '';
    this.mensaje = '';

    if (!this.formularioValido) {
      this.error = this.MENSAJES.completarCampos;
      return;
    }

    const payload: Usuario = new Usuario(this.usuario);
    delete payload.correoUsuario;
    this.usuarioService.crearUsuario(payload).subscribe({
      next: () => {
        this.mensaje = this.MENSAJES.registroExitoso;
        this.inicializarFormulario();
      },
      error: (err) => {
        if (err.status === 409 && err.error?.field) {
          const field = err.error.field;
          const msg = err.error.message;
          if (field === 'correo') this.correoError = msg;
          else if (field === 'dni') this.dniError = msg;
          else if (field === 'telefono') this.telefonoError = msg;
        } else {
          this.error = 'Error al registrar: ' + (err.error?.message || err.message);
        }
      }
    });
  }

  trackByPaisId(index: number, pais: Pais): number {
    return pais.id;
  }
}
