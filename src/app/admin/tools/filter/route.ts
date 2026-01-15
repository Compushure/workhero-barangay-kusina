import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Apply search/query
    if (query && searchColumn) {
      // Use ilike for case-insensitive partial match on the mapped column
      // Escape % and _ in query to avoid accidental wildcard injection
      const escaped = query.replace(/[%_]/g, '\\$&');
      sb = sb.ilike(searchColumn, `${escaped}%`);
    } else if (query && !searchColumn) {
      // If queryby not provided or not recognized, search across name and email
      const escaped = query.replace(/[%_]/g, '\\$&');
      // Supabase JS doesn't support OR chaining easily, so use filter then or:
      // We'll do two queries union client-side for reliability (or use rpc for more complex needs).
      // Simpler approach: use text search on user_name first, fallback to email if zero results.
      const primary = await sb.ilike('user_name', `${query}%`).range(from, to);
      if (primary.error) {
        console.error('Supabase search error', primary.error);
        return NextResponse.json({ error: primary.error.message }, { status: 500 });
      }
      const dataPrimary = primary.data ?? [];
      if (dataPrimary.length > 0) {
        const users = mapRowsToUsers(dataPrimary);
        return NextResponse.json({ users, page, pageSize }, { status: 200 });
      }
      // fallback to email
      const fallback = await supabase
        .from('user_role_attribute')
        .select(
          'user_id, user_name, user_email, role_type, user_date_added, employee_id, contact_details, home_address, tin_id, sss_id, employment_status, pagibig_id'
        )
        .ilike('user_email', `${query}%`)
        .order(sortColumn, { ascending: order === 'asc' })
        .range(from, to);
      if (fallback.error) {
        console.error('Supabase search fallback error', fallback.error);
        return NextResponse.json({ error: fallback.error.message }, { status: 500 });
      }
      const users = mapRowsToUsers(fallback.data ?? []);
      return NextResponse.json({ users, page, pageSize }, { status: 200 });
    }

    // If we reach here, no special multi-column search fallback needed — execute accumulated query with pagination
    const result = await sb.range(from, to);

    if (result.error) {
      console.error('Supabase error', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    const rows = result.data ?? [];
    const users = mapRowsToUsers(rows);

    return NextResponse.json({ users, page, pageSize }, { status: 200 });
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
