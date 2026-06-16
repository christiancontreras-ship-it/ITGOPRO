import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, checkRateLimit, generateJWT } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single() as any;

    const user = userData as any;

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'User account is disabled' },
        { status: 401 }
      );
    }

    if (hashPassword(password) !== user.password_hash) {
      const failedAudit: any = {
        user_id: user.id,
        action: 'LOGIN_FAILED',
        resource_type: 'user',
        ip_address: clientIp,
      };
      await (supabase.from('audit_logs') as any).insert(failedAudit);

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (user.mfa_enabled) {
      const tempToken = await generateJWT(user.id, user.email, user.role);
      return NextResponse.json(
        {
          mfa_required: true,
          temp_token: tempToken,
          user_id: user.id,
        },
        { status: 202 }
      );
    }

    const token = await generateJWT(user.id, user.email, user.role);

    const updateData: any = { last_login: new Date().toISOString() };
    await (supabase
      .from('users') as any
      .update(updateData)
      .eq('id', user.id));

    const successAudit: any = {
      user_id: user.id,
      action: 'LOGIN_SUCCESS',
      resource_type: 'user',
      ip_address: clientIp,
    };
    await (supabase.from('audit_logs') as any).insert(successAudit);

    const { password_hash, mfa_secret, ...safeUser } = user;

    return NextResponse.json(
      {
        success: true,
        user: safeUser,
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}