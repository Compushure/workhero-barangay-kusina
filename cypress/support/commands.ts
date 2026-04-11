/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.task('login', {
    email: email,
    password: password,
  }).then((session) => {
    console.log(JSON.stringify(session))
    cy.setCookie('sb-kudwgdpppjanzmclyugl-auth-token', JSON.stringify(session))
  })
})
 
// EDIT THIS ADD COMMAND SO THAT IT It works with the actions in the server actions and not the API routes
Cypress.Commands.add(
  'addUser',
  (name: string, email: string, password: string, roleType: string = 'superadmin') => {
    return cy.task('addUser', {
      name: name,
      email: email,
      password: password,
      roleType: roleType,
    })
  }
)
Cypress.Commands.add('deleteUser', (email: string) => {
  return cy.task('deleteUser', { email })
})

Cypress.Commands.add(
  'addBadge',
  (
    name: string,
    description: string | null = null,
    points: number = 10,
    awardAtInterval: string = 'none',
    createdByEmail?: string
  ) => {
    return cy.task('addBadge', {
      name,
      description,
      points,
      awardAtInterval,
      createdByEmail,
    })
  }
)

Cypress.Commands.add('deleteBadge', (badgeId: string) => {
  return cy.task('deleteBadge', { badgeId })
})