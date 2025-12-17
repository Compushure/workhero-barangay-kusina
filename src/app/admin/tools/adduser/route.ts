import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_URL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    message: 'add user route is working',
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      name,
      requested_role,
      employee_id,
      employment_status,
      contact_details,
      home_address,
      tin_id,
      sss_id,
      pagibig_id,
    } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'email and password required' }, { status: 400 });
    }

    // Create auth user
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name ?? null },
    });

    if (createError || !createData?.user) {
      return NextResponse.json(
        { error: createError?.message ?? 'Failed to create auth user' },
        { status: 500 }
      );
    }

    const newUser = createData.user;

    // Resolve role_id from Role.type (string). Use case-insensitive match if desired.
    let roleId: string | null = null;
    if (requested_role && typeof requested_role === 'string') {
      const roleQuery = await supabaseAdmin
        .from('Role')
        .select('id')
        .eq('type', requested_role)
        .limit(1)
        .maybeSingle();

      if (roleQuery.error) {
        // If role lookup fails, clean up created auth user to avoid orphaned auth entry
        await supabaseAdmin.auth.admin.deleteUser(newUser.id).catch(() => {});
        return NextResponse.json(
          { error: 'Failed to lookup role: ' + roleQuery.error.message },
          { status: 500 }
        );
      }

      if (roleQuery.data) roleId = roleQuery.data.id;
      else {
        await supabaseAdmin.auth.admin.deleteUser(newUser.id).catch(() => {});
        return NextResponse.json({ error: 'Role not found: ' + requested_role }, { status: 400 });
      }
    }

    // Insert into public."User"
    const insertPayload: any = {
      id: newUser.id,
      email: newUser.email,
      name: name ?? newUser.email ?? null,
      date_added: new Date().toISOString(),
      employee_id: employee_id || null,
      contact_details: contact_details || null,
      home_address: home_address || null,
      tin_id: tin_id || null,
      sss_id: sss_id || null,
      pagibig_id: pagibig_id || null,
      employment_status: employment_status || '',
    };
    if (roleId) insertPayload.role_id = roleId;

    const { data: userRow, error: insertError } = await supabaseAdmin
      .from('User')
      .insert([insertPayload])
      .select()
      .limit(1)
      .maybeSingle();

    if (insertError) {
      // Attempt to rollback auth user creation to avoid orphaned auth entries
      await supabaseAdmin.auth.admin.deleteUser(newUser.id).catch(() => {});
      return NextResponse.json(
        { error: 'Failed to insert user row: ' + insertError.message },
        { status: 500 }
      );
    }

    // Success
    return NextResponse.json({ user: newUser, userRow, ok: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}
