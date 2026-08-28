import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ISettings extends Document {
  theme: 'dark' | 'light';
  defaultMonthlyBudget?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark',
    },
    defaultMonthlyBudget: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
