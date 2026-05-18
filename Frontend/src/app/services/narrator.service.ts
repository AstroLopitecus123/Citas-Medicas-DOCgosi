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

  speak(texto: string) {
    if (!texto || texto === this.lastText && this.synthesis.speaking) return;

    this.stop();
    this.lastText = texto;

    this.vocero = new SpeechSynthesisUtterance(texto);
    this.vocero.lang = 'es-ES';
    this.vocero.rate = 1.1; 
    this.vocero.pitch = 1.0;

    this.synthesis.speak(this.vocero);
  }

  stop() {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }

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

  private processElement(el: any) {
    if (!el || !this.isGlobalActive) return;

    const htmlEl = el as HTMLElement;
    if (!htmlEl.closest) return;

    if (htmlEl.closest('.acc-fab-wrapper')) return;

    let text = '';

    if (el.getAttribute('aria-label')) text = el.getAttribute('aria-label')!;
    else if (el.title) text = el.title;
    else if (el instanceof HTMLImageElement && el.alt) text = "Imagen: " + el.alt;

    else if (el.innerText && el.innerText.trim().length > 0) {
      text = el.innerText.trim();
    }

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
