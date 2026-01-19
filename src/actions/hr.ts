'use server';

export async function declineRedemptionRequestAction(
  requestId: string,
  remarks?: string
): Promise<void> {
  // throw new Error('Not implemented yet');
  console.log(`Redemption request with ID ${requestId} has been declined.`);
  if (remarks) {
    console.log(`Decline remarks: ${remarks}`);
  }
  return;
}

export async function acceptRedemptionRequestAction(
  requestId: string,
  remarks?: string
): Promise<void> {
  // throw new Error('Not implemented yet');
  console.log(`Redemption request with ID ${requestId} has been accepted.`);
  if (remarks) {
    console.log(`Accept remarks: ${remarks}`);
  }
  return;
}
