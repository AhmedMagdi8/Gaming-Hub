import mongoose, { Schema, Document, Types } from 'mongoose';
import { IMatch } from './match';

type LeagueStatus = 'active' | 'ended' | 'coming';
type PlaySpeed = 'slow' | 'normal' | 'fast';
type LevelName = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type PlayType = 'free' | 'limited';

interface ICustomLeague extends Document {
  name: string;
  description: string;
  isPrivate: boolean;
  password?: string;
  createdByAdmin: boolean;
  status: LeagueStatus;
  pointsForTopThree: [number, number, number]; // Points for 1st, 2nd, and 3rd place
  pointsForWin: number; // Points awarded to match winners
  maxSeats: number; // Maximum number of participants
  registeredPlayers: Types.ObjectId[]; // User IDs of registered players
  ranking: number[]; // Ranking of players based on points
  spectators: Types.ObjectId[]; // User IDs of spectators
  chat: Types.ObjectId; // Chat ID for group chat
  matches: Types.ObjectId[] | IMatch[]; // Reference to Match documents
  playSpeed: PlaySpeed;
  playType: PlayType; // Play type: free or limited
  levelName: LevelName;
  roomBackground: string;
  members: Types.ObjectId[]; // User IDs of league members
}

const customLeagueSchema = new Schema<ICustomLeague>(
  {
    name: { type: String, required: true },
    description: { type: String },
    isPrivate: { type: Boolean, default: false },
    password: { type: String, required: function () { return this.isPrivate; } },
    createdByAdmin: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['active', 'ended', 'coming'],
      default: 'coming',
    },
    pointsForWin: { type: Number, required: true },
    maxSeats: { type: Number, required: true },
    registeredPlayers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    ranking: { type: [Number], default: [] },
    spectators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    matches: [{ type: Schema.Types.ObjectId, ref: 'Match' }], // Reference to Match model
    playSpeed: {
      type: String,
      enum: ['slow', 'normal', 'fast'],
      default: 'normal',
    },
    playType: {
      type: String,
      enum: ['free', 'limited'],
      required: true,
    },
    levelName: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true,
    },
    roomBackground: { type: String },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

const CustomLeague = mongoose.model<ICustomLeague>('CustomLeague', customLeagueSchema);

export default CustomLeague;
