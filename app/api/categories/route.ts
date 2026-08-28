import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Category from '@/models/Category';
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

    const query: Record<string, unknown> = { userId: auth.userId };
    if (month) {
      query.month = month;
    }

    const categories = await Category.find(query).sort({ createdAt: 1 }).lean();

    let expensesByCat: Record<string, number> = {};
    if (month) {
      const expenses = await Expense.find({ userId: auth.userId, month }).lean();
      expensesByCat = expenses.reduce(
        (acc, exp) => {
          const catId = exp.categoryId.toString();
          acc[catId] = (acc[catId] || 0) + exp.amount;
          return acc;
        },
        {} as Record<string, number>,
      );
    }

    const formattedCategories = categories.map((cat) => ({
      id: cat._id.toString(),
      name: cat.name,
      month: cat.month,
      limit: cat.limit || 0,
      color: cat.color || '#ffffff',
      spent: expensesByCat[cat._id.toString()] || 0,
    }));

    return NextResponse.json({ categories: formattedCategories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch categories';
    console.error('Error fetching categories:', message);
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
    const { name, limit, color, month } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Valid category name is required' }, { status: 400 });
    }

    const categoryMonth = month || new Date().toISOString().substring(0, 7);

    const newCategory = await Category.create({
      userId: auth.userId,
      name: name.trim(),
      month: categoryMonth,
      limit: typeof limit === 'number' ? limit : Number(limit) || 0,
      color: color || '#ffffff',
    });

    return NextResponse.json(
      {
        category: {
          id: newCategory._id.toString(),
          name: newCategory.name,
          month: newCategory.month,
          limit: newCategory.limit,
          color: newCategory.color,
          spent: 0,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create category';
    console.error('Error creating category:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
