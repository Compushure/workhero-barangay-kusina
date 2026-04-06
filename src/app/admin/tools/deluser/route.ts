import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * DEPRECATED: Legacy API route for deleting users
 * ⚠️ This route is no longer used by the frontend.
 * The app now uses server actions in /src/actions/manage.ts
 * TODO: Remove this file after confirming no external dependencies
 */

export async function GET(req: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_URL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    message: 'delete user route is working',
  });
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { userid } = body;

    if (!userid) {
      return NextResponse.json({ error: 'userid is required' }, { status: 400 });
    }

    const { error: rowDeleteError } = await supabaseAdmin
      .from('User')
      .delete()
      .eq('id', userid);

    if (rowDeleteError) {
      return NextResponse.json(
        { error: rowDeleteError.message ?? `Failed to delete user row with id ${userid}` },
        { status: 500 }
      );
    }

    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userid);

    if (authDeleteError && !/user not found/i.test(authDeleteError.message ?? '')) {
      return NextResponse.json(
        { error: authDeleteError.message ?? `Failed to delete auth user with id ${userid}` },
        { status: 500 }
      );
    }

    // Success
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}
