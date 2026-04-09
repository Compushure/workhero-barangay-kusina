// support/index.d.ts
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): void
    // edit the types here in cypress so that they can be used in the commands.ts
    addUser(name: string, email: string, password: string, roleType?: string): void
    deleteUser(email: string): void
    
  }
}
