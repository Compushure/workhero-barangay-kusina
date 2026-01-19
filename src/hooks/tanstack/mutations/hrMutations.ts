import {
  handleAcceptRedemptionRequestAction,
  handleDeclineRedemptionRequestAction,
} from '@/action-handlers/hr';
import { useMutation } from '@tanstack/react-query';

interface RedemptionRequestParams {
  id: string;
  remarks?: string;
}

export function useDeclineRedemptionRequest() {
  return useMutation({
    mutationFn: async (params: RedemptionRequestParams): Promise<void> => {
      await handleDeclineRedemptionRequestAction(params);
    },
  });
}

export function useAcceptRedemptionRequest() {
  return useMutation({
    mutationFn: async (params: RedemptionRequestParams): Promise<void> => {
      await handleAcceptRedemptionRequestAction(params);
    },
  });
}
