describe('Pruebas de Accesibilidad Automatizadas (AXE)', () => {

  const checkA11yOptions = {
    includedImpacts: ['critical', 'serious'], // Opcional: enfocar en los más graves
  };

  it('Debe pasar la auditoría de accesibilidad en la Landing Page', () => {
    cy.visit('/');
    cy.injectAxe();
    // Verifica 0 violaciones de WCAG
    cy.checkA11y(); 
  });

  it('Debe pasar la auditoría de accesibilidad en el Login', () => {
    cy.visit('/login');
    cy.injectAxe();
    cy.checkA11y();
  });

  it('Debe pasar la auditoría en el Dashboard del Paciente', () => {
    // 1. Inyectamos una sesión falsa en el navegador (Mock Login)
    const fakeUser = { id: 1, rol: 'PACIENTE', nombre: 'Test', apellido: 'Paciente' };
    
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('usuario', JSON.stringify(fakeUser));
        win.localStorage.setItem('token', 'fake-jwt-token-12345');
      }
    });

    // 2. Navegamos a las rutas protegidas
    cy.visit('/paciente/dashboard');
    cy.injectAxe();
    cy.checkA11y();
  });

});
