import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_EMAIL, ADMIN_PASSWORD, COOKIE_NAME, createToken, verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = createToken(email);
      const response = NextResponse.json({
        success: true,
        user: { email, role: 'Registry Administrator' },
      });

      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60,
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid administrator credentials. Access restricted.' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ error: 'Authentication payload malformed.' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const session = verifyToken(token);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: { email: session.email, role: 'Registry Administrator' },
  });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Session terminated.' });
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}

