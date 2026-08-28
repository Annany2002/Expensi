import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Expense from '@/models/Expense';
import { getAuthUser } from '@/lib/auth';
import crypto from 'crypto';

function addMonthsToDate(
  baseDateStr: string,
  monthsToAdd: number,
): { dateStr: string; monthStr: string } {
  const [yearStr, monthStr, dayStr] = baseDateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed
  const day = parseInt(dayStr, 10);

  const targetDate = new Date(year, month + monthsToAdd, 1);
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth(); // 0-indexed

  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const targetDay = Math.min(day, daysInTargetMonth);

  const formattedMonth = String(targetMonth + 1).padStart(2, '0');
  const formattedDay = String(targetDay).padStart(2, '0');

  const finalDateStr = `${targetYear}-${formattedMonth}-${formattedDay}`;
  const finalMonthStr = `${targetYear}-${formattedMonth}`;

  return { dateStr: finalDateStr, monthStr: finalMonthStr };
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { categoryId, description, startDate, totalAmount, tenure, existingExpenseId } = body;

    const parsedTenure = parseInt(tenure, 10);
    const parsedTotalAmount = parseFloat(totalAmount);

    if (
      !categoryId ||
      !startDate ||
      isNaN(parsedTotalAmount) ||
      isNaN(parsedTenure) ||
      parsedTenure <= 0
    ) {
      return NextResponse.json(
        {
          error:
            'Valid category, start date, total amount, and positive tenure in months are required',
        },
        { status: 400 },
      );
    }

    const monthlyBaseAmount = Math.floor(parsedTotalAmount / parsedTenure);
    const remainder = parsedTotalAmount - monthlyBaseAmount * parsedTenure;

    const groupId = crypto.randomUUID();
    const baseDesc = (description || 'Expense').replace(/\s*\(EMI\s*\d+\/\d+\)$/i, '').trim();

    const emiExpensesToInsert = [];

    for (let i = 1; i <= parsedTenure; i++) {
      const { dateStr, monthStr } = addMonthsToDate(startDate, i - 1);
      const installmentAmount =
        i === parsedTenure ? monthlyBaseAmount + remainder : monthlyBaseAmount;

      emiExpensesToInsert.push({
        userId: auth.userId,
        categoryId,
        amount: installmentAmount,
        date: dateStr,
        month: monthStr,
        description: `${baseDesc} (EMI ${i}/${parsedTenure})`,
        isEmi: true,
        emiDetails: {
          groupId,
          installmentIndex: i,
          totalTenure: parsedTenure,
          totalAmount: parsedTotalAmount,
          monthlyAmount: installmentAmount,
        },
      });
    }

    if (existingExpenseId) {
      await Expense.findOneAndDelete({ _id: existingExpenseId, userId: auth.userId });
    }

    const createdExpenses = await Expense.insertMany(emiExpensesToInsert);

    const formatted = createdExpenses.map((exp) => ({
      id: exp._id.toString(),
      categoryId: exp.categoryId.toString(),
      amount: exp.amount,
      date: exp.date,
      month: exp.month,
      description: exp.description,
      isEmi: true,
      emiDetails: exp.emiDetails,
    }));

    return NextResponse.json(
      {
        message: `Successfully created ${parsedTenure} EMI installments`,
        groupId,
        expenses: formatted,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create EMI schedule';
    console.error('Error creating EMI schedule:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
