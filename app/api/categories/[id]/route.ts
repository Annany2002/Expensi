import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Category from '@/models/Category';
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
    const { name, limit, color } = body;

    const updated = await Category.findOneAndUpdate(
      { _id: id, userId: auth.userId },
      {
        ...(name !== undefined && { name: name.trim() }),
        ...(limit !== undefined && { limit: Number(limit) }),
        ...(color !== undefined && { color }),
      },
      { new: true },
    );

    if (!updated) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({
      category: {
        id: updated._id.toString(),
        name: updated.name,
        limit: updated.limit,
        color: updated.color,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update category';
    console.error('Error updating category:', message);
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

    const deleted = await Category.findOneAndDelete({ _id: id, userId: auth.userId });
    if (!deleted) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Cascade delete expenses belonging to this category and user
    await Expense.deleteMany({ categoryId: id, userId: auth.userId });

    return NextResponse.json({
      success: true,
      message: 'Category and associated expenses deleted',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete category';
    console.error('Error deleting category:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
