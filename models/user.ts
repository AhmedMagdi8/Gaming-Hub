import mongoose, { Schema, Document } from 'mongoose';

// Define LevelNames type
type LevelNames = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Define the UserType interface extending Document for Mongoose
interface IUser extends Document {
  name: string;
  email: string;
  username: string;   // Added username field
  password: string;
  phone: string;
  diamond: number;
  friends: Schema.Types.ObjectId[];
  subscribed: {
    is: boolean;
    start_date: Date;  // Renamed to match your previous field
    end_date: Date;    // Renamed to match your previous field
    for: number;
  };
  level: {
    name: LevelNames;
    num: number;
  };
  medals: Schema.Types.ObjectId[];
  achievements: Schema.Types.ObjectId[];
  giftsGiven: Schema.Types.ObjectId[];
  giftsReceived: Schema.Types.ObjectId[];
  likesGiven: Schema.Types.ObjectId[]; // Added likesGiven field
  likesReceived: Schema.Types.ObjectId[]; // Added likesReceived field
  blocked: Schema.Types.ObjectId[];
}

// Define the user schema
const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true, // Ensure username is unique
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email is unique
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    diamond: {
      type: Number,
      default: 0,
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
      num: {
        type: Number,
        required: true,
      },
    },
    medals: [{
      type: Schema.Types.ObjectId,
      ref: 'Medal',
    }],
    friends: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    likesGiven: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    likesReceived: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    giftsGiven: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    giftsReceived: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    blocked: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    achievements: [{
      type: Schema.Types.ObjectId,
      ref: 'Achievement',
    }]
  },
  {
    timestamps: true,
  }
);

// Create the User model
const User = mongoose.model<IUser>('User', userSchema);

// Export the User model
export default User;
  