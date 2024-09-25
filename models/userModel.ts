import mongoose from 'mongoose';
import UserType from '../graphql/types/userTypes';

const userSchema = new mongoose.Schema<UserType>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    medals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medal',
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    diamond: {
      type: Number,
      default: 0,
    },
    subscribed: {
      is: {
        type: Boolean,
      },
      start: {
        type: Date,
      },
      end: {
        type: Date,
      },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    blocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model('User', userSchema);

export default User;
