import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(auth.userId).select('_id email name').lean();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || '',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Auth check failed';
    console.error('Error in /api/auth/me:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
