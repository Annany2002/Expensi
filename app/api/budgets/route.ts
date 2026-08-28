import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Budget from '@/models/Budget';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const month = req.nextUrl.searchParams.get('month'); // e.g. "2026-08"

    if (!month) {
      const allBudgets = await Budget.find({ userId: auth.userId }).lean();
      return NextResponse.json({
        budgets: allBudgets.map((b) => ({ month: b.month, amount: b.amount })),
      });
    }

    const budgetDoc = await Budget.findOne({ userId: auth.userId, month }).lean();
    return NextResponse.json({
      month,
      amount: budgetDoc ? budgetDoc.amount : null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch budget';
    console.error('Error fetching budget:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { month, amount } = body;

    if (!month) {
      return NextResponse.json({ error: 'Month (YYYY-MM) is required' }, { status: 400 });
    }

    const parsedAmount = amount === null || amount === '' ? null : Math.max(0, Number(amount));

    const updated = await Budget.findOneAndUpdate(
      { userId: auth.userId, month },
      { userId: auth.userId, month, amount: parsedAmount },
      { upsert: true, new: true },
    );

    return NextResponse.json({
      month: updated.month,
      amount: updated.amount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update budget';
    console.error('Error updating budget:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
