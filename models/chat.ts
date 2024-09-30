import mongoose from 'mongoose';
import { Schema } from 'mongoose';


type ChatType = {
  _id: Schema.Types.ObjectId;
  firstUser: Schema.Types.ObjectId;
  secondUser: Schema.Types.ObjectId;
  messages: {
    sender: Schema.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
}

const userSchema = new mongoose.Schema<ChatType>(
  {
    firstUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    secondUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model('User', userSchema);

export default User;
