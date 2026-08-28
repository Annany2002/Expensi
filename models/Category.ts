import mongoose, { Schema, Model, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  userId: Types.ObjectId;
  name: string;
  month: string; // "YYYY-MM"
  limit?: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    month: {
      type: String,
      required: [true, 'Month (YYYY-MM) is required'],
      index: true,
    },
    limit: {
      type: Number,
      default: 0,
      min: 0,
    },
    color: {
      type: String,
      default: '#ffffff',
    },
  },
  {
    timestamps: true,
  },
);

CategorySchema.index({ userId: 1, month: 1 });
CategorySchema.index({ userId: 1, month: 1, name: 1 });

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
