import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * almot thougot to abandon  this api route after na na conflict due to 'database meddling ' from 
 * one of the AI refactorsby another member. In order to simplify the flow, 
 * instead do not delete from the auth.users which causes supabase to act up due to 
 * supabase being very strict with modifying scheas taht are not the public schema 
 * new tactic was to delete from public and now attach a trigger to delete from auth when a delete on public was ran
 * this puts the trigger on the PUBLIC. USERS table and avoids conflict with supabase persmiisions
 * IN THE FUTURE SIMPLIFY THE PROCESS BY USING SERVER ACTIONS INSTEAD
 * this was done as an api route as a demonstration of how to use the supabase admin client and also to show how to handle backend logic with nextjs api routes, but with the new server actions this is no longer needed and just adds an extra layer of complexity and potential points of failure
 * ANTON
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
