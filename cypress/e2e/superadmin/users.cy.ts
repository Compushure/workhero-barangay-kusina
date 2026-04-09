describe('When the superadmin logs in', () => {
  const waitIntervalShort = 200
  const waitInterval = 500 // Adjust lng
  const waitIntervalLong = 1800
  const waitIntervalExtraLong = 3000
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

  const testUsertoAdd = {
    name: 'Cypress User To Add',
    email: 'cypress.addeduser@example.com', 
    password: 'CypressPass123!',
    roleType: 'regular',  
    contactNumber: '09183937700'
  }
  
  const editedTestUser = {
    name: 'Cypress User Edited',
    passwprd: "EditedCypressPass123!",
    contactNumber: '09998887766',
    address: 'Edited Test Address', 
    tin:  '123456789', 
    sss: '1234567890', 
    pagibig: '012345678910'
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
    cy.wait(waitIntervalLong)
  })
  

  it('should allow the superadmin to access the admin panel', () => {
    cy.url().should('not.include', '/error')
    cy.get('body').should('be.visible')
  })

  // Happy pathssss
  it('should allow superadmin to add a user', () => {
  
    // reference 
    const addButton =cy.get('button[aria-label="Add User"]')
    addButton.click()
    cy.wait(waitIntervalExtraLong)
    cy.get('#add-name').type(testUsertoAdd.name)
    cy.get('#add-email').type(testUsertoAdd.email)
    cy.get('#add-password').type(testUsertoAdd.password)
    cy.get('#add-contact').type(testUsertoAdd.contactNumber)
    cy.get('button[type="submit"][form="add-user-form"]').click()
    cy.wait(waitIntervalLong)
    cy.wait(waitIntervalExtraLong).contains(testUsertoAdd.name).should('be.visible')
    cy.wait(waitIntervalExtraLong).contains(/success/i).should('be.visible')
  })

  it('should allow super admin to edit a user', () => {
    cy.get('p[title="Cypress User To Add"]').click()
    cy.wait(waitInterval)
    cy.contains('button', 'Edit User').click()
    cy.wait(waitIntervalExtraLong)
    cy.contains('button', 'Edit All').click()
    cy.wait(waitIntervalShort)
    cy.get('#edit-name').clear().type(editedTestUser.name)
    cy.get('#edit-contact').clear().type(editedTestUser.contactNumber)
    cy.get('#edit-address').clear().type(editedTestUser.address)
    cy.get('#edit-tin').clear().type(editedTestUser.tin)
    cy.get('#edit-sss').clear().type(editedTestUser.sss)
    cy.get('#edit-pagibig').clear().type(editedTestUser.pagibig)
    cy.get('button[type="submit"][form="edit-user-form"]').click()
    cy.wait(waitIntervalLong)
    cy.wait(waitIntervalExtraLong).contains(editedTestUser.name).should('be.visible')
    cy.contains(/success/i).should('be.visible')

  })

  it('should allow super admin to delete a user', () => {
    cy.get('p[title="Cypress User Edited"]').click()
    cy.wait(waitInterval)
    cy.contains('button', 'Delete User').click()
    cy.wait(waitIntervalExtraLong)
    cy.get('button[data-variant="destructive"][data-size="default"]').click()
    cy.wait(waitIntervalExtraLong).contains(editedTestUser.name).not('be.visible')
    cy.wait(waitIntervalLong).contains(/success/i).should('be.visible')

  })
  it('should allow a user to search for a manager user', () => {
    // Open the combobox
    cy.get('#filter-type').click()
    cy.contains('[role="option"]', /manager/i).click()
    cy.get('#search').type(testManagerUser.name)
    cy.wait(waitIntervalLong).contains(testManagerUser.name).should('be.visible')


  })
  it('should allow a user to search for a hr user', () => {
    cy.get('#filter-type').click()
    cy.contains('[role="option"]', /hr/i).click()
    cy.get('#search').type(testHRUser.name)
    cy.wait(waitIntervalLong).contains(testHRUser.name).should('be.visible')

  })

  it('should allow a user to search for a regular user', () => {
    cy.get('#filter-type').click()
    cy.contains('[role="option"]', /regular/i).click()
    cy.get('#search').type(testRegularUser.name)
    cy.wait(waitIntervalLong).contains(testRegularUser.name).should('be.visible')
  })
})