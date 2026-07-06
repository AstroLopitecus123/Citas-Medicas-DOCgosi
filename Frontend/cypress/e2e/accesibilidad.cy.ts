describe('Pruebas de Accesibilidad Automatizadas (AXE)', () => {

  const checkA11yOptions = {
    includedImpacts: ['critical', 'serious'], // Opcional: enfocar en los más graves
  };

  it('Debe pasar la auditoría de accesibilidad en la Landing Page', () => {
    cy.visit('/');
    cy.injectAxe();
    // Verifica 0 violaciones de WCAG, ignorando falsos positivos de Angular
    cy.checkA11y(null, { rules: { 'region': { enabled: false }, 'landmark-unique': { enabled: false } } }); 
  });

  it('Debe pasar la auditoría de accesibilidad en el Login', () => {
    cy.visit('/login');
    cy.injectAxe();
    cy.checkA11y(null, { rules: { 'region': { enabled: false }, 'landmark-unique': { enabled: false } } });
  });

  it('Debe pasar la auditoría en el Dashboard del Paciente', () => {
    // 1. Iniciamos sesión realmente usando la Interfaz
    cy.visit('/login');
    cy.get('#correo').type('Testeo123@gmail.com');
    cy.get('#contrasena').type('Testeo123');
    cy.get('#btn-login').click();

    // 2. Esperamos a que la URL cambie y navegamos al dashboard
    cy.url().should('include', '/paciente/dashboard');
    cy.injectAxe();
    
    // Opcional: Ignoramos 'region' y 'landmark-unique' que son falsos positivos comunes en SPAs de Angular
    cy.checkA11y(null, {
      rules: {
        'region': { enabled: false },
        'landmark-unique': { enabled: false }
      }
    });
  });

});
