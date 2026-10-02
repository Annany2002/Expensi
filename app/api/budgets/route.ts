import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Budget from '@/models/Budget';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const month = req.nextUrl.searchParams.get('month'); // e.g. "2026-08"

    const userDoc = await User.findById(auth.userId).select('defaultSalary').lean();
    const defaultSalary = userDoc?.defaultSalary ?? null;

    if (!month) {
      const allBudgets = await Budget.find({ userId: auth.userId }).lean();
      return NextResponse.json({
        defaultSalary,
        budgets: allBudgets.map((b) => ({
          month: b.month,
          amount: b.amount,
          salary: b.salary ?? null,
        })),
      });
    }

    const budgetDoc = await Budget.findOne({ userId: auth.userId, month }).lean();
    const specificSalary = budgetDoc?.salary ?? null;
    const effectiveSalary = specificSalary !== null ? specificSalary : defaultSalary;

    return NextResponse.json({
      month,
      amount: budgetDoc ? budgetDoc.amount : null,
      salary: specificSalary,
      defaultSalary,
      effectiveSalary,
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
    const { month, amount, salary, defaultSalary } = body;

    if (!month) {
      return NextResponse.json({ error: 'Month (YYYY-MM) is required' }, { status: 400 });
    }

    // Handle defaultSalary updates if provided
    let updatedDefaultSalary: number | null = null;
    if (defaultSalary !== undefined) {
      const parsedDef =
        defaultSalary === null || defaultSalary === '' ? null : Math.max(0, Number(defaultSalary));
      const updatedUser = await User.findByIdAndUpdate(
        auth.userId,
        { defaultSalary: parsedDef },
        { new: true },
      ).lean();
      updatedDefaultSalary = updatedUser?.defaultSalary ?? null;
    } else {
      const userDoc = await User.findById(auth.userId).select('defaultSalary').lean();
      updatedDefaultSalary = userDoc?.defaultSalary ?? null;
    }

    const updateFields: Record<string, unknown> = { userId: auth.userId, month };

    if (amount !== undefined) {
      updateFields.amount = amount === null || amount === '' ? null : Math.max(0, Number(amount));
    }

    if (salary !== undefined) {
      updateFields.salary = salary === null || salary === '' ? null : Math.max(0, Number(salary));
    }

    const updated = await Budget.findOneAndUpdate({ userId: auth.userId, month }, updateFields, {
      upsert: true,
      new: true,
    });

    const specificSalary = updated.salary ?? null;
    const effectiveSalary = specificSalary !== null ? specificSalary : updatedDefaultSalary;

    return NextResponse.json({
      month: updated.month,
      amount: updated.amount,
      salary: specificSalary,
      defaultSalary: updatedDefaultSalary,
      effectiveSalary,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update budget';
    console.error('Error updating budget:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
