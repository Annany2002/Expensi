import { NextRequest, NextResponse } from 'next/server';
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
    const searchParams = req.nextUrl.searchParams;
    const month = searchParams.get('month'); // e.g. "2026-08"
    const categoryId = searchParams.get('categoryId');

    const query: Record<string, unknown> = { userId: auth.userId };
    if (month) query.month = month;
    if (categoryId) query.categoryId = categoryId;

    const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 }).lean();

    const formattedExpenses = expenses.map((exp) => ({
      id: exp._id.toString(),
      categoryId: exp.categoryId.toString(),
      amount: exp.amount,
      date: exp.date,
      month: exp.month,
      description: exp.description,
      paymentMethod: exp.paymentMethod || 'UPI',
      isEmi: exp.isEmi || false,
      emiDetails: exp.emiDetails || null,
    }));

    return NextResponse.json({ expenses: formattedExpenses });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch expenses';
    console.error('Error fetching expenses:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { categoryId, amount, date, description, paymentMethod } = body;

    if (!categoryId || amount === undefined || !date) {
      return NextResponse.json(
        { error: 'Category, amount, and date are required' },
        { status: 400 },
      );
    }

    const month = date.substring(0, 7); // e.g. "2026-08"

    const newExpense = await Expense.create({
      userId: auth.userId,
      categoryId,
      amount: Number(amount),
      date,
      month,
      description: description || 'Expense',
      paymentMethod: paymentMethod || 'UPI',
      isEmi: false,
    });

    return NextResponse.json(
      {
        expense: {
          id: newExpense._id.toString(),
          categoryId: newExpense.categoryId.toString(),
          amount: newExpense.amount,
          date: newExpense.date,
          month: newExpense.month,
          description: newExpense.description,
          paymentMethod: newExpense.paymentMethod || 'UPI',
          isEmi: false,
          emiDetails: null,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create expense';
    console.error('Error creating expense:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
