describe('Cypress user-management smoke', () => {
  const testUser = {
    name: 'Cypress Superadmin',
    email: 'cypress.superadmin@example.com',
    password: 'CypressPass123!',
    roleType: 'superadmin',
  }

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