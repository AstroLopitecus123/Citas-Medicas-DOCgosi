import { MedicoService } from '../services/medico.service';
import { EspecialidadService } from '../services/especialidad.service';
import { UsuarioFull } from '../models/usuario-full.model';
import { Especialidad } from '../models/especialidad.model';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

export interface UsuarioFullConIndice extends UsuarioFull {
  fila: number; // índice consecutivo
}

@Injectable({
  providedIn: 'root'
})
export class AdminMedicosController {
  medicos: UsuarioFull[] = [];
  medicosConIndice: UsuarioFullConIndice[] = [];
  listaEspecialidades: Especialidad[] = [];
  medicoSeleccionado: UsuarioFull = new UsuarioFull();
  especialidadSeleccionada?: Especialidad;
  mostrandoModalAsignar = false;
  error = '';
  cargando = false;

  constructor(
    private medicoService: MedicoService,
    private especialidadService: EspecialidadService,
    private router: Router
  ) {}

  inicializar() {
    this.cargarMedicos();
    this.cargarEspecialidades();
  }

  cargarMedicos() {
    this.cargando = true;
    this.medicoService.listarMedicos().subscribe({
      next: data => {
        this.medicos = data.map(d => new UsuarioFull(d));
        // ⚡ Generar fila consecutiva
        this.medicosConIndice = this.medicos.map((medico, index) => ({
          ...medico,
          fila: index + 1
        }));
        this.cargando = false;

        if (this.medicos.length > 0) {
          this.medicoSeleccionado = this.medicos[0];
          this.onMedicoChange();
        }
      },
      error: err => {
        console.error(err);
        this.error = 'Error al cargar médicos';
        this.cargando = false;
      }
    });
  }

  cargarEspecialidades() {
    this.especialidadService.listarEspecialidades().subscribe({
      next: data => this.listaEspecialidades = data,
      error: err => console.error('Error al cargar especialidades', err)
    });
  }

  onMedicoChange() {
    if (this.medicoSeleccionado) {
      this.especialidadSeleccionada = this.medicoSeleccionado.especialidad ?? undefined;
    }
  }

  asignarEspecialidades() {
    if (!this.medicoSeleccionado || !this.especialidadSeleccionada) return;

    this.medicoService
      .asignarEspecialidad(this.medicoSeleccionado.medicoId, this.especialidadSeleccionada.id)
      .subscribe({
        next: medicoActualizado => {
          console.log('Especialidad actualizada:', medicoActualizado);
          this.medicoSeleccionado.especialidad = medicoActualizado.especialidad;
          this.cerrarModal();
          this.cargarMedicos(); // Recargar para ver cambios en la tabla
        },
        error: err => console.error('Error al actualizar especialidad:', err)
      });
  }

  abrirModalAsignar(medico: UsuarioFull) {
    this.medicoSeleccionado = medico;
    this.especialidadSeleccionada = medico.especialidad ?? undefined;
    this.mostrandoModalAsignar = true;
  }

  cerrarModal() {
    this.mostrandoModalAsignar = false;
  }

  modificarHorario(medico: UsuarioFull) {
    console.log('Modificar horario del médico:', medico.nombre, medico.id);
    this.router.navigate(['/gestionar-disponibilidad', medico.medicoId]);
  }
}
