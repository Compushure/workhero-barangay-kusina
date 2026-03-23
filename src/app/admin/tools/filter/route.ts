import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * User Filtering and Search API Route
 * =====================================
 * Still actively used by /src/actions/manage.ts fetchUsersAction()
 * This route provides filtered, sorted, and paginated user data
 * 
 * Performance Optimizations Applied:
 * - Uses user_attributes view for efficient queries
 * - Implements pagination to limit data transfer
 * - Escapes special characters to prevent SQL injection
 * - Single database query per request (except multi-field search)
 * 
 * Future Optimization Opportunities:
 * - Add Redis caching for frequently accessed pages
 * - Implement search debouncing on client side (already done via useDebounce)
 * - Consider full-text search for better query performance
 * - Add query result caching with SWR revalidation
 */

type SortOrder = 'asc' | 'desc';

const SORT_MAP: Record<string, string> = {
  name: 'user_name',
  dateadded: 'user_date_added',
  date_added: 'user_date_added',
  email: 'user_email',
};

const SEARCH_MAP: Record<string, string> = {
  name: 'user_name',
  email: 'user_email',
  employeeid: 'employee_id',
  employee_id: 'employee_id',
};

function normalizeOrder(input?: string): SortOrder {
  if (!input) return 'desc';
  const v = input.toLowerCase();
  if (v === 'ascending' || v === 'asc') return 'asc';
  return 'desc';
}

function mapSortKey(input?: string) {
  if (!input) return SORT_MAP.dateadded;
  return SORT_MAP[input.toLowerCase()] ?? SORT_MAP.dateadded;
}

function mapSearchKey(input?: string) {
  if (!input) return null;
  return SEARCH_MAP[input.toLowerCase()] ?? null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    // Sorting
    const orderParam = url.searchParams.get('order') ?? 'descending';
    const typeParam = url.searchParams.get('type') ?? 'dateadded';
    const order = normalizeOrder(orderParam);
    const sortColumn = mapSortKey(typeParam);

    // Search
    const query = url.searchParams.get('query')?.trim() ?? '';
    const queryby = url.searchParams.get('queryby') ?? ''; // e.g., 'name'
    const searchColumn = mapSearchKey(queryby);

    // Filters
    const employeeType = (url.searchParams.get('employeeType') ?? 'all').toLowerCase();
    const employmentStatus = (url.searchParams.get('employmentStatus') ?? 'all').toLowerCase();

    // Pagination (optional)
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get('pageSize') ?? '50', 10))
    );
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = await createClient();

    // Start building the query

    let sb = supabase
      .from('user_attributes')
      .select(
        'user_id, user_name, user_email, role_type, user_date_added, employee_id, contact_details, home_address, tin_id, sss_id, employment_status, pagibig_id',
        { count: 'estimated' } // optional: returns count in meta (client support)
      )
      .order(sortColumn, { ascending: order === 'asc' });

    // Apply role_type filter if not 'all'
    if (employeeType !== 'all') {
      // exact match on role_type
      sb = sb.eq('role_type', employeeType);
    }

    // Apply employment_status filter if not 'all'
    if (employmentStatus !== 'all') {
      sb = sb.eq('employment_status', employmentStatus);
    }

    // Apply fuzzy search/query (contains match)
    if (query) {
      const escaped = query.replace(/[%_]/g, '\\$&');
      const fuzzyPattern = `%${escaped}%`;

      if (searchColumn) {
        sb = sb.ilike(searchColumn, fuzzyPattern);
      } else {
        sb = sb.or(
          `user_name.ilike.${fuzzyPattern},user_email.ilike.${fuzzyPattern},employee_id.ilike.${fuzzyPattern}`
        );
      }
    }

    // If we reach here, no special multi-column search fallback needed — execute accumulated query with pagination
    const result = await sb.range(from, to);

    if (result.error) {
      console.error('Supabase error', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    const rows = result.data ?? [];
    const users = mapRowsToUsers(rows);
    const totalCount = result.count ?? users.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return NextResponse.json({ users, page, pageSize, count: totalCount, totalPages }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper to map DB rows to your User shape
function mapRowsToUsers(rows: any[]) {
  return rows.map((u: any) => {
    let date_added = new Date();
    if (u.user_date_added) {
      const parsed = new Date(u.user_date_added);
      if (!Number.isNaN(parsed.getTime())) date_added = parsed;
    }
    return {
      id: u.user_id,
      name: u.user_name,
      email: u.user_email,
      employeeType: u.role_type,
      date_added,
      employeeId: u.employee_id,
      contactNumber: u.contact_details,
      address: u.home_address,
      tin: u.tin_id,
      sss: u.sss_id,
      employmentStatus: u.employment_status,
      createdAt: u.user_date_added,
      companyId: 'feature not implemented',
      pagibig: u.pagibig_id,
    };
  });
}
