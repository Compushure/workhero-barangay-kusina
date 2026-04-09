describe('When the manager tries to assign badges', () => {
   const testManagerUser = {
    name: 'Cypress Manager',
    email: 'cypress.manager@example.com',
    password: 'CypressPass123!',
    roleType: 'manager',
  }



  before(() => {
    cy.addUser(testManagerUser.name, testManagerUser.email, testManagerUser.password, testManagerUser.roleType)
  })

  after(() => {
    cy.deleteUser(testManagerUser.email)
  })

  beforeEach(() => {
    cy.login(testManagerUser.email, testManagerUser.password)
    cy.visit('/manager/dashboard/badge-assignment')
  })

})