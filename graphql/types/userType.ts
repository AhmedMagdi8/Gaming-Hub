import { Schema } from 'mongoose';

export default interface UserType {
  isAdmin: boolean;
  _id: Schema.Types.ObjectId;
  name: string;
  email: string;
  bio: string;
  image: string;
  username: string;
  phone: string;
  diamond: number;
  friends: Schema.Types.ObjectId[];
  subscribed: {
    is: boolean;
    start_date: Date;
    end_date: Date;
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
  likesGiven: Schema.Types.ObjectId[];
  likesReceived: Schema.Types.ObjectId[];
  blocked: Schema.Types.ObjectId[];
  friendRequests: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export type LevelNames = 'beginner' | 'intermediate' | 'advanced' | 'expert';
