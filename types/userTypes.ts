import { Schema } from 'mongoose';

export default interface UserType {
  _id: Schema.Types.ObjectId;
  name: string;
  email: string;
  password: string;
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
  likes: Schema.Types.ObjectId[];
  blocked: Schema.Types.ObjectId[];
}
export type LevelNames = 'beginner' | 'intermediate' | 'advanced' | 'expert';
