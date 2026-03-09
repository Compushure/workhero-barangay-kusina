export function sanitizeSearchInput(value: string): string {
  // Keep trailing spaces while typing, but ignore accidental leading spaces.
  return value.trimStart();
}

export function normalizeSearchQuery(value: string): string {
  // Treat whitespace-only input as empty (show all), and search case-insensitively.
  return value.trim().toLowerCase();
}
