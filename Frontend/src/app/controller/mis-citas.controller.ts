import { CitaService } from '../services/cita.service';
import { UsuarioService } from '../services/usuario.service';
import { MedicoService } from '../services/medico.service';
import { Cita } from '../models/cita.model';
import { UsuarioFull } from '../models/usuario-full.model';
import { Medico } from '../models/medico.model';
import { Pais } from '../models/pais.model';
import { Especialidad } from '../models/especialidad.model';
import { ActivatedRoute, Router } from '@angular/router';
import { HistorialService } from '../services/historial.service';
import { Historial } from '../models/historial.model';
import { NotificationService } from '../services/notification.service';

export class MisCitasController {

  // ==================== HISTORIAL ====================
  mostrandoModalHistorial = false;
  historialActual: Historial = new Historial();
  vistaSoloLectura = false;
  citaSeleccionada: Cita | null = null;
  historialSeleccionado: Historial | null = null;
  modoVisualizacion = false;

  // Datos del usuario y edición
  modoReprogramacion = false;
  citaEnReprogramacion: Cita | null = null;
  medico: any = null;
  usuario: UsuarioFull = new UsuarioFull();
  usuarioEditado: UsuarioFull = new UsuarioFull();
  listaPaises: Pais[] = [];
  editando = false;
  error = '';
  cargando = false;

  // Citas
  citas: Cita[] = [];

  // Modal nueva cita
  mostrandoModalCita = false;
  especialidades: Especialidad[] = [];
  medicosDisponibles: Medico[] = [];
  horariosDisponibles: any[] = []; // { fecha: string, horaInicio: string, horaFin: string }
  especialidadSeleccionada: Especialidad | null | undefined = null;
  medicoSeleccionado: Medico | null = null;
  horarioSeleccionado: any = null;
  motivoCita = '';
  fechaSeleccionada: string | null = null;

  // Tabla de disponibilidad
  mostrarTablaDisponibilidad = false;
  semanaIndice = 0; // 0 = próxima semana, 1 = siguiente, 2 = tercera
  dias: { nombre: string, fecha: string }[] = [];
  horas = Array.from({ length: 13 }, (_, i) => 8 + i); // 8am a 8pm
  disponibilidades: any[] = [];

  constructor(
    private citaService: CitaService,
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private router: Router,
    private medicoService: MedicoService,
    private historialService: HistorialService,
    private ns?: NotificationService
  ) { }


  // ==================== USUARIO ====================
  inicializar() {
    const usuarioLocal = localStorage.getItem('usuario');
    const idLocal = usuarioLocal ? JSON.parse(usuarioLocal).id : null;
    const idRuta = Number(this.route.snapshot.paramMap.get('id'));
    const usuarioId = idRuta || idLocal;

    if (usuarioId) {
      this.cargarUsuario(usuarioId);
      this.cargarEspecialidades();
    } else {
      this.error = 'No se encontró el usuario actual.';
    }
  }

  cargarUsuario(id: number) {
    this.cargando = true;
    this.usuarioService.obtenerUsuario(id).subscribe({
      next: data => {
        this.usuario = new UsuarioFull(data);
        this.usuario.pais = new Pais(this.usuario.pais ?? {});
        this.usuarioEditado = new UsuarioFull(this.usuario);

        // 🔹 Cargar países primero
        this.usuarioService.listarPaises().subscribe({
          next: paises => {
            this.listaPaises = paises ?? [];

            // 🔹 Si el usuario es médico, obtener su registro y luego cargar citas
            if (this.usuario.rol?.toUpperCase() === 'MEDICO') {
              this.medicoService.obtenerPorUsuarioId(this.usuario.id).subscribe({
                next: medico => {
                  this.medico = medico;
                  this.cargarCitas(); // 👈 ahora aquí
                  this.cargando = false;
                },
                error: err => {
                  console.error('Error al obtener médico por usuario:', err);
                  this.cargarCitas(); // igual carga aunque falle
                  this.cargando = false;
                }
              });
            } else {
              this.cargarCitas(); // 👈 para pacientes o admins
              this.cargando = false;
            }
          },
          error: err => {
            console.error('Error al listar países:', err);
            this.cargarCitas();
            this.cargando = false;
          }
        });
      },
      error: err => {
        console.error(err);
        this.error = 'No se pudo cargar el usuario.';
        this.cargando = false;
      }
    });
  }

  activarEdicion() {
    this.editando = true;
    this.usuarioEditado = new UsuarioFull(this.usuario);
  }

  cancelarEdicion() {
    this.editando = false;
    this.usuarioEditado = new UsuarioFull(this.usuario);
  }

  guardarCambios() {
    if (!this.usuarioEditado) return;

    this.usuarioService.actualizarUsuario(this.usuarioEditado).subscribe({
      next: usuarioActualizado => {
        this.usuario = new UsuarioFull(usuarioActualizado);
        this.usuarioEditado = new UsuarioFull(this.usuario);
        this.editando = false;

        // Actualizar localStorage si es el mismo usuario
        const usuarioLocal = JSON.parse(localStorage.getItem('usuario') || '{}');
        if (usuarioLocal.id === this.usuario.id) localStorage.setItem('usuario', JSON.stringify(this.usuario));
        
        if (this.ns) this.ns.success('Perfil actualizado correctamente');
      },
      error: err => { 
        console.error(err); 
        this.error = 'No se pudo actualizar el perfil.'; 
        if (this.ns) this.ns.error('Error al actualizar el perfil');
      }
    });
  }

  comparePais(p1: Pais | null, p2: Pais | null): boolean {
    return !!p1 && !!p2 ? p1.id === p2.id : p1 === p2;
  }

  // ==================== CITAS ====================
  cargarCitas() {
    if (!this.usuario?.id) return;

    this.cargando = true;

    // Si el usuario es médico, usar su médico.id
    if (this.usuario.rol?.toUpperCase() === 'MEDICO') {
      // Esperar a que el médico haya sido cargado
      if (this.medico && this.medico.id) {
        this.citaService.listarPorMedico(this.medico.id).subscribe({
          next: data => this.asignarCitas(data),
          error: err => this.manejarErrorCitas(err)
        });
      } else {
        console.warn('No se encontró el ID del médico para cargar citas.');
        this.cargando = false;
      }
    } else {
      // Si es paciente u otro rol
      this.citaService.listarPorUsuario(this.usuario.id).subscribe({
        next: data => this.asignarCitas(data),
        error: err => this.manejarErrorCitas(err)
      });
    }
  }

  private asignarCitas(data: any[]) {
    this.citas = data.map(c => {
      c.medico ??= {} as Medico;
      c.medico.usuario ??= {} as UsuarioFull;
      c.medico.especialidad ??= {} as Especialidad;
      c.paciente ??= {} as UsuarioFull;
      (c as any).menuAbierto = false;
      c.tieneHistorial = false; // 👈 valor inicial

      // ✅ Verificar si la cita ya tiene historial
      this.historialService.obtenerHistorialPorCita(c.id).subscribe({
        next: (historial) => {
          c.tieneHistorial = !!historial;
        },
        error: (err) => {
          // ⚙️ Ignorar 404 (sin historial), mostrar solo otros errores
          if (err.status !== 404) {
            console.error('Error al obtener historial de la cita', c.id, err);
          }
          c.tieneHistorial = false;
        }
      });

      return c;
    });

    this.cargando = false;
  }

  private manejarErrorCitas(err: any) {
    console.error('Error al cargar citas:', err);
    this.error = 'Error al cargar citas.';
    this.cargando = false;
  }


  toggleMenu(cita: Cita) {
    this.citas.forEach(c => { if (c !== cita) c.menuAbierto = false; });
    cita.menuAbierto = !cita.menuAbierto;
  }

  confirmarCita(cita: Cita) {
    this.citaService.confirmarCita(cita.id).subscribe(() => this.cargarCitas());
  }

  reprogramarCita(cita: Cita) {
    this.modoReprogramacion = true;
    this.citaEnReprogramacion = cita;

    // Mostrar modal de cita
    this.mostrandoModalCita = true;

    // Prellenar datos de la cita
    this.especialidadSeleccionada = cita.medico?.especialidad ?? null;
    this.medicoSeleccionado = cita.medico ?? null;
    this.motivoCita = cita.motivo ?? '';

    // Cargar horarios disponibles solo si hay un médico asignado
    if (this.medicoSeleccionado && this.medicoSeleccionado.id) {
      this.medicoService.listarHorariosDisponibles(this.medicoSeleccionado.id).subscribe({
        next: (data: any[]) => {
          this.horariosDisponibles = data;
          this.mostrarTablaDisponibilidad = true;
          this.generarDiasConFechas();
        },
        error: (err) => console.error('Error al cargar horarios:', err)
      });
    } else {
      console.warn('No se puede cargar horarios: cita sin médico asignado.');
      this.horariosDisponibles = [];
      this.mostrarTablaDisponibilidad = false;
    }
  }

  cancelarCita(cita: Cita) {
    this.citaService.cancelarCita(cita.id).subscribe({
      next: (response) => {
        console.log('Respuesta:', response);
        if (this.ns) this.ns.success('Cita cancelada exitosamente');
        this.cargarCitas();
      },
      error: (err) => {
        console.error('Error al cancelar cita:', err);
        if (this.ns) this.ns.error('No se pudo cancelar la cita');
      }
    });
  }

  // ==================== MODAL NUEVA CITA ====================
  abrirModalCita() {
    this.mostrandoModalCita = true;
    this.especialidadSeleccionada = null;
    this.medicoSeleccionado = null;
    this.horarioSeleccionado = null;
    this.medicosDisponibles = [];
    this.horariosDisponibles = [];
    this.motivoCita = '';
    this.mostrarTablaDisponibilidad = false;
    this.semanaIndice = 0;
    this.dias = [];
  }

  cerrarModalCita() {
    this.mostrandoModalCita = false;
  }

  cargarEspecialidades() {
    this.citaService.listarEspecialidades().subscribe({
      next: data => this.especialidades = data,
      error: err => console.error(err)
    });
  }

  cargarMedicosPorEspecialidad() {
    if (!this.especialidadSeleccionada) {
      this.medicosDisponibles = [];
      return;
    }

    // Para probar, pasamos null o una fecha por defecto
    const fecha = this.fechaSeleccionada || '';

    this.medicoService.listarPorEspecialidad(
      this.especialidadSeleccionada.id,
      fecha // el backend puede ignorarlo si está vacío
    ).subscribe({
      next: data => {
        this.medicosDisponibles = data;
        this.medicoSeleccionado = null;
        this.horariosDisponibles = [];
        this.horarioSeleccionado = null;
        this.mostrarTablaDisponibilidad = false;
      },
      error: err => console.error('Error al cargar médicos:', err)
    });
  }


  cargarHorariosDisponibles() {
    if (!this.medicoSeleccionado) {
      this.horariosDisponibles = [];
      this.mostrarTablaDisponibilidad = false;
      return;
    }

    this.medicoService.listarHorariosDisponibles(this.medicoSeleccionado.id)
      .subscribe({
        next: (data: any[]) => {
          this.horariosDisponibles = data;
          this.horarioSeleccionado = null;
          this.mostrarTablaDisponibilidad = true;
          this.generarDiasConFechas(); // genera los 6 días para la tabla
        },
        error: err => console.error('Error al cargar horarios:', err)
      });
  }

  registrarCita() {
    // 🔹 Validaciones iniciales
    if (!this.especialidadSeleccionada || !this.medicoSeleccionado || !this.horarioSeleccionado) {
      alert('Debes seleccionar especialidad, médico y horario');
      return;
    }

    const fecha = this.horarioSeleccionado.fecha;
    const hora = this.horarioSeleccionado.horaInicio || '00:00:00';
    const fechaCompleta = `${fecha}T${hora}`;

    // 🔹 Si estamos en modo reprogramación
    if (this.modoReprogramacion && this.citaEnReprogramacion) {
      const citaActualizada = {
        ...this.citaEnReprogramacion,
        fecha: fechaCompleta
      };

      this.citaService.reprogramarCita(citaActualizada.id, citaActualizada).subscribe({
        next: () => {
          if (this.ns) this.ns.success('Cita reprogramada correctamente');
          this.cargarCitas();
          this.cerrarModalCita();
        },
        error: (err) => {
          console.error('Error al reprogramar cita:', err);
          if (this.ns) this.ns.error('Error al reprogramar la cita');
        }
      });

    } else {
      // 🔹 Crear nueva cita
      const nuevaCita: any = {
        paciente: this.usuario,
        medico: this.medicoSeleccionado,
        fecha: fechaCompleta,
        motivo: this.motivoCita
      };

      this.citaService.crear(nuevaCita).subscribe({
        next: (citaCreada) => {
          if (this.ns) this.ns.success('Reserva realizada. Redirigiendo al pago...');
          
          this.cargarCitas();
          this.cerrarModalCita();

          // 💳 Redirección al flujo de pago (Similar a WEB CALIDAD)
          if (citaCreada && citaCreada.id) {
            setTimeout(() => {
              this.router.navigate(['/checkout', citaCreada.id]);
            }, 800);
          }
        },
        error: (err) => {
          console.error('Error al registrar cita:', err);
          const msg = err.error?.message || 'Ocurrió un error al registrar la cita';
          if (this.ns) this.ns.error(`${msg}`);
        }
      });
    }
  }


  // ==================== DISPONIBILIDAD ====================
  generarDiasConFechas(): void {
    const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const lunesActual = this.getLunesDeSemana(); // lunes de la semana actual
    const lunesMostrar = new Date(lunesActual);
    lunesMostrar.setDate(lunesActual.getDate() + 7 + this.semanaIndice * 7); // +7 para saltar la semana actual

    this.dias = [];
    for (let i = 0; i < 6; i++) { // Lunes a sábado
      const fecha = new Date(lunesMostrar);
      fecha.setDate(lunesMostrar.getDate() + i);

      const nombre = nombresDias[fecha.getDay()];
      const dia = fecha.getDate();
      const mes = fecha.getMonth() + 1;
      const anio = fecha.getFullYear().toString().slice(-2);

      this.dias.push({
        nombre,
        fecha: `${dia}/${mes}/${anio}`
      });
    }
  }

  getLunesDeSemana(): Date {
    const today = new Date();
    const day = today.getDay() || 7; // domingo = 0 → 7
    const diff = today.getDate() - day + 1;
    return new Date(today.setDate(diff));
  }

  siguienteSemana(): void {
    if (this.semanaIndice < 2) {
      this.semanaIndice++;
      this.generarDiasConFechas();
      this.cargarHorariosDisponibles(); // recarga tabla
    }
  }

  anteriorSemana(): void {
    if (this.semanaIndice > 0) {
      this.semanaIndice--;
      this.generarDiasConFechas();
      this.cargarHorariosDisponibles(); // recarga tabla
    }
  }

  isDisponible(fecha: string, hora: number): boolean {
    const fechaISO = this.fechaToISO(fecha);

    return this.horariosDisponibles.some(d => {
      const dHora = parseInt(d.horaInicio.split(':')[0], 10);
      const mismaFecha = d.fecha === fechaISO;
      const mismaHora = dHora === hora;
      return mismaFecha && mismaHora; // si coincide fecha y hora, está disponible
    });
  }


  private fechaToISO(fecha: string): string {
    const [dia, mes, anio] = fecha.split('/').map(p => parseInt(p, 10));
    const f = new Date(2000 + anio, mes - 1, dia);
    return f.toISOString().split('T')[0];
  }

  getHorario(diaFecha: string, hora: number) {
    if (!this.horariosDisponibles) return null;

    // diaFecha viene en formato 'D/M/YY', necesitamos 'YYYY-MM-DD' para comparar
    const [dia, mes, anio] = diaFecha.split('/').map(n => parseInt(n, 10));
    const fechaISO = `20${anio}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;

    return this.horariosDisponibles.find(h => {
      if (!h?.horaInicio) return false;
      const horaInicio = parseInt(h.horaInicio.split(':')[0], 10);
      return h.fecha === fechaISO && horaInicio === hora;
    }) || null;
  }

  irAGestionarDisponibilidad() {
    if (this.medico && this.medico.id) {
      this.router.navigate(['/gestionar-disponibilidad', this.medico.id]);
    } else {
      alert('No se encontró el médico asociado a este usuario.');
    }
  }

  abrirModalHistorial(cita: Cita) {
    this.mostrandoModalHistorial = true;
    this.citaSeleccionada = cita;

    this.historialService.obtenerHistorialPorCita(cita.id).subscribe((data) => {
      if (data) {
        // Existe historial → modo visualización
        this.historialActual = data;
        this.vistaSoloLectura = true;
        this.modoVisualizacion = true;
        cita.tieneHistorial = true;
      } else {
        // No existe historial → modo registro
        this.historialActual = { cita: cita } as Historial;
        this.vistaSoloLectura = false;
        this.modoVisualizacion = false;
        cita.tieneHistorial = false;
      }
    });
  }

  cerrarModalHistorial() {
    this.mostrandoModalHistorial = false;
    this.historialActual = new Historial();
    this.citaSeleccionada = null;
    this.vistaSoloLectura = false;
  }

  guardarHistorial() {
    if (!this.historialActual || !this.historialActual.cita?.id) {
      console.error('No hay cita asociada al historial');
      return;
    }

    const citaId = this.historialActual.cita.id;

    const payload = {
      diagnostico: this.historialActual.diagnostico,
      receta: this.historialActual.receta,
      notas: this.historialActual.notas
    };

    this.historialService.registrarHistorial(citaId, payload).subscribe({
      next: (respuesta) => {
        console.log('Historial registrado correctamente:', respuesta);
        this.mostrandoModalHistorial = false;
        this.cargarCitas(); // refrescar tabla
      },
      error: (err) => {
        console.error('Error al registrar historial:', err);
        alert('No se pudo guardar el historial. Ver consola.');
      }
    });
  }

  abrirVisualizarHistorial(cita: Cita) {
    this.historialService.obtenerPorCita(cita.id).subscribe({
      next: (historial) => {
        if (historial) {
          this.historialSeleccionado = new Historial(historial);
          this.mostrandoModalHistorial = true; // muestra el modal
        }
      },
      error: (err) => {
        console.error('No se encontró historial para esta cita:', err);
        alert('No hay diagnóstico ni receta registrados para esta cita.');
      }
    });
  }

  pagarCita(cita: Cita) {
    this.router.navigate(['/checkout', cita.id]);
  }

  verComprobante(url: string) {
    window.open(url, "_blank");
  }
}
