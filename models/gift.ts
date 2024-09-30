import mongoose, { ObjectId } from "mongoose";

export type GiftType = {
  sender: ObjectId;
  receivers: ObjectId[];
  count: number; // Represents the quantity of the gift sent
  value: number; // Value of the gift (monetary or virtual currency)
  currency: string; // New field, representing currency type (e.g., USD, diamonds)
  type: "diamond" | "sub" | "item" | "voucher" | "subscription"; // Expanded types
  message?: string;
  status: "pending" | "completed" | "failed"; // Replacing isFull with a more descriptive field
  expirationDate?: Date; // Optional field, relevant for certain gift types
  giftCategory: "virtual" | "physical" | "subscription"; // New field for categorizing gifts
  isAnonymous: boolean; // Option for sending anonymous gifts
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
        required: true, // Assuming every gift must have at least one receiver
      },
    ],
    count: { type: Number, required: true },
    value: { type: Number, required: true },
    currency: { type: String, default: "USD" }, // Assuming a default currency
    type: {
      type: String,
      enum: ["diamond", "sub", "item", "voucher", "subscription"],
      default: "diamond",
    },
    message: { type: String },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    expirationDate: { type: Date },
    giftCategory: {
      type: String,
      enum: ["virtual", "physical", "subscription"],
      required: true,
      default: "virtual",
    },
    isAnonymous: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Gift = mongoose.model("Gift", GiftSchema);

export default Gift;
