import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Expense from '@/models/Expense';
import { getAuthUser } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();
    const { amount, description, date, categoryId } = body;

    const existing = await Expense.findOne({ _id: id, userId: auth.userId });
    if (!existing) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (amount !== undefined) updates.amount = Number(amount);
    if (description !== undefined) updates.description = description.trim();
    if (categoryId !== undefined) updates.categoryId = categoryId;
    if (date !== undefined) {
      updates.date = date;
      updates.month = date.substring(0, 7);
    }

    const updated = await Expense.findOneAndUpdate({ _id: id, userId: auth.userId }, updates, {
      new: true,
    });

    return NextResponse.json({
      expense: {
        id: updated!._id.toString(),
        categoryId: updated!.categoryId.toString(),
        amount: updated!.amount,
        date: updated!.date,
        month: updated!.month,
        description: updated!.description,
        isEmi: updated!.isEmi,
        emiDetails: updated!.emiDetails || null,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update expense';
    console.error('Error updating expense:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const deleteSeries = req.nextUrl.searchParams.get('deleteSeries') === 'true';

    const existing = await Expense.findOne({ _id: id, userId: auth.userId });
    if (!existing) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (deleteSeries && existing.isEmi && existing.emiDetails?.groupId) {
      const deleteResult = await Expense.deleteMany({
        userId: auth.userId,
        'emiDetails.groupId': existing.emiDetails.groupId,
      });
      return NextResponse.json({
        success: true,
        message: `Deleted entire EMI series (${deleteResult.deletedCount} installments)`,
      });
    }

    await Expense.findOneAndDelete({ _id: id, userId: auth.userId });
    return NextResponse.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete expense';
    console.error('Error deleting expense:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
