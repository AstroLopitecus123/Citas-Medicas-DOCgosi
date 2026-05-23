import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HistorialService } from '../../services/historial.service';
import { Historial } from '../../models/historial.model';
import { NotificationService } from '../../services/notification.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  filtrarHistoriales() {
    if (!this.filtroBusqueda.trim()) {
      this.historialesFiltrados = this.historiales;
      return;
    }
    const q = this.filtroBusqueda.toLowerCase().trim();
    this.historialesFiltrados = this.historiales.filter(h => {
      const nombrePaciente = `${h.cita.paciente.nombre} ${h.cita.paciente.apellido}`.toLowerCase();
      const nombreMedico = `${h.cita.medico.usuario.nombre} ${h.cita.medico.usuario.apellido}`.toLowerCase();
      const especialidad = h.cita.medico.especialidad ? h.cita.medico.especialidad.nombre.toLowerCase() : '';
      const diagnostico = h.diagnostico ? h.diagnostico.toLowerCase() : '';
      const receta = h.receta ? h.receta.toLowerCase() : '';
      return nombrePaciente.includes(q) || nombreMedico.includes(q) || especialidad.includes(q) || diagnostico.includes(q) || receta.includes(q);
    });
  }

  obtenerRutaVolver(): string {
    if (!this.usuario) return '/login';
    if (this.usuario.rol === 'ADMIN') return '/admin';
    if (this.usuario.rol === 'MEDICO') return '/medico/dashboard';
    if (this.usuario.rol === 'RECEPCION') return '/recepcion/dashboard';
    return '/paciente/dashboard';
  }

  descargarPDF(h: Historial) {
    const doc = new jsPDF();

    const primaryColor = [26, 115, 232]; 

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
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

    doc.save(`Historial_Medico_${this.usuario.nombre}_${h.cita.fecha.split('T')[0]}.pdf`);
    this.ns.success('Documento generado con éxito');
  }
}
