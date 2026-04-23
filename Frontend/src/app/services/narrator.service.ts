import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NarratorService {

  private synthesis = window.speechSynthesis;
  private vocero: SpeechSynthesisUtterance | null = null;
  private isGlobalActive = false;
  private lastText = '';

  constructor() { }

  /**
   * Lee un texto en voz alta usando la API nativa del navegador.
   * @param texto El texto a narrar
   */
  speak(texto: string) {
    if (!texto || texto === this.lastText && this.synthesis.speaking) return;

    this.stop();
    this.lastText = texto;

    this.vocero = new SpeechSynthesisUtterance(texto);
    this.vocero.lang = 'es-ES';
    this.vocero.rate = 1.1; // Un poco más rápido para fluidez al navegar
    this.vocero.pitch = 1.0;

    this.synthesis.speak(this.vocero);
  }

  stop() {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }

  // --- NARRADOR GLOBAL DE PÁGINA ---

  activateGlobalNarrator() {
    if (this.isGlobalActive) return;
    this.isGlobalActive = true;
    
    window.addEventListener('mouseover', this.handleMouseOver);
    window.addEventListener('focus', this.handleFocus, true);
  }

  deactivateGlobalNarrator() {
    this.isGlobalActive = false;
    window.removeEventListener('mouseover', this.handleMouseOver);
    window.removeEventListener('focus', this.handleFocus, true);
    this.stop();
  }

  private handleMouseOver = (event: MouseEvent) => {
    this.processElement(event.target as HTMLElement);
  };

  private handleFocus = (event: FocusEvent) => {
    this.processElement(event.target as HTMLElement);
  };

  private processElement(el: HTMLElement) {
    if (!el || !this.isGlobalActive) return;

    // Evitar leer el panel de accesibilidad mismo para no saturar
    if (el.closest('.acc-fab-wrapper')) return;

    let text = '';

    // 1. Prioridad: Texto de ayuda o alt
    if (el.getAttribute('aria-label')) text = el.getAttribute('aria-label')!;
    else if (el.title) text = el.title;
    else if (el instanceof HTMLImageElement && el.alt) text = "Imagen: " + el.alt;
    
    // 2. Si es un input o botón, leer su etiqueta
    else if (el.innerText && el.innerText.trim().length > 0) {
      text = el.innerText.trim();
    }
    
    // 3. Casos especiales de inputs
    else if (el instanceof HTMLInputElement) {
      text = el.placeholder || "Campo de texto";
    }

    if (text && text !== this.lastText) {
      this.speak(text);
    }
  }

  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}
