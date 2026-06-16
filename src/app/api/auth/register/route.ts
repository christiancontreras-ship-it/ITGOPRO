import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, isValidEmail, isStrongPassword, checkRateLimit, generateJWT } from '@/lib/auth';

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
    const { email, password, full_name, role = 'client' } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const passwordValidation = isStrongPassword(password);
    if (!passwordValidation.isStrong) {
      return NextResponse.json(
        { error: 'Password does not meet requirements', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    if (full_name.length < 2 || full_name.length > 255) {
      return NextResponse.json(
        { error: 'Full name must be between 2 and 255 characters' },
        { status: 400 }
      );
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single() as any;

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);

    const userData: any = {
      email,
      full_name,
      password_hash: passwordHash,
      role,
      is_active: true,
      is_verified: false,
    };

    const { data: newUser, error: insertError } = await (supabase.from('users') as any).insert(userData).select().single() as any;

    if (insertError || !newUser) {
      console.error('Error creating user:', insertError);
      return NextResponse.json(
        { error: 'Error creating user account' },
        { status: 500 }
      );
    }

    const token = await generateJWT(newUser.id, newUser.email, newUser.role);

    const auditData: any = {
      user_id: newUser.id,
      action: 'REGISTRATION',
      resource_type: 'user',
      ip_address: clientIp,
    };
    await (supabase.from('audit_logs') as any).insert(auditData);

    const { password_hash, mfa_secret, ...safeUser } = newUser;

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully. Please verify your email.',
        user: safeUser,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}