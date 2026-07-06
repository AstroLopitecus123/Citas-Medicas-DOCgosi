import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'https://frontend-citas-production.up.railway.app',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
});
