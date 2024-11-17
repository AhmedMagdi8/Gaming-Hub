import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMatch extends Document {
  round: number; // Match round
  stage: string; // Match stage (e.g., '16', '8', '4', 'final')
  participants: [
    { team: [Types.ObjectId, Types.ObjectId] }, // Team 1: two player IDs
    { team: [Types.ObjectId, Types.ObjectId] } // Team 2: two player IDs
  ];
  winnerTeam?: { team: [Types.ObjectId, Types.ObjectId] }; // Winning team (optional until match ends)
  loserTeam?: { team: [Types.ObjectId, Types.ObjectId] }; // Losing team (optional until match ends)
}

const matchSchema = new Schema<IMatch>(
  {
    round: { type: Number, required: true },
    stage: { type: String, required: true }, // E.g., '16', '8', '4', 'final'
    participants: [
      {
        team: {
          type: [Schema.Types.ObjectId],
          ref: 'User',
          required: true,
          validate: [array => array.length === 2, 'A team must have exactly two players.'],
        },
      },
      {
        team: {
          type: [Schema.Types.ObjectId],
          ref: 'User',
          required: true,
          validate: [array => array.length === 2, 'A team must have exactly two players.'],
        },
      },
    ],
    winnerTeam: {
      team: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        validate: [array => array.length === 2, 'A team must have exactly two players.'],
      },
    },
    loserTeam: {
      team: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        validate: [array => array.length === 2, 'A team must have exactly two players.'],
      },
    },
  },
  {
    timestamps: true,
  }
);

const Match = mongoose.model<IMatch>('Match', matchSchema);

export default Match;
