import type { VerificationRequest, SortOption } from '@/types/manager-verification-req';

/**
 * Filters and sorts verification requests based on search term, sort option, and statuses.
 */
export function filterRequests(
  requests: VerificationRequest[],
  searchTerm: string,
  sortBy: SortOption,
  statuses: Map<string, 'approved' | 'denied'>
): VerificationRequest[] {
  let result = [...requests];

  // Apply search filter
  if (searchTerm.trim()) {
    const lowerSearch = searchTerm.toLowerCase();
    result = result.filter(
      (req) =>
        req.employeeName.toLowerCase().includes(lowerSearch) ||
        req.employeeId.toLowerCase().includes(lowerSearch)
    );
  }

  // Apply status filter
  result = result.filter((req) => {
    const status = statuses.get(req.id);
    if (status === 'approved') return sortBy === 'approved';
    if (status === 'denied') return sortBy === 'denied';
    return sortBy === 'pending';
  });

  // Sort by date (newest first)
  result.sort((a, b) => b.date.getTime() - a.date.getTime());

  return result;
}
