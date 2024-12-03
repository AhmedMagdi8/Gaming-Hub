import mongoose, { Schema, Document, Types } from 'mongoose';
import { IMatch } from './match';

type LeagueStatus = 'active' | 'ended' | 'coming';
type PlaySpeed = 'slow' | 'normal' | 'fast';
type LevelName = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type PlayType = 'free' | 'limited';
type CupType = '250k' | '500k' | '1M';

interface ICustomLeague extends Document {
  name: string;
  description: string;
  isPrivate: boolean;
  password?: string;
  createdByAdmin: boolean;
  status: LeagueStatus;
  pointsForWin: number;
  maxSeats: 8 | 16 | 32; // Only allows 8, 16, or 32 teams
  registeredPlayers: Types.ObjectId[];
  ranking: number[];
  spectators: Types.ObjectId[];
  chat: Types.ObjectId;
  matches: Types.ObjectId[] | IMatch[];
  playSpeed: PlaySpeed;
  playType: PlayType;
  levelName: LevelName;
  roomBackground: string;
  startTime?: Date; // League starts 15 minutes after reaching max seats
  prizes: {
    winnerPrize: string; // Mandatory prize for the winner
    loserPrize?: string; // Optional prize for the loser
  };
  bio?: string; // Optional bio for the league
  cupType?: Types.ObjectId; // Reference to the CupType model
  topThreeCups: Types.ObjectId[]; // Reference to the Cup model for the top three cups
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
    topThreeCups: [{
      type: Schema.Types.ObjectId,
      ref: 'Cup',  // Reference to the Cup model for the top three cups
    }],
    pointsForWin: { type: Number, required: true },
    maxSeats: {
      type: Number,
      enum: [8, 16, 32], // Restricts to 8, 16, or 32
      required: true,
    },
    registeredPlayers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    ranking: { type: [Number], default: [] },
    spectators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    matches: [{ type: Schema.Types.ObjectId, ref: 'Match' }],
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
    startTime: { type: Date, default: null }, // Start time calculated after max seats are filled
    prizes: {
      winnerPrize: { type: String, required: true },
      loserPrize: { type: String, default: null },
    },
    bio: { type: String, default: null },
    cupType: { type: Schema.Types.ObjectId, ref: 'CupType', default: null }, // Reference to CupType
  },
  {
    timestamps: true,
  }
);

customLeagueSchema.pre('save', function (next) {
  if (
    this.maxSeats &&
    this.registeredPlayers.length === this.maxSeats &&
    !this.startTime
  ) {
    this.startTime = new Date(Date.now() + 15 * 60 * 1000); // Sets start time 15 minutes later
  }
  next();
});

const CustomLeague = mongoose.model<ICustomLeague>('CustomLeague', customLeagueSchema);

export default CustomLeague;
