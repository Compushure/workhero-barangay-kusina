'use server';

export async function declineRedemptionRequestAction(requestId: string): Promise<void> {
  // throw new Error('Not implemented yet');
  console.log(`Redemption request with ID ${requestId} has been declined.`);
  return;
}

export async function acceptRedemptionRequestAction(requestId: string): Promise<void> {
  // throw new Error('Not implemented yet');
  console.log(`Redemption request with ID ${requestId} has been accepted.`);
  return;
}
