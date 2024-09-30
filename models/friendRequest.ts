import { Schema, model, Document, Types } from 'mongoose';
import User  from './user';

interface IFriendRequest extends Document {
  from: Types.ObjectId; // User ID of the sender
  to: Types.ObjectId;   // User ID of the receiver
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'; // Status of the friend request
  createdAt: Date;
  updatedAt: Date;
}

const friendRequestSchema = new Schema<IFriendRequest>({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING', // Default status when the request is created
  },
}, { timestamps: true });

const FriendRequest = model<IFriendRequest>('FriendRequest', friendRequestSchema);

export default FriendRequest;
