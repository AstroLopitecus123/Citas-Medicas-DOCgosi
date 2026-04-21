import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TipoFiltro =
  | 'NINGUNO'
  | 'DEUTERANOPIA'
  | 'PROTANOPIA'
  | 'TRITANOPIA'
  | 'DEUTERANOMALIA'
  | 'PROTANOMALIA'
  | 'ACROMATOPSIA';

const FILTROS: Record<TipoFiltro, string> = {
  NINGUNO: 'none',
  DEUTERANOPIA: 'url(#deuteranopia)',
  PROTANOPIA:   'url(#protanopia)',
  TRITANOPIA:   'url(#tritanopia)',
  DEUTERANOMALIA: 'url(#deuteranomalia)',
  PROTANOMALIA:   'url(#protanomalia)',
  ACROMATOPSIA:   'grayscale(100%)',
};

const LS_KEY = 'accesibilidad-filtro';

@Component({
  selector: 'app-accesibilidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accesibilidad.html',
  styleUrls: ['./accesibilidad.css']
})
export class AccesibilidadComponent implements OnInit {
  abierto = false;
  filtroActivo: TipoFiltro = 'NINGUNO';

  // Modo preview temporal (barra flotante)
  modoPreview = false;
  filtroPreview: TipoFiltro = 'NINGUNO';
  cuentaRegresiva = 10;
  private timerPreview: any;

  opciones: { tipo: TipoFiltro; etiqueta: string; icono: string; color: string }[] = [
    { tipo: 'DEUTERANOPIA',   etiqueta: 'Deuteranopia',    icono: '🟢', color: '#16a34a' },
    { tipo: 'PROTANOPIA',     etiqueta: 'Protanopia',      icono: '🔴', color: '#dc2626' },
    { tipo: 'TRITANOPIA',     etiqueta: 'Tritanopia',      icono: '🔵', color: '#2563eb' },
    { tipo: 'DEUTERANOMALIA', etiqueta: 'Deuteranomalía',  icono: '🟡', color: '#ca8a04' },
    { tipo: 'PROTANOMALIA',   etiqueta: 'Protanomalía',    icono: '🟠', color: '#ea580c' },
    { tipo: 'ACROMATOPSIA',   etiqueta: 'Escala Grises',   icono: '⚫', color: '#475569' },
    { tipo: 'NINGUNO',        etiqueta: 'Sin filtro',      icono: '✖',  color: '#94a3b8' },
  ];

  ngOnInit() {
    const guardado = localStorage.getItem(LS_KEY) as TipoFiltro | null;
    if (guardado && guardado !== 'NINGUNO') {
      this.filtroActivo = guardado;
      this.aplicarFiltro(guardado);
    }
  }

  toggleMenu() { this.abierto = !this.abierto; }

  seleccionar(tipo: TipoFiltro) {
    this.abierto = false;
    if (tipo === 'NINGUNO') {
      this.desactivar();
      return;
    }
    this.iniciarPreview(tipo);
  }

  iniciarPreview(tipo: TipoFiltro) {
    this.filtroPreview = tipo;
    this.modoPreview = true;
    this.cuentaRegresiva = 10;
    this.aplicarFiltro(tipo); // aplicar temporalmente a toda la página

    this.timerPreview = setInterval(() => {
      this.cuentaRegresiva--;
      if (this.cuentaRegresiva <= 0) this.cancelarPreview();
    }, 1000);
  }

  confirmarPreview() {
    clearInterval(this.timerPreview);
    this.filtroActivo = this.filtroPreview;
    localStorage.setItem(LS_KEY, this.filtroActivo);
    this.modoPreview = false;
    // El filtro ya está aplicado — solo guardamos
  }

  cancelarPreview() {
    clearInterval(this.timerPreview);
    this.modoPreview = false;
    // Revertir al filtro anterior
    this.aplicarFiltro(this.filtroActivo);
  }

  desactivar() {
    this.filtroActivo = 'NINGUNO';
    localStorage.setItem(LS_KEY, 'NINGUNO');
    this.aplicarFiltro('NINGUNO');
  }

  private aplicarFiltro(tipo: TipoFiltro) {
    document.documentElement.style.filter = FILTROS[tipo];
  }

  etiquetaActiva(): string {
    return this.opciones.find(o => o.tipo === this.filtroActivo)?.etiqueta ?? 'Sin filtro';
  }

  etiquetaPreview(): string {
    return this.opciones.find(o => o.tipo === this.filtroPreview)?.etiqueta ?? 'Vista previa';
  }

  @HostListener('document:click', ['$event'])
  cerrarAlClickFuera(e: MouseEvent) {
    const el = (e.target as HTMLElement).closest('app-accesibilidad');
    if (!el && this.abierto) this.abierto = false;
  }
}
