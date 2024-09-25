import mongoose, { ObjectId } from "mongoose";
export type GiftType = {
  sender: ObjectId;
  receivers: ObjectId[];
  count: number;
  value: number;
  type: "diamond" | "sub";
  message: string;
  isFull: boolean;
};
const GiftSchema = new mongoose.Schema<GiftType>(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receivers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    count: { type: Number, required: true },
    message: { type: String },
    value: { type: Number, required: true },
    type: { type: String, default: "diamond" },
    isFull: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
const Gift = mongoose.model("Gift", GiftSchema);

export default Gift;
