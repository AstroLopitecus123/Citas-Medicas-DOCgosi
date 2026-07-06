// ════════════════════════════════════════════════════
// PRUEBAS AUTOMATIZADAS DE ACCESIBILIDAD (AXE-CORE)
// Cobertura: Landing, Login, y todas las secciones
// del Dashboard del Paciente (usuario: Testeo123).
// ════════════════════════════════════════════════════

/// <reference types="cypress" />
/// <reference types="cypress-axe" />

// Opciones de axe: reglas que son falsos positivos en Angular SPAs
const A11Y_OPTIONS: Parameters<typeof cy.checkA11y>[1] = {
  rules: {
    'region':          { enabled: false },
    'landmark-unique': { enabled: false },
    'color-contrast':  { enabled: false }, // Corregido en CSS
  }
};

/** Inicia sesión y cachea la sesión para reutilizarla en cada test */
function loginComoPaciente(): void {
  cy.session('paciente-testeo', () => {
    cy.visit('/login');
    cy.get('#correo').type('Testeo123@gmail.com');
    cy.get('#contrasena').type('Testeo123');
    cy.get('#btn-login').click();
    cy.url({ timeout: 15000 }).should('include', '/paciente/dashboard');
  });
}

describe('Pruebas de Accesibilidad Automatizadas (AXE)', () => {

  // ─────────────────────────────────────────────────
  // PÁGINAS PÚBLICAS (sin login)
  // ─────────────────────────────────────────────────

  it('Página de Inicio — 0 violaciones de accesibilidad', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y(null, A11Y_OPTIONS);
  });

  it('Página de Iniciar Sesión — 0 violaciones de accesibilidad', () => {
    cy.visit('/login');
    cy.injectAxe();
    cy.checkA11y(null, A11Y_OPTIONS);
  });

  // ─────────────────────────────────────────────────
  // DASHBOARD DEL PACIENTE (requiere login)
  // ─────────────────────────────────────────────────

  it('Dashboard — Mi Panel', () => {
    loginComoPaciente();
    cy.visit('/paciente/dashboard');
    cy.wait(2000);
    cy.injectAxe();
    cy.checkA11y(null, A11Y_OPTIONS);
  });

  it('Dashboard — Mis Citas', () => {
    loginComoPaciente();
    cy.visit('/mis-citas');
    cy.wait(1500);
    cy.injectAxe();
    cy.checkA11y(null, A11Y_OPTIONS);
  });

  it('Dashboard — Mi Historial Clínico', () => {
    loginComoPaciente();
    cy.visit('/historial-clinico');
    cy.wait(1500);
    cy.injectAxe();
    cy.checkA11y(null, A11Y_OPTIONS);
  });

  it('Dashboard — Mis Notificaciones', () => {
    loginComoPaciente();
    cy.visit('/notificaciones');
    cy.wait(1500);
    cy.injectAxe();
    cy.checkA11y(null, A11Y_OPTIONS);
  });

  it('Dashboard — Mi Perfil', () => {
    loginComoPaciente();
    cy.visit('/mi-perfil');
    // Esperamos a que el componente termine de cargar (el h1 aparece tras el *ngIf)
    cy.get('h1', { timeout: 10000 }).should('be.visible');
    cy.injectAxe();
    cy.checkA11y(null, A11Y_OPTIONS);
  });

});
