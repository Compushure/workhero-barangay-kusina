describe('When the manager tries to manage the badges', () => {
 const waitIntervalShort = 200
  const waitInterval = 500 // Adjust lng
  const waitIntervalLong = 1800
  const waitIntervalExtraLong = 3000
 const testManagerUser = {
    name: 'Cypress Manager',
    email: 'cypress.manager@example.com',
    password: 'CypressPass123!',
    roleType: 'manager',
  }

  const testBadge = {
    name: 'Cypress Test Badge A',
    description: 'Test badge for assignment tests',
    points: 10,
    awardAtInterval: 'daily',
  }

  const editedTestBadge= {
     name: 'Edited Cypress Test Badge A',
    description: 'Edited Test badge for assignment tests',
    points: 11,
    awardAtInterval: 'manual',
  }


  before(() => {
    cy.addUser(testManagerUser.name, testManagerUser.email, testManagerUser.password, testManagerUser.roleType)
  })

  after(() => {
    cy.deleteUser(testManagerUser.email)
  })

  beforeEach(() => {
    cy.login(testManagerUser.email, testManagerUser.password)
    cy.visit('/manager/badge-editor')
    cy.wait(waitIntervalExtraLong)
  })

  it('should allow manager to access the badge editor ', () => {
    cy.login(testManagerUser.email, testManagerUser.password)
   
    cy.url().should('not.include', '/error')
    cy.get('body').should('be.visible')
  })

  it('should allow the manager to create a new badge', () => {
    cy.wait(waitIntervalExtraLong)
     cy.wait(waitIntervalExtraLong)
     cy.wait(waitIntervalExtraLong)
     cy.wait(waitIntervalExtraLong)
    cy.wait(waitIntervalExtraLong).contains('span', 'Add New Badge').click()
    cy.wait(waitIntervalExtraLong)
    cy.get('input[placeholder="Enter badge name"]').clear().type(testBadge.name)
    cy.get('input[placeholder="Enter badge description"]').clear().type(testBadge.description)
    cy.get('button[role="combobox"]').click()
    cy.contains('[role="option"]', /daily/i).click()
    cy.contains('button', 'Add Condition').click()
    cy.contains('button', 'Add Badge').click()
    cy.wait(waitIntervalLong)
    cy.contains(/add/i).should('be.visible')

  })

  it('should allow the manager to edit an existing badge', () => {
    cy.wait(waitIntervalExtraLong)
    cy.wait(waitIntervalExtraLong)
    cy.wait(waitIntervalExtraLong)
    cy.get('input[placeholder="Search badges by name ..."]').type(testBadge.name)
    cy.wait(waitInterval)
    cy.get('button[title="Edit task"]').click()
    cy.wait(waitIntervalExtraLong)
    cy.get('input[placeholder="Enter badge name"]').clear().type(editedTestBadge.name)
    cy.get('input[placeholder="Enter badge description"]').clear().type(editedTestBadge.description)
    cy.contains('button', '+').click() // sets to 11
    cy.contains('button[role="combobox"]', 'Daily').click()
    cy.contains('[role="option"]', /manual/i).click()
    // Assuming your modal has role="dialog"
    cy.get('[role="dialog"]').find('button').find('svg.lucide-trash2').parent().click()

    cy.contains('button', 'Update Badge').click()
    cy.wait(waitIntervalLong)
    cy.contains(/update/i).should('be.visible')
  })

  it('should allow the manager to delete a badge', () => {
   
    cy.wait(waitIntervalExtraLong)
    cy.wait(waitIntervalExtraLong)
    cy.wait(waitIntervalExtraLong)
    cy.get('input[placeholder="Search badges by name ..."]').type(editedTestBadge.name)
    cy.wait(waitInterval)
    cy.get('button').find('svg.lucide-trash2').parent().click()
    cy.wait(waitIntervalExtraLong)
    cy.contains('button', 'Confirm').click()
    cy.wait(waitIntervalLong)
    cy.contains(/delete/i).should('be.visible')
  })
})