import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HistorialService } from '../../services/historial.service';
import { Historial } from '../../models/historial.model';
import { NotificationService } from '../../services/notification.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/** Estructura agrupada por paciente (solo para roles no-PACIENTE) */
export interface PacienteAgrupado {
  pacienteId: number;
  pacienteNombre: string;
  pacienteApellido: string;
  fotoUrl?: string;
  historiales: Historial[];
  expandido: boolean;
}

@Component({
  selector: 'app-historial-medico',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './historial-medico.html',
  styleUrls: ['./historial-medico.css']
})
export class HistorialMedicoComponent implements OnInit {
  historiales: Historial[] = [];
  historialesFiltrados: Historial[] = [];

  /** Grupos agrupados por paciente (para admin/medico/recepcion) */
  pacientesAgrupados: PacienteAgrupado[] = [];
  pacientesAgrupadosFiltrados: PacienteAgrupado[] = [];

  filtroBusqueda = '';
  cargando = true;
  usuario: any = null;
  pacienteId: number | null = null;
  error = '';

  constructor(
    private historialService: HistorialService,
    private route: ActivatedRoute,
    private ns: NotificationService
  ) {}

  ngOnInit() {
    const usrString = localStorage.getItem('usuario');
    if (usrString) {
      this.usuario = JSON.parse(usrString);
      this.route.params.subscribe(params => {
        if (params['pacienteId']) {
          this.pacienteId = +params['pacienteId'];
        } else {
          this.pacienteId = this.usuario.id;
        }
        this.cargarHistorial();
      });
    } else {
      this.error = 'Sesión no válida.';
      this.cargando = false;
    }
  }

  cargarHistorial() {
    this.cargando = true;
    let request$;

    if (this.usuario.rol === 'PACIENTE') {
      request$ = this.historialService.obtenerHistorialPorPaciente(this.usuario.id);
    } else if (this.pacienteId && this.pacienteId !== this.usuario.id) {
      request$ = this.historialService.obtenerHistorialPorPaciente(this.pacienteId);
    } else {
      request$ = this.historialService.listarTodasConCitas();
    }

    request$.subscribe({
      next: (data) => {
        this.historiales = data;
        // Para roles no-PACIENTE, agrupar por paciente
        if (this.usuario.rol !== 'PACIENTE') {
          this.agruparPorPaciente();
        } else {
          this.historialesFiltrados = this.historiales;
        }
        this.filtrarHistoriales();
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar el historial clínico.';
        this.cargando = false;
      }
    });
  }

  /** Agrupa el array plano de historiales en grupos por paciente */
  agruparPorPaciente() {
    const mapa = new Map<number, PacienteAgrupado>();
    for (const h of this.historiales) {
      const id = h.cita.paciente.id;
      if (!mapa.has(id)) {
        mapa.set(id, {
          pacienteId: id,
          pacienteNombre: h.cita.paciente.nombre,
          pacienteApellido: h.cita.paciente.apellido,
          fotoUrl: h.cita.paciente.fotoUrl,
          historiales: [],
          expandido: false
        });
      }
      mapa.get(id)!.historiales.push(h);
    }
    this.pacientesAgrupados = Array.from(mapa.values());
    this.pacientesAgrupadosFiltrados = [...this.pacientesAgrupados];
  }

  toggleExpandir(grupo: PacienteAgrupado) {
    grupo.expandido = !grupo.expandido;
  }

  filtrarHistoriales() {
    const q = this.filtroBusqueda.toLowerCase().trim();

    if (this.usuario.rol === 'PACIENTE') {
      if (!q) {
        this.historialesFiltrados = this.historiales;
      } else {
        this.historialesFiltrados = this.historiales.filter(h => {
          const nombreMedico = `${h.cita.medico.usuario.nombre} ${h.cita.medico.usuario.apellido}`.toLowerCase();
          const especialidad = h.cita.medico.especialidad ? h.cita.medico.especialidad.nombre.toLowerCase() : '';
          const diagnostico = h.diagnostico ? h.diagnostico.toLowerCase() : '';
          const receta = h.receta ? h.receta.toLowerCase() : '';
          return nombreMedico.includes(q) || especialidad.includes(q) || diagnostico.includes(q) || receta.includes(q);
        });
      }
    } else {
      if (!q) {
        this.pacientesAgrupadosFiltrados = [...this.pacientesAgrupados];
      } else {
        this.pacientesAgrupadosFiltrados = this.pacientesAgrupados.filter(grupo => {
          const nombrePaciente = `${grupo.pacienteNombre} ${grupo.pacienteApellido}`.toLowerCase();
          if (nombrePaciente.includes(q)) return true;
          // También filtra si alguna cita del paciente coincide
          return grupo.historiales.some(h => {
            const nombreMedico = `${h.cita.medico.usuario.nombre} ${h.cita.medico.usuario.apellido}`.toLowerCase();
            const especialidad = h.cita.medico.especialidad ? h.cita.medico.especialidad.nombre.toLowerCase() : '';
            const diagnostico = h.diagnostico ? h.diagnostico.toLowerCase() : '';
            const receta = h.receta ? h.receta.toLowerCase() : '';
            return nombreMedico.includes(q) || especialidad.includes(q) || diagnostico.includes(q) || receta.includes(q);
          });
        });
      }
    }
  }

  obtenerRutaVolver(): string {
    if (!this.usuario) return '/login';
    if (this.usuario.rol === 'ADMIN') return '/admin';
    if (this.usuario.rol === 'MEDICO') return '/medico/dashboard';
    if (this.usuario.rol === 'RECEPCION') return '/recepcion/dashboard';
    return '/paciente/dashboard';
  }

  /** PDF completo de un paciente agrupado (todas sus citas) */
  descargarPDFPaciente(grupo: PacienteAgrupado) {
    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [9, 122, 74];
    const blueColor: [number, number, number] = [26, 115, 232];

    // Encabezado
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('R.E.T.O SALUD', 105, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('HISTORIA CLÍNICA COMPLETA DEL PACIENTE', 105, 30, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-PE')}`, 105, 40, { align: 'center' });

    // Datos del paciente
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`Paciente: ${grupo.pacienteNombre} ${grupo.pacienteApellido}`, 15, 58);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Total de consultas registradas: ${grupo.historiales.length}`, 15, 65);

    let currentY = 75;

    // Una sección por cada cita
    grupo.historiales.forEach((h, index) => {
      // Verificar si necesitamos nueva página
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      // Separador de cita
      doc.setFillColor(...blueColor);
      doc.rect(15, currentY, 180, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      const fechaCita = h.cita.fecha ? new Date(h.cita.fecha).toLocaleDateString('es-PE') : 'Sin fecha';
      const horaCita = h.cita.fecha ? new Date(h.cita.fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '';
      doc.text(`CONSULTA #${index + 1} — ${fechaCita} ${horaCita}`, 18, currentY + 5.5);
      currentY += 12;

      // Info del médico
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Dr. ${h.cita.medico.usuario.nombre} ${h.cita.medico.usuario.apellido}`, 15, currentY);
      if (h.cita.medico.especialidad) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(`Especialidad: ${h.cita.medico.especialidad.nombre}`, 15, currentY + 6);
        currentY += 6;
      }
      currentY += 6;

      // Tabla con diagnóstico, receta y notas
      autoTable(doc, {
        startY: currentY,
        head: [['Concepto', 'Detalle']],
        body: [
          ['Diagnóstico', h.diagnostico || 'Pendiente de registro'],
          ['Receta / Tratamiento', h.receta || 'Sin indicaciones'],
          ...(h.notas ? [['Notas Adicionales', h.notas]] : [])
        ],
        headStyles: { fillColor: primaryColor, fontSize: 9 },
        styles: { cellPadding: 4, fontSize: 9, valign: 'middle' },
        columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold' } },
        margin: { left: 15, right: 15 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    });

    // Pie de página
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('Este documento es una representación digital del historial clínico del paciente. R.E.T.O Salud.', 105, 290, { align: 'center' });
      doc.text(`Página ${i} de ${totalPages}`, 190, 290, { align: 'right' });
    }

    const nombreArchivo = `Historia_Clinica_${grupo.pacienteNombre}_${grupo.pacienteApellido}.pdf`.replace(/\s+/g, '_');
    doc.save(nombreArchivo);
    this.ns.success(`Historia clínica de ${grupo.pacienteNombre} generada con éxito`);
  }

  /** PDF simple de una sola cita (para vista de paciente) */
  descargarPDF(h: Historial) {
    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [26, 115, 232];

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('R.E.T.O SALUD', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('INFORME MÉDICO Y RECETA', 105, 30, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Paciente: ${h.cita.paciente.nombre} ${h.cita.paciente.apellido}`, 15, 50);
    doc.text(`Fecha de Consulta: ${h.cita.fecha.split('T')[0]}`, 15, 55);
    doc.text(`Doctor: ${h.cita.medico.usuario.nombre} ${h.cita.medico.usuario.apellido}`, 15, 60);
    if (h.cita.medico.especialidad) {
      doc.text(`Especialidad: ${h.cita.medico.especialidad.nombre}`, 15, 65);
    }

    autoTable(doc, {
      startY: 75,
      head: [['Concepto', 'Detalle']],
      body: [
        ['Diagnóstico', h.diagnostico || 'No especificado'],
        ['Receta / Tratamiento', h.receta || 'Sin indicaciones'],
        ['Notas Adicionales', h.notas || 'Ninguna']
      ],
      headStyles: { fillColor: primaryColor as any },
      styles: { cellPadding: 5, fontSize: 11, valign: 'middle' },
      columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' } }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setDrawColor(200, 200, 200);
    doc.line(120, finalY + 40, 190, finalY + 40);
    doc.text('Firma y Sello del Médico', 155, finalY + 45, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Este documento es una representación digital del historial clínico del paciente.', 105, 285, { align: 'center' });

    doc.save(`Historial_Medico_${h.cita.paciente.nombre}_${h.cita.fecha.split('T')[0]}.pdf`);
    this.ns.success('Documento generado con éxito');
  }
}
