import mongoose, { Document, Schema, Types } from "mongoose";

// Define the interface for the Chat document
interface IChat extends Document {
    chatName?: string;
    isGroupChat: boolean;
    users: Types.ObjectId[];
    latestMessage?: mongoose.Types.ObjectId;
}

// Define the chat schema
const chatSchema: Schema = new Schema(
    {
        chatName: { type: String, trim: true },
        isGroupChat: { type: Boolean, default: true },
        users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        latestMessage: { type: Schema.Types.ObjectId, ref: 'Message' }
    },
    { timestamps: true }
);

// Create the model using the schema and interface
const Chat = mongoose.model<IChat>("Chat", chatSchema);

export default Chat;
