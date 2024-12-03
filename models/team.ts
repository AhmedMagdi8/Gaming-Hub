import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITeam extends Document {
  league: Types.ObjectId; // Reference to the associated CustomLeague
  players: [Types.ObjectId, Types.ObjectId]; // Two players per team
  teamName: string; // Optional name for the team
  totalPoints: number; // Points accumulated by the team during the league
  matchesPlayed: number; // Total matches the team has played
  matchesWon: number; // Total matches the team has won
}

const teamSchema = new Schema<ITeam>(
  {
    league: { type: Schema.Types.ObjectId, ref: 'CustomLeague', required: true },
    players: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: true,
      validate: [array => array.length === 2, 'A team must have exactly two players.'],
    },
    teamName: { type: String, default: '' }, // Optional field for naming the team
    totalPoints: { type: Number, default: 0 }, // Tracks points earned by the team
    matchesPlayed: { type: Number, default: 0 }, // Tracks total matches played
    matchesWon: { type: Number, default: 0 }, // Tracks total matches won
  },
  {
    timestamps: true, // Automatically tracks creation and update times
  }
);

const Team = mongoose.model<ITeam>('Team', teamSchema);

export default Team;
