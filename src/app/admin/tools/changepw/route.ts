import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_URL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    message: 'Change password route is working',
  });
}

export async function POST(req: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_URL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { user_id, new_password } = body;

  if (!new_password || typeof new_password !== 'string' || new_password.length < 6) {
    return NextResponse.json(
      { error: 'Invalid password, must at least be 6 characters' },
      { status: 400 }
    );
  }
  if (!user_id) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  try {
    let result;
    if (user_id) {
      result = await supabaseAdmin.auth.admin.updateUserById(user_id, {
        password: new_password,
      });
    }

    if (result?.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('set-password error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
