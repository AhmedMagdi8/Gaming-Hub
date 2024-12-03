import mongoose, { Schema, Document } from 'mongoose';

export interface ICupType extends Document {
  name: string; // Cup type names
  description?: string; // Optional description of the cup type
  diamondValue: number; // Value of the cup in diamonds
  image: string; // URL or path to the cup's image
}

const cupTypeSchema = new Schema<ICupType>(
  {
    name: {
      type: String,
      required: true,
    },
    description: { type: String, default: '' }, // Optional description
    diamondValue: { type: Number, required: true }, // Value of the cup in diamonds
    image: { type: String, required: true }, // Image URL/path is mandatory
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

const CupType = mongoose.model<ICupType>('CupType', cupTypeSchema);

export default CupType;
