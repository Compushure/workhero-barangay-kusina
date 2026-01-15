import {
  handleAcceptRedemptionRequestAction,
  handleDeclineRedemptionRequestAction,
} from '@/action-handlers/hr';
import { useMutation } from '@tanstack/react-query';

export function useDeclineRedemptionRequest() {
  return useMutation({
    mutationFn: async (requestId: string): Promise<void> => {
      await handleDeclineRedemptionRequestAction(requestId);
    },
  });
}

export function useAcceptRedemptionRequest() {
  return useMutation({
    mutationFn: async (requestId: string): Promise<void> => {
      await handleAcceptRedemptionRequestAction(requestId);
    },
  });
}
