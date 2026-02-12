/**
 * Manager Badge Assignment Query Hooks
 * ====================================
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { BadgeAssignmentUser, BadgeSummary } from '@/types/manager/badge-assignment';
import {
  handleFetchAllBadges,
  handleFetchBadgeAssignmentUsers,
  handleFetchManualBadges,
} from '@/action-handlers/manager/badge-assignment';

export const badgeAssignmentKeys = {
  all: ['manager-badge-assignment'] as const,
  badges: () => [...badgeAssignmentKeys.all, 'badges'] as const,
  manualBadges: () => [...badgeAssignmentKeys.badges(), 'manual'] as const,
  allBadges: () => [...badgeAssignmentKeys.badges(), 'all'] as const,
  users: () => [...badgeAssignmentKeys.all, 'users'] as const,
};

export function useGetManualBadges(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<BadgeSummary[], Error> {
  return useQuery({
    queryKey: badgeAssignmentKeys.manualBadges(),
    queryFn: async () => handleFetchManualBadges(),
    enabled: queryOptions.enabled !== false,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<BadgeSummary[], Error>;
}

export function useGetAllBadges(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<BadgeSummary[], Error> {
  return useQuery({
    queryKey: badgeAssignmentKeys.allBadges(),
    queryFn: async () => handleFetchAllBadges(),
    enabled: queryOptions.enabled !== false,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<BadgeSummary[], Error>;
}

export function useGetBadgeAssignmentUsers(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<BadgeAssignmentUser[], Error> {
  return useQuery({
    queryKey: badgeAssignmentKeys.users(),
    queryFn: async () => handleFetchBadgeAssignmentUsers(),
    enabled: queryOptions.enabled !== false,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<BadgeAssignmentUser[], Error>;
}
