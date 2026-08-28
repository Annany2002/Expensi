import mongoose, { Schema, Model, Document, Types } from 'mongoose';

export interface IEmiDetails {
  groupId: string;
  installmentIndex: number;
  totalTenure: number;
  totalAmount: number;
  monthlyAmount: number;
}

export interface IExpense extends Document {
  userId: Types.ObjectId;
  categoryId: Types.ObjectId;
  amount: number;
  date: string; // "YYYY-MM-DD"
  month: string; // "YYYY-MM"
  description: string;
  isEmi: boolean;
  emiDetails?: IEmiDetails;
  createdAt: Date;
  updatedAt: Date;
}

const EmiDetailsSchema = new Schema<IEmiDetails>(
  {
    groupId: { type: String, required: true },
    installmentIndex: { type: Number, required: true },
    totalTenure: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    monthlyAmount: { type: Number, required: true },
  },
  { _id: false },
);

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    date: {
      type: String,
      required: [true, 'Date (YYYY-MM-DD) is required'],
      index: true,
    },
    month: {
      type: String,
      required: true,
      index: true, // "YYYY-MM"
    },
    description: {
      type: String,
      default: 'Expense',
      trim: true,
    },
    isEmi: {
      type: Boolean,
      default: false,
      index: true,
    },
    emiDetails: {
      type: EmiDetailsSchema,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-validate hook to populate month from date if missing
ExpenseSchema.pre('validate', function (this: IExpense) {
  if (this.date && !this.month) {
    this.month = this.date.substring(0, 7);
  }
});

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
