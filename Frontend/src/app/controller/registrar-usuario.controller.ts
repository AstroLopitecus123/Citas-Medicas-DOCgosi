import { Injectable } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import { PaisService } from '../services/pais.service';
import { Usuario } from '../models/usuario.model';
import { Pais } from '../models/pais.model';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { AppComponent } from '../app';

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
    telefono: '',
    configuracionVisual: 'NINGUNO' as const
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
  
  // Pasos del registro
  pasoActual: number = 1;

  touched: typeof this.defaultTouched = { ...this.defaultTouched };

  mensaje: string = '';
  error: string = '';
  correoError: string = '';
  dniError: string = '';
  telefonoError: string = '';


  // Paises
  paises: Pais[] = [];

  // Utilidades inyectadas vía setUtils
  private router?: Router;
  private ns?: NotificationService;
  private app?: AppComponent;

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

  setUtils(router: Router, ns: NotificationService, app: AppComponent) {
    this.router = router;
    this.ns = ns;
    this.app = app;
  }

  abrirAsistenteVisual() {
    if (this.app?.accesibilidad) {
      this.app.accesibilidad.abrirAsistente();
      const sub = this.app.accesibilidad.confirmadoWizard.subscribe((tipo: any) => {
        this.usuario.configuracionVisual = tipo;
        if (this.ns) this.ns.info(`Configuración aplicada: ${this.getEtiquetaVisual(tipo)}`);
        sub.unsubscribe();
      });
    }
  }

  getEtiquetaVisual(tipo?: string): string {
    const t = tipo || this.usuario.configuracionVisual || 'NINGUNO';
    const mapping: any = {
      'DEUTERANOPIA': 'Deuteranopia',
      'PROTANOPIA': 'Protanopia',
      'TRITANOPIA': 'Tritanopia',
      'DEUTERANOMALIA': 'Deuteranomalía',
      'PROTANOMALIA': 'Protanomalía',
      'ACROMATOPSIA': 'Escala de Grises',
      'NINGUNO': 'Sin filtro'
    };
    return mapping[t] || 'Sin filtro';
  }

  irAPaso1() {
    this.pasoActual = 1;
  }

  setFiltro(tipo: string) {
    this.usuario.configuracionVisual = tipo;
    // Aplicar filtro temporal en el DOM para preview real si el usuario quiere
    document.documentElement.style.filter = this.getFiltroStyle(tipo);
  }

  private getFiltroStyle(tipo: string): string {
    const filters: any = {
      'DEUTERANOPIA': 'url(#deuteranopia)',
      'PROTANOPIA': 'url(#protanopia)',
      'TRITANOPIA': 'url(#tritanopia)',
      'DEUTERANOMALIA': 'url(#deuteranomalia)',
      'PROTANOMALIA': 'url(#protanomalia)',
      'ACROMATOPSIA': 'grayscale(100%)',
      'NINGUNO': 'none'
    };
    return filters[tipo] || 'none';
  }

  registrar(): void {
    // Concatenar &#64;gmail.com antes de enviar
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
        if (this.ns) this.ns.success('¡Cuenta creada con éxito! Bienvenido a R.E.T.O Salud.');
        this.inicializarFormulario();

        // 🚀 Redirección automática al Login para que el usuario inicie sesión
        if (this.router) {
          setTimeout(() => {
            this.router?.navigate(['/login']);
          }, 2000);
        }
      },
      error: (err) => {
        if (err.status === 409 && err.error?.field) {
          const field = err.error.field;
          const msg = err.error.message;
          if (field === 'correo') this.correoError = msg;
          else if (field === 'dni') this.dniError = msg;
          else if (field === 'telefono') this.telefonoError = msg;
          
          if (this.ns) this.ns.error(`${msg}`);
        } else {
          const errMsg = err.error?.message || err.message || 'Error desconocido';
          this.error = 'Error del servidor: ' + errMsg;
          if (this.ns) this.ns.error(`Error 500: ${errMsg}`);
          console.error('DETALLE ERROR 500:', err);
        }
      }
    });
  }

  trackByPaisId(index: number, pais: Pais): number {
    return pais.id;
  }

  soloNumeros(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }
}
