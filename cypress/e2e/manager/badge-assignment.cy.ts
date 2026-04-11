describe('When the manager tries to assign badges', () => {
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
  const testRegularUser = {
    name: 'Cypress Regular',
    email: 'cypress.regular@example.com',
    password: 'CypressPass123!',
    roleType: 'regular',
    
  }
   const testRegularUser2 = {
    name: 'Cypress Regular2',
    email: 'cypress.regular2@example.com',
    password: 'CypressPass123!',
    roleType: 'regular',
    
  }

const usersToSeed = [testManagerUser, testRegularUser, testRegularUser2]
const badgesToSeed = [
  {
    name: 'Cypress Badge A',
    description: 'Seeded badge for assignment tests',
    points: 10,
    awardAtInterval: 'none',
  },
  {
    name: 'Cypress Badge B',
    description: 'Second seeded badge for assignment tests',
    points: 25,
    awardAtInterval: 'none',
  },
]

const seededBadgeIds: string[] = []

 before(() => {
    usersToSeed.forEach((user) => {
      cy.addUser(user.name, user.email, user.password, user.roleType)
    })

    badgesToSeed.forEach((badge) => {
      cy.addBadge(
        badge.name,
        badge.description,
        badge.points,
        badge.awardAtInterval,
        testManagerUser.email
      ).then((result) => {
        const badgeId = (result as { badgeId?: string }).badgeId
        if (badgeId) {
          seededBadgeIds.push(badgeId)
        }
      })
    })
  })

  after(() => {
    seededBadgeIds.forEach((badgeId) => {
      cy.deleteBadge(badgeId)
    })

    usersToSeed.forEach((user) => {
      cy.deleteUser(user.email)
    }) 
  })

  beforeEach(() => {
    cy.login(testManagerUser.email, testManagerUser.password)
    cy.visit('/manager/badge-assignment#users')
    cy.wait(waitIntervalLong)
  })

  it('should allow the manager to access the badge assignment page', () => {
    cy.url().should('not.include', '/error')
    cy.get('body').should('be.visible')
  })

    it('should allow the manager to search and assign badges to a specific user', () => {
    cy.wait(waitIntervalExtraLong)
        // search for the user
    cy.wait(waitIntervalExtraLong).get('input[placeholder="Search employees"]').type(testRegularUser.name)
    cy.wait(waitInterval).contains(testRegularUser.name).should('be.visible')
    cy.contains('button', 'Award Badge').click()
    cy.wait(waitIntervalExtraLong)
    cy.get('[role="dialog"][data-state="open"]').should('be.visible')
     cy.get('[role="dialog"][data-state="open"]').within(() => {
    cy.get('input[placeholder="Search by badge name"]').type(badgesToSeed[0].name)
     cy.wait(waitInterval).contains(badgesToSeed[0].name).should('be.visible')
     cy.contains('h4', badgesToSeed[0].name).click()
     cy.wait(waitInterval)
     cy.get('button[data-variant="default"][data-size="default"]').contains('Award Badge').click()
    
  })
     cy.wait(waitIntervalExtraLong).contains(/awarded/i).should('be.visible')
  })
  it('should allow the manager to search for a specific badge and assign them to multiple users', () => {
    cy.wait(waitIntervalExtraLong)
    cy.wait(waitIntervalExtraLong).contains('span', 'Quick Assignment').click()
    cy.wait(waitInterval)
    cy.get('input[placeholder="Search badges"]').clear().type(badgesToSeed[1].name)
    cy.wait(waitInterval).contains(badgesToSeed[1].name).should('be.visible')
    cy.contains('div', badgesToSeed[1].name).click()
    cy.contains('div', testManagerUser.name).click()
    cy.contains('div', testRegularUser.name).click()
    cy.contains('div', testRegularUser2.name).click()
    cy.contains('button', 'Assign to 3 Users').click()
    cy.wait(waitIntervalLong)
    cy.wait(waitIntervalExtraLong).contains(/awarded/i).should('be.visible')

    // cy.get('button[data-variant="default"][data-size="default"]').contains('Award Badge').click()
  })

})