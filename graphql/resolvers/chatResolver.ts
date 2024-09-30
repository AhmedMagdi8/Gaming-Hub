// src/graphql/resolvers.js
import mongoose from "mongoose";
import Chat from "../../models/chat";
import User from "../../models/user";
import Message from "../../models/message";
import GenericError from "../../utils/error";
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

// Queries
const resolvers = {
  Query: {
    getInbox: async (_: any, __: any, { req }: { req: any }) => {
      const userId = req.userId; // Current user's ID
      if (!req.isAuth) {
        throw new GenericError("Not authenticated!", 401);
      }

      return await Chat.find({ users: { $elemMatch: { $eq: userId } } })
        .populate("users")
        .populate("latestMessage")
        .sort({ updatedAt: -1 });
    },
    getChat: async (_: any, { chatId }: any, { req }: { req: any }) => {
      const userId = req.userId; // Current user's ID
      if (!req.isAuth) {
        throw new GenericError("Not authenticated!", 401);
      }

      return await Chat.findOne({
        _id: chatId,
        users: { $elemMatch: { $eq: userId } },
      })
        .populate("users")
        .populate("latestMessage");
    },
    getFullChat: async (_: any, { chatId }: any, { req }: { req: any }) => {
      const userId = req.userId; // Current user's ID
      if (!req.isAuth) {
        throw new GenericError("Not authenticated!", 401);
      }

      return await Message.find({ chat: chatId }).populate("sender");
    },
    getChats: async (_: any, __: any, { req }: { req: any }) => {
      const userId = req.userId; // Current user's ID
      if (!req.isAuth) {
        throw new GenericError("Not authenticated!", 401);
      }

      return await Chat.find({ users: { $elemMatch: { $eq: userId } } })
        .populate("users")
        .populate("latestMessage")
        .sort({ updatedAt: -1 });
    },
  },

  // Mutations
  Mutation: {
    createNewMessage: async (_: any, { input }: any, { req }: { req: any }) => {
      const userId = req.userId; // Current user's ID
      if (!req.isAuth) {
        throw new GenericError("Not authenticated!", 401);
      }

      const { content, chatId } = input;

      if (!content || !chatId) {
        throw new Error("Invalid data was sent");
      }

      let newMessage = {
        sender: userId,
        content,
        chat: chatId,
      };

      let result: any = await Message.create(newMessage);
      result = await result.populate("sender");
      result = await result.populate("chat");
      result = await User.populate(result, { path: "chat.users" });

      await Chat.findByIdAndUpdate(chatId, { latestMessage: result });

      // Publish the new message event
      pubsub.publish("MESSAGE_RECEIVED", { messageReceived: result });

      return result;
    },


    createChat: async (_: any, { input }: any, { req }: { req: any }) => {
        console.log(req.isAuth, req.userId);
      
        const userId = req.userId; // Current user's ID
        if (!req.isAuth) {
          throw new GenericError("Not authenticated!", 401);
        }
        
        const { users } = input;
      
        if (!users || users.length === 0) {
          throw new GenericError("Users array is empty", 400);
        }
      
        // Convert user IDs to strings explicitly
        const userIds = users.map((user: any) => {
          // Ensure the user IDs are valid and converted to strings
          if (mongoose.Types.ObjectId.isValid(user)) {
            return user.toString();  // Convert ObjectId to string
          } else {
            throw new GenericError("Invalid user ID format", 400);
          }
        });
      
        // Add the current userId after converting to string
        userIds.push(userId.toString());
      
        const chatData = {
          users: userIds,
        };
      
        // Create the chat in MongoDB
        const newChat = new Chat(chatData);
        await newChat.save();
        await newChat.populate('users');
        console.log(newChat);

        return newChat
        
      },
      


    markAsRead: async (_: any, { chatId }: any, { req }: { req: any }) => {
      const userId = req.userId; // Current user's ID
      if (!req.isAuth) {
        throw new GenericError("Not authenticated!", 401);
      }

      await Message.updateMany(
        { chat: chatId },
        { $addToSet: { readBy: userId } }
      );
      return true;
    },

    userTyping: async (
      _: any,
      { room, userId }: any,
      { req }: { req: any }
    ) => {
      if (!req.isAuth) {
        throw new GenericError("Not authenticated!", 401);
      }

      pubsub.publish("TYPING", { typing: { userId, room } });
      return true;
    },

    userStoppedTyping: async (
      _: any,
      { room, userId }: any,
      { req }: { req: any }
    ) => {
      if (!req.isAuth) {
        throw new GenericError("Not authenticated!", 401);
      }
      pubsub.publish("STOP_TYPING", { stopTyping: { userId, room } });
      return true;
    },
  },

  Subscription: {
    messageReceived: {
      subscribe: () => pubsub.asyncIterator("MESSAGE_RECEIVED"),
    },
    typing: {
      subscribe: () => pubsub.asyncIterator("TYPING"),
    },
    stopTyping: {
      subscribe: () => pubsub.asyncIterator("STOP_TYPING"),
    },
  },
};

export default resolvers;
