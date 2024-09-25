import { Schema } from 'mongoose';

export interface ChatType {
  _id: Schema.Types.ObjectId;
  firstUser: Schema.Types.ObjectId;
  secondUser: Schema.Types.ObjectId;
  messages: {
    sender: Schema.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
}
