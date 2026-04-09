describe('Cypress user-management smoke', () => {
  const testUser = {
    name: 'Cypress Superadmin',
    email: 'cypress.superadmin@example.com',
    password: 'CypressPass123!',
    roleType: 'superadmin',
  }

  // 😃😃😃😃HELL Paki PLES PLES PEASELLKDJF OMG  make sure that you have your .env.local st
  // as the test db variables WHY? BECUASE WER"E TESTING H
  // oh btw env.prod should be prod variables
  // also make sure to add a beforeEach that handles the cy.login kay need na pra ma ka session kamo
  // NOTE THAT SOME NEXTJS STUFFS CANNOT BE DONE IN CYPRESS BCUZ NODE ni bye

  before(() => {
    cy.addUser(testUser.name, testUser.email, testUser.password, testUser.roleType)
  })

  after(() => {
    cy.deleteUser(testUser.email)
  })

  it('retains session on admin/manage', () => {
    cy.login(testUser.email, testUser.password)
    cy.visit('/admin/manage')
    cy.url().should('not.include', '/error')
    cy.get('body').should('be.visible')
  })
})