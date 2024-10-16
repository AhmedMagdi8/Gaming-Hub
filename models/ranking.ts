import mongoose, { Schema, Document, Types } from 'mongoose';

// Define PeriodType
type PeriodType = 'week' | 'month' | 'year';

interface IRanking extends Document {
  user: Types.ObjectId;  // Reference to User
  league: Types.ObjectId;  // Reference to League
  points: number;  // Points earned during the period
  period: PeriodType;  // Time period: week, month, or year
  periodStart: Date;  // Start date of the ranking period
  periodEnd: Date;  // End date of the ranking period
  position: number;  // Ranking position during the period
}

const rankingSchema = new mongoose.Schema<IRanking>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  league: { type: Schema.Types.ObjectId, ref: 'League', required: true },
  points: { type: Number, required: true },
  period: { type: String, enum: ['week', 'month', 'year'], required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  position: { type: Number, required: true },  // User's rank position
}, { timestamps: true });

// Indexes for fast querying
rankingSchema.index({ league: 1, period: 1, periodStart: 1 });
rankingSchema.index({ user: 1, period: 1, periodStart: 1 });

const Ranking = mongoose.model<IRanking>('Ranking', rankingSchema);
export default Ranking;
