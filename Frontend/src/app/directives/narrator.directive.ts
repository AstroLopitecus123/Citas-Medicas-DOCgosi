import { Directive, ElementRef, HostListener, Input, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { NarratorService } from '../services/narrator.service';

@Directive({
  selector: '[appNarrator]',
  standalone: true
})
export class NarratorDirective implements OnInit, OnDestroy {
  @Input() altText: string = '';
  
  private btnNarrator: HTMLElement | null = null;
  private checkInterval: any;

  constructor(
    private el: ElementRef, 
    private renderer: Renderer2,
    private narratorService: NarratorService
  ) {}

  ngOnInit() {
    // Verificamos periódicamente si el modo narrador está activo en localStorage
    // Alternativamente, esto podría ser un observable en un servicio global.
    this.checkInterval = setInterval(() => {
      const isNarratorActive = localStorage.getItem('DOCGOSI_NARRATOR_ACTIVE') === 'true';
      if (isNarratorActive && !this.btnNarrator) {
        this.createNarratorButton();
      } else if (!isNarratorActive && this.btnNarrator) {
        this.removeNarratorButton();
      }
    }, 1000);
  }

  private createNarratorButton() {
    this.btnNarrator = this.renderer.createElement('button');
    this.renderer.addClass(this.btnNarrator, 'narrator-btn-overlay');
    this.renderer.setProperty(this.btnNarrator, 'innerHTML', '<i class="fa-solid fa-volume-high"></i>');
    this.renderer.setAttribute(this.btnNarrator, 'title', 'Escuchar descripción de imagen');
    
    // Posicionamiento relativo al padre de la imagen
    const parent = this.el.nativeElement.parentNode;
    if (parent) {
      this.renderer.setStyle(parent, 'position', 'relative');
      this.renderer.appendChild(parent, this.btnNarrator);
      
      this.renderer.listen(this.btnNarrator, 'click', (event) => {
        event.stopPropagation();
        const textToRead = this.altText || this.el.nativeElement.alt || 'Imagen sin descripción';
        this.narratorService.speak(textToRead);
      });
    }
  }

  private removeNarratorButton() {
    if (this.btnNarrator && this.btnNarrator.parentNode) {
      this.renderer.removeChild(this.btnNarrator.parentNode, this.btnNarrator);
      this.btnNarrator = null;
    }
  }

  ngOnDestroy() {
    if (this.checkInterval) clearInterval(this.checkInterval);
    this.removeNarratorButton();
  }
}
