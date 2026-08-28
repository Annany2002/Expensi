import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const newUser = await User.create({
      email: normalizedEmail,
      passwordHash,
      name: (name || '').trim(),
    });

    const token = await signToken({
      userId: newUser._id.toString(),
      email: newUser.email,
    });

    const response = NextResponse.json(
      {
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          name: newUser.name,
        },
      },
      { status: 201 },
    );

    response.cookies.set('expensi_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    console.error('Error during registration:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
