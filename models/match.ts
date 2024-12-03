import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMatch extends Document {
  league: Types.ObjectId; // Reference to the associated CustomLeague
  round: number; // Match round (default: 1, final: 3)
  stage: string; // Match stage (e.g., '32 Teams', '16 Teams', '8 Teams', '4 Teams', 'Final')
  participants: [
    { team: Types.ObjectId }, // Team 1: Reference to Team model
    { team: Types.ObjectId } // Team 2: Reference to Team model
  ];
  winnerTeam?: { team: Types.ObjectId }; // Winning team (optional until match ends)
  loserTeam?: { team: Types.ObjectId }; // Losing team (optional until match ends)
  isFinal: boolean; // Indicates if the match is a final
  roundWinners: { round: number; winnerTeam: Types.ObjectId }[]; // Array of round winners
}


const matchSchema = new Schema<IMatch>(
  {
    league: { type: Schema.Types.ObjectId, ref: 'CustomLeague', required: true },
    round: {
      type: Number,
      required: true,
      default: 1,
      validate: {
        validator: function () {
          return !this.isFinal || this.round === 3; // Finals must have exactly 3 rounds
        },
        message: 'Final matches must consist of exactly 3 rounds.',
      },
    },
    stage: { type: String, required: true }, // E.g., '32 Teams', '16 Teams', '8 Teams', '4 Teams', 'Final'
    participants: [
      {
        team: {
          type: Schema.Types.ObjectId,
          ref: 'Team',
          required: true,
        },
      },
      {
        team: {
          type: Schema.Types.ObjectId,
          ref: 'Team',
          required: true,
        },
      },
    ],
    winnerTeam: {
      team: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
      },
    },
    loserTeam: {
      team: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
      },
    },
    isFinal: { type: Boolean, default: false },
    roundWinners: [
      {
        round: { type: Number, required: true },
        winnerTeam: {
          type: Schema.Types.ObjectId,
          ref: 'Team',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Match = mongoose.model<IMatch>('Match', matchSchema);

export default Match;
