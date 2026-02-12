/**
 * Manager Badge Query Hooks
 * =========================
 * TanStack Query hooks for badge editor data.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { Badge, BadgeOption } from '@/types/manager/badge-editor';
import {
  handleFetchBadgeAttendanceOptions,
  handleFetchBadgeAttributeOptions,
  handleFetchBadgeTaskOptions,
  handleFetchBadges,
} from '@/action-handlers/manager/badges';

export const badgeKeys = {
  all: ['manager-badges'] as const,
  lists: () => [...badgeKeys.all, 'list'] as const,
  list: () => [...badgeKeys.lists()] as const,
  taskOptions: () => [...badgeKeys.all, 'task-options'] as const,
  attributeOptions: () => [...badgeKeys.all, 'attribute-options'] as const,
  attendanceOptions: () => [...badgeKeys.all, 'attendance-options'] as const,
};

export function useGetBadges(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<Badge[], Error> {
  return useQuery({
    queryKey: badgeKeys.list(),
    queryFn: async () => handleFetchBadges(),
    enabled: queryOptions.enabled !== false,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<Badge[], Error>;
}

export function useGetBadgeTaskOptions(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<BadgeOption[], Error> {
  return useQuery({
    queryKey: badgeKeys.taskOptions(),
    queryFn: async () => handleFetchBadgeTaskOptions(),
    enabled: queryOptions.enabled !== false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  }) as UseQueryResult<BadgeOption[], Error>;
}

export function useGetBadgeAttributeOptions(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<BadgeOption[], Error> {
  return useQuery({
    queryKey: badgeKeys.attributeOptions(),
    queryFn: async () => handleFetchBadgeAttributeOptions(),
    enabled: queryOptions.enabled !== false,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  }) as UseQueryResult<BadgeOption[], Error>;
}

export function useGetBadgeAttendanceOptions(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<BadgeOption[], Error> {
  return useQuery({
    queryKey: badgeKeys.attendanceOptions(),
    queryFn: async () => handleFetchBadgeAttendanceOptions(),
    enabled: queryOptions.enabled !== false,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  }) as UseQueryResult<BadgeOption[], Error>;
}
