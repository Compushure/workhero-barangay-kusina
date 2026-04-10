// support/index.d.ts
/// <reference types="cypress" />

declare namespace Cypress {
  interface AddUserResult {
    userId: string;
    email: string;
    existed: boolean;
  }

  interface DeleteUserResult {
    deleted: boolean;
  }

  interface AddBadgeResult {
    badgeId: string;
  }

  interface DeleteBadgeResult {
    deleted: boolean;
  }

  interface Chainable {
    login(email: string, password: string): void
    // edit the types here in cypress so that they can be used in the commands.ts
    addUser(name: string, email: string, password: string, roleType?: string): Chainable<AddUserResult>
    deleteUser(email: string): Chainable<DeleteUserResult>
    addBadge(
      name: string,
      description?: string | null,
      points?: number,
      awardAtInterval?: string,
      createdByEmail?: string
    ): Chainable<AddBadgeResult>
    deleteBadge(badgeId: string): Chainable<DeleteBadgeResult>
    
  }
}
