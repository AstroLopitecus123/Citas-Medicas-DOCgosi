import { EspecialidadService } from '../services/especialidad.service';
import { Especialidad } from '../models/especialidad.model';
import { EstadoEspecialidad } from '../models/tipos';

export class AdminEspecialidadesController {

  especialidades: Especialidad[] = [];
  nueva: Especialidad = new Especialidad();
  editando: Especialidad | null = null;
  mostrandoModal = false;
  modoEdicion = false;
  mensaje: string = '';
  error: string = '';

  mostrandoConfirmarEliminar = false;
  especialidadAEliminarId: number | null = null;
  especialidadAEliminarNombre: string = '';

  constructor(private especialidadService: EspecialidadService) {}

  inicializar(): void {
    this.listar();
  }

  listar(): void {
    this.especialidadService.listarEspecialidades().subscribe({
      next: (data) => {
        this.especialidades = data;
        this.mensaje = '';
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al listar las especialidades';
      }
    });
  }

  guardar(): void {

  const especialidad = this.editando ?? this.nueva;

  const nombre = especialidad.nombre?.trim() || '';
  const descripcion = especialidad.descripcion?.trim() || '';
  const precio = Number(especialidad.precioBase);

  // Nombre obligatorio
  if (!nombre) {
    this.error = 'El nombre de la especialidad es obligatorio.';
    return;
  }

  // Nombre entre 2 y 50 caracteres
  if (nombre.length < 2 || nombre.length > 50) {
    this.error = 'El nombre de la especialidad debe tener entre 2 y 50 caracteres.';
    return;
  }

  // Solo letras y espacios
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(nombre)) {
    this.error = 'El nombre de la especialidad solo puede contener letras.';
    return;
  }

  // Precio obligatorio
  if (isNaN(precio)) {
    this.error = 'El precio es obligatorio.';
    return;
  }

  // Rango de precio
  if (precio < 50 || precio > 5000) {
    this.error = 'El precio debe estar entre S/ 50 y S/ 5000.';
    return;
  }

  // Descripción obligatoria
  if (!descripcion) {
    this.error = 'La descripción es obligatoria.';
    return;
  }

  // Descripción entre 2 y 300 caracteres
  if (descripcion.length < 2 || descripcion.length > 300) {
    this.error = 'La descripción debe tener entre 2 y 300 caracteres.';
    return;
  }

  this.error = '';

  if (this.editando) {
      this.especialidadService.actualizar(this.editando.id, this.editando).subscribe({
        next: () => {
          this.mensaje = 'Especialidad actualizada correctamente.';
          this.cerrarModal();
          this.listar();
        },
        error: () => this.error = 'Error al actualizar la especialidad.'
      });
    } else {
      this.especialidadService.crear(this.nueva).subscribe({
        next: () => {
          this.mensaje = 'Especialidad creada correctamente.';
          this.nueva = new Especialidad();
          this.cerrarModal();
          this.listar();
        },
        error: () => this.error = 'Error al crear la especialidad.'
      });
    }
}

  abrirModalNuevo(): void {
    this.nueva = new Especialidad();
    this.editando = null;
    this.modoEdicion = false;
    this.mostrandoModal = true;
  }

  editar(esp: Especialidad): void {
    this.editando = new Especialidad({ ...esp });
    this.modoEdicion = true;
    this.mostrandoModal = true;
  }

  cerrarModal(): void {
    this.mostrandoModal = false;
    this.editando = null;
    this.mensaje = '';
    this.error = '';
  }

  eliminar(esp: Especialidad): void {
    this.especialidadAEliminarId = esp.id;
    this.especialidadAEliminarNombre = esp.nombre;
    this.mostrandoConfirmarEliminar = true;
  }

  confirmarEliminacionFinal(): void {
    if (this.especialidadAEliminarId === null) return;

    this.especialidadService.eliminar(this.especialidadAEliminarId).subscribe({
      next: () => {
        this.mensaje = '🗑️ Especialidad eliminada con éxito.';
        this.mostrandoConfirmarEliminar = false;
        this.especialidadAEliminarId = null;
        this.listar();
      },
      error: () => {
        this.error = '❌ No se pudo eliminar la especialidad activa.';
        this.mostrandoConfirmarEliminar = false;
      }
    });
  }

  cerrarModalConfirmar(): void {
    this.mostrandoConfirmarEliminar = false;
    this.especialidadAEliminarId = null;
  }

  cambiarEstado(esp: Especialidad): void {
    const nuevoEstado: EstadoEspecialidad = esp.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';
    this.especialidadService.cambiarEstado(esp.id, nuevoEstado).subscribe({
      next: () => {
        this.mensaje = ` Estado cambiado a ${nuevoEstado}`;
        this.listar();
      },
      error: () => this.error = '❌ Error al cambiar el estado.'
    });
  }

  cancelarEdicion(): void {
    this.editando = null;
    this.mensaje = '';
    this.error = '';
  }
}
