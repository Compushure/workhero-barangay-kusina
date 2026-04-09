describe('When the superadmin logs in', () => {
  const testSuperAdminUser = {
    name: 'Cypress Superadmin',
    email: 'cypress.superadmin@example.com',
    password: 'CypressPass123!',
    roleType: 'superadmin',
  }
  const testManagerUser = {
    name: 'Cypress Manager',
    email: 'cypress.manager@example.com',
    password: 'CypressPass123!',
    roleType: 'manager',
  }

  const testHRUser = {
    name: 'Cypress HR',
    email: 'cypress.hr@example.com',
    password: 'CypressPass123!',
    roleType: 'hr',
  }

  const testRegularUser = {
    name: 'Cypress Regular',
    email: 'cypress.regular@example.com',
    password: 'CypressPass123!',
    roleType: 'regular',
  }

  const usersToSeed = [testSuperAdminUser, testManagerUser, testHRUser, testRegularUser]


  before(() => {
    usersToSeed.forEach((user) => {
      cy.addUser(user.name, user.email, user.password, user.roleType)
    })
  })

  after(() => {
    usersToSeed.forEach((user) => {
      cy.deleteUser(user.email)
    }) 
  })

  beforeEach(() => {
    cy.login(testSuperAdminUser.email, testSuperAdminUser.password  )
    cy.visit('/admin/manage')
  })
  

  it('should allow the superadmin to access the admin panel', () => {
    cy.url().should('not.include', '/error')
    cy.get('body').should('be.visible')
  })

  // Happy pathssss
  it('should allow superadmin to add a user', () => {})
  it('should allow super admin to edit a user', () => {})
  it('should allow super admin to delete a user', () => {})
  it('should allow a user to search for other users')
})