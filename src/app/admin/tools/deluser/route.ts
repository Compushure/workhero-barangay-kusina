import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

    // Delete auth user
    const { data: deleteData, error: deleteError } = await supabaseAdmin
      .from('User')
      .delete()
      .eq('id', userid);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError?.message ?? `Failed to delete auth user with id ${userid}` },
        { status: 500 }
      );
    }

    // Success
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}
