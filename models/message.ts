import mongoose, { Document, Schema } from "mongoose";

// Define the interface for the Message document
interface IMessage extends Document {
    sender: mongoose.Types.ObjectId;
    content: string;
    chat: mongoose.Types.ObjectId;
    readBy: mongoose.Types.ObjectId[];
}

// Define the message schema
const messageSchema: Schema = new Schema(
    {
        sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, trim: true, required: true },
        chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
        readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    },
    { timestamps: true }
);

// Create the model using the schema and interface
const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
