import { Component, OnInit } from '@angular/core';
import { Medico } from '../../models/medico.model';
import { Disponibilidad } from '../../models/disponibilidad.model';
import { EstadoDisponibilidad } from '../../models/tipos';
import { GestionarDisponibilidadController } from '../../controller/gestionar-disponibilidad.controller';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MedicoService } from '../../services/medico.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestionar-disponibilidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestionar-disponibilidad.html',
  styleUrls: ['./gestionar-disponibilidad.css']
})
export class GestionarDisponibilidadComponent implements OnInit {

  minimoHorasSemana = 10;
  semanaIndice = 0; // 0 = siguiente semana, 1 = semana después, 2 = tercera semana
  medico!: Medico;
  disponibilidades: Disponibilidad[] = [];

  dias: { nombre: string, fecha: string }[] = [];
  horas = Array.from({ length: 13 }, (_, i) => 8 + i); // 8am a 8pm

  constructor(
    private controller: GestionarDisponibilidadController,
    private route: ActivatedRoute,
    private router: Router,
    private medicoService: MedicoService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.medicoService.obtenerPorId(id).subscribe(
      m => {
        this.medico = m;
        this.generarDiasConFechas();
        this.cargarDisponibilidades();
      },
      err => console.error(err)
    );
  }

  // Genera los 6 días de lunes a sábado con nombre y fecha
  generarDiasConFechas(): void {
    const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const lunesActual = this.getLunesDeSemana();
    const lunesMostrar = new Date(lunesActual);
    lunesMostrar.setDate(lunesActual.getDate() + 7 + this.semanaIndice * 7);

    this.dias = [];
    for (let i = 0; i < 6; i++) {
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

  // Convierte dd/MM/yy a yyyy-MM-dd para backend
  private fechaToISO(fecha: string): string {
    const [dia, mes, anio] = fecha.split('/').map(p => parseInt(p, 10));
    const f = new Date(2000 + anio, mes - 1, dia);
    return f.toISOString().split('T')[0];
  }

  get nombreMedico(): string {
    return this.medico.usuario ? `${this.medico.usuario.nombre} ${this.medico.usuario.apellido}` : '';
  }

  cargarDisponibilidades(): void {
    if (!this.dias.length) return;
    const fechaInicio = this.fechaToISO(this.dias[0].fecha);
    const fechaFin = this.fechaToISO(this.dias[this.dias.length - 1].fecha);

    this.controller.listarPorRango(this.medico.id, fechaInicio, fechaFin)
      .subscribe(res => this.disponibilidades = res);
  }

  toggleHorario(fecha: string, hora: number, checked: boolean) {
    if (!this.esEditable(fecha)) return;

    let dispo = this.disponibilidades.find(d =>
      d.fecha === this.fechaToISO(fecha) &&
      parseInt(d.horaInicio.split(':')[0]) === hora
    );

    if (!dispo) {
      dispo = new Disponibilidad({
        medico: this.medico,
        fecha: this.fechaToISO(fecha),
        horaInicio: `${hora.toString().padStart(2, '0')}:00:00`,
        horaFin: `${(hora + 1).toString().padStart(2, '0')}:00:00`,
        estado: checked ? EstadoDisponibilidad.DISPONIBLE : EstadoDisponibilidad.NO_DISPONIBLE
      });
      this.disponibilidades.push(dispo);
    } else {
      dispo.estado = checked ? EstadoDisponibilidad.DISPONIBLE : EstadoDisponibilidad.NO_DISPONIBLE;
    }
  }

  guardar(): void {
  if (!this.validarMinimoHoras()) {
    alert(`Debes seleccionar el mínimo de ${this.minimoHorasSemana} horas por semana`);
    return;
  }

  const disponibilidadesParaEnviar = this.disponibilidades.map(d => ({
    id: d.id || null,
    medico: { id: this.medico.id },
    fecha: d.fecha,
    horaInicio: d.horaInicio,
    horaFin: d.horaFin,
    estado: d.estado
  }));

  this.controller.guardarDisponibilidades(disponibilidadesParaEnviar as any)
    .subscribe({
      next: res => {
        this.disponibilidades = res.map(d => new Disponibilidad(d));
        alert('Disponibilidades guardadas correctamente');

        // ============================================
        // 🔥 REDIRECCIÓN AUTOMÁTICA A /mis-citas/{id}
        // ============================================

        const usuarioId = this.medico.usuario.id;   // ← usa el ID real

        this.router.navigate(['/mis-citas', usuarioId]);
      },
      error: err => {
        console.error(err);
        alert('Ocurrió un error al guardar las disponibilidades');
      }
    });
}


  validarMinimoHoras(): boolean {
    const lunesSemana = new Date(this.getLunesDeSemana());
    lunesSemana.setDate(lunesSemana.getDate() + 7 + this.semanaIndice * 7);
    lunesSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(lunesSemana);
    finSemana.setDate(lunesSemana.getDate() + 5);
    finSemana.setHours(23, 59, 59, 999);

    const horasSeleccionadas = this.disponibilidades.filter(d => {
      const fecha = new Date(d.fecha);
      fecha.setHours(0, 0, 0, 0);
      return fecha >= lunesSemana && fecha <= finSemana && d.estado === EstadoDisponibilidad.DISPONIBLE;
    });

    return horasSeleccionadas.length >= this.minimoHorasSemana;
  }

  getLunesDeSemana(): Date {
    const today = new Date();
    const day = today.getDay() || 7;
    const diff = today.getDate() - day + 1;
    return new Date(today.setDate(diff));
  }

  isDisponible(fecha: string, hora: number): boolean {
    return this.disponibilidades.some(d =>
      d.fecha === this.fechaToISO(fecha) &&
      parseInt(d.horaInicio.split(':')[0]) === hora &&
      d.estado === EstadoDisponibilidad.DISPONIBLE
    );
  }

  esEditable(fecha: string): boolean {
    const partes = fecha.split('/').map(p => parseInt(p, 10));
    const f = new Date(2000 + partes[2], partes[1] - 1, partes[0]);
    f.setHours(0, 0, 0, 0);

    const lunesSemana = new Date(this.getLunesDeSemana());
    lunesSemana.setDate(lunesSemana.getDate() + 7 + this.semanaIndice * 7);
    lunesSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(lunesSemana);
    finSemana.setDate(lunesSemana.getDate() + 5);
    finSemana.setHours(23, 59, 59, 999);

    return f >= lunesSemana && f <= finSemana;
  }

  siguienteSemana(): void {
    if (this.semanaIndice < 2) {
      this.semanaIndice++;
      this.generarDiasConFechas();
      this.cargarDisponibilidades();
    }
  }

  anteriorSemana(): void {
    if (this.semanaIndice > 0) {
      this.semanaIndice--;
      this.generarDiasConFechas();
      this.cargarDisponibilidades();
    }
  }

  horasFaltantes(): number {
    const lunesSemana = new Date(this.getLunesDeSemana());
    lunesSemana.setDate(lunesSemana.getDate() + 7 + this.semanaIndice * 7);
    lunesSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(lunesSemana);
    finSemana.setDate(lunesSemana.getDate() + 5);
    finSemana.setHours(23, 59, 59, 999);

    const horasSeleccionadas = this.disponibilidades.filter(d => {
      const fecha = new Date(d.fecha);
      fecha.setHours(0, 0, 0, 0);
      return fecha >= lunesSemana && fecha <= finSemana && d.estado === EstadoDisponibilidad.DISPONIBLE;
    });

    const faltantes = this.minimoHorasSemana - horasSeleccionadas.length;
    return faltantes > 0 ? faltantes : 0;
  }
}
