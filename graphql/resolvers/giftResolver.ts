import { ObjectId } from "mongoose";
import Gift from "../../models/gift";
import User from "../../models/user"; // Assuming there's a User model

const resolvers = {
  Query: {
    // Fetch a single gift by ID
    getGift: async (_: any, { id }: { id: ObjectId }) => {
      return await Gift.findById(id).populate("sender").populate("receivers");
    },

    // Fetch all gifts sent by the authenticated user (userId from req)
    getGiftsGiven: async (_: any, __: any, { req }: { req: any }) => {
      const userId = req.userId; // Extract userId from req
      return await Gift.find({ sender: userId }).populate("sender").populate("receivers");
    },

    // Fetch all gifts received by the authenticated user (userId from req)
    getGiftsReceived: async (_: any, __: any, { req }: { req: any }) => {
      const userId = req.userId; // Extract userId from req
      return await Gift.find({ receivers: userId }).populate("sender").populate("receivers");
    },
  },

  Mutation: {
    // Create a new gift (sender is taken from req.userId)
    createGift: async (_: any, { input }: { input: any }, { req }: { req: any }) => {
      const senderId = req.userId; // Take senderId from req.userId
      const { receiverIds, ...rest } = input;

      // Validate the sender exists
      const sender = await User.findById(senderId);
      if (!sender) throw new Error("Sender not found");

      // Validate the receivers exist
      const receivers = await User.find({ _id: { $in: receiverIds } });
      if (receivers.length !== receiverIds.length) throw new Error("Some receivers not found");

      // Create and save the new gift
      const newGift = new Gift({
        sender: senderId,
        receivers: receiverIds,
        ...rest,
      });

      await newGift.save();
      return newGift.populate("sender receivers");
    },

  },

};

export default resolvers;
