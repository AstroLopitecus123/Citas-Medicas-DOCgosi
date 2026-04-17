import { EspecialidadService } from '../services/especialidad.service';
import { Especialidad } from '../models/especialidad.model';
import { EstadoEspecialidad } from '../models/tipos';

export class AdminEspecialidadesController {

  especialidades: Especialidad[] = [];
  nueva: Especialidad = new Especialidad();
  editando: Especialidad | null = null;
  mensaje: string = '';
  error: string = '';

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
    if (this.editando) {
      this.especialidadService.actualizar(this.editando.id, this.editando).subscribe({
        next: () => {
          this.mensaje = '✅ Especialidad actualizada correctamente.';
          this.cancelarEdicion();
          this.listar();
        },
        error: () => this.error = '❌ Error al actualizar la especialidad.'
      });
    } else {
      this.especialidadService.crear(this.nueva).subscribe({
        next: () => {
          this.mensaje = '✅ Especialidad creada correctamente.';
          this.nueva = new Especialidad();
          this.listar();
        },
        error: () => this.error = '❌ Error al crear la especialidad.'
      });
    }
  }

  editar(esp: Especialidad): void {
    this.editando = new Especialidad({ ...esp });
  }

  eliminar(id: number): void {
    if (confirm('¿Seguro que deseas eliminar esta especialidad?')) {
      this.especialidadService.eliminar(id).subscribe({
        next: () => {
          this.mensaje = '🗑️ Especialidad eliminada.';
          this.listar();
        },
        error: () => this.error = '❌ No se pudo eliminar la especialidad.'
      });
    }
  }

  cambiarEstado(esp: Especialidad): void {
    const nuevoEstado: EstadoEspecialidad = esp.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';
    this.especialidadService.cambiarEstado(esp.id, nuevoEstado).subscribe({
      next: () => {
        this.mensaje = `✅ Estado cambiado a ${nuevoEstado}`;
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
