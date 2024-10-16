import mongoose, { Schema, Document } from 'mongoose';

// Define LeagueType
type LeagueType = 'platinum' | 'gold' | 'silver' | 'bronze';

interface ILeague extends Document {
  name: LeagueType;
  description: string;
}

const leagueSchema = new mongoose.Schema<ILeague>({
  name: { type: String, enum: ['platinum', 'gold', 'silver', 'bronze'], required: true, unique: true },
  description: { type: String, required: true },
}, { timestamps: true });

const League = mongoose.model<ILeague>('League', leagueSchema);
export default League;
