import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Expense from '@/models/Expense';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const month = req.nextUrl.searchParams.get('month'); // e.g. "2026-08"

    const userObjectId = new mongoose.Types.ObjectId(auth.userId);

    // 1. All-time aggregate for this user
    const allTimeResult = await Expense.aggregate([
      {
        $match: {
          userId: userObjectId,
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const allTimeTotalSpent = allTimeResult[0]?.totalSpent || 0;
    const allTimeCount = allTimeResult[0]?.count || 0;

    // 2. Month specific aggregate
    let monthTotalSpent = 0;
    let monthEmiTotal = 0;
    let monthEmiCount = 0;

    if (month) {
      const monthExpenses = await Expense.find({ userId: auth.userId, month }).lean();
      monthTotalSpent = monthExpenses.reduce((acc, exp) => acc + exp.amount, 0);

      const emiExpenses = monthExpenses.filter((exp) => exp.isEmi);
      monthEmiTotal = emiExpenses.reduce((acc, exp) => acc + exp.amount, 0);
      monthEmiCount = emiExpenses.length;
    }

    return NextResponse.json({
      allTimeTotalSpent,
      allTimeCount,
      monthTotalSpent,
      monthEmiTotal,
      monthEmiCount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to calculate stats';
    console.error('Error calculating statistics:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
