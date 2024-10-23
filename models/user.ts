import mongoose, { Schema, Document } from 'mongoose';

// Define LevelNames type
type LevelNames = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Define the UserType interface extending Document for Mongoose
interface IUser extends Document {
  name: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  bio: string;
  image: string;
  diamond: number;

  // Game points and rankings
  gamePoints: {
    currentWeek: number;
    currentMonth: number;
    lastMonth: number;
  };
  gameRankings: {
    weekRank: number;
    monthRank: number;
    totalRank: number; // Overall rank based on total points
  };

  // League points and rankings (only applicable if enrolled in a league)
  league?: {
    id: Schema.Types.ObjectId;
    currentMonthPoints: number;
    lastMonthPoints: number;
    currentMonthRank: number;
    lastMonthRank: number;
  };

  subscribed: {
    is: boolean;
    start_date: Date;
    end_date: Date;
    for: number;
  };

  level: {
    name: LevelNames;
    totalGamePoints: number; // Total game points since the user joined
  };

  medals: Schema.Types.ObjectId[];
  friends: Schema.Types.ObjectId[];
  likesGiven: Schema.Types.ObjectId[];
  likesReceived: Schema.Types.ObjectId[];
  giftsGiven: Schema.Types.ObjectId[];
  giftsReceived: Schema.Types.ObjectId[];
  blocked: Schema.Types.ObjectId[];
  achievements: Schema.Types.ObjectId[];
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      index: true, // Index for faster lookup
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true, // Index for faster lookup
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    diamond: {
      type: Number,
      default: 0,
    },

    // Game points and rankings
    gamePoints: {
      currentWeek: { type: Number, default: 0 },
      currentMonth: { type: Number, default: 0 },
      lastMonth: { type: Number, default: 0 },
    },
    gameRankings: {
      weekRank: { type: Number, default: 0, index: true }, // Index for faster ranking queries
      monthRank: { type: Number, default: 0, index: true }, // Index for faster ranking queries
      totalRank: { type: Number, default: 0, index: true }, // Index for faster ranking queries
    },

    // League points and rankings (if the user is enrolled in a league)
    league: {
      id: { type: Schema.Types.ObjectId, ref: 'League', index: true }, // Index for faster lookup by league ID
      currentMonthPoints: { type: Number, default: 0 },
      lastMonthPoints: { type: Number, default: 0 },
      currentMonthRank: { type: Number, default: 0 },
      lastMonthRank: { type: Number, default: 0 },
    },

    subscribed: {
      is: {
        type: Boolean,
        default: false,
      },
      start_date: {
        type: Date,
        default: null,
      },
      end_date: {
        type: Date,
        default: null,
      },
      for: {
        type: Number,
        default: 0,
      },
    },

    level: {
      name: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        required: true,
      },
      totalGamePoints: { type: Number, default: 0 }, // Overall game points
    },

    medals: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Medal',
      },
    ],
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likesGiven: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likesReceived: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    giftsGiven: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    giftsReceived: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    blocked: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    achievements: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Achievement',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes for quicker retrieval
userSchema.index({ 'league.id': 1 }); // Index for league lookup
userSchema.index({ 'medals': 1 }); // Index for medals lookup
userSchema.index({ 'friends': 1 }); // Index for friends lookup

const User = mongoose.model<IUser>('User', userSchema);
export default User;
