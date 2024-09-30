import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/user";
import FriendRequest from "../../models/friendRequest";
import Gift from "../../models/gift";
import Achievement from "../../models/achievement";
import Medal from "../../models/medals";
import GenericError from "../../utils/error";

import mongoose from "mongoose"; // Import Types from mongoose for ObjectId

const userResolvers = {
  Query: {
    // Get a user by ID
    getUser: async (_: any, { id }: { id: string }, { req }: { req: any }) => {
      try {
        if (!req.isAuth) {
          const error = new GenericError("Not authenticated!", 401);
          throw error;
        }

        const user = await User.findById(id).populate(
          "friends likesGiven likesReceived blocked"
        );
        if (!user) {
          throw new Error("User not found");
        }
        return user;
      } catch (error) {
        throw new Error(`Error fetching user: ${error.message}`);
      }
    },
    // Get all users
    getUsers: async (_: any, {}: {}, { req }: { req: any }) => {
      try {
        console.log(req.isAuth);

        if (!req.isAuth) {
          const error = new GenericError("Not authenticated!", 401);
          throw error;
        }

        const users = await User.find().populate(
          "friends likesGiven likesReceived blocked"
        );
        return users;
      } catch (error) {
        throw new Error(`Error fetching users: ${error.message}`);
      }
    },
    // Get friends by level
    getFriendsByLevel: async (_: any, {}: {}, { req }: { req: any }) => {
      try {
        // Check if the user is authenticated
        if (!req.isAuth) {
          throw new GenericError("Not authenticated!", 401);
        }

        const userId = req.userId;

        // Find the user by ID
        const user = await User.findById(userId).populate("friends");

        // Check if user exists
        if (!user) {
          throw new Error("User not found");
        }

        return user.friends; // Return populated achievements
      } catch (error) {
        throw new Error(`Error fetching user achievements: ${error.message}`);
      }
    },

    // Get achievements for a user
    getUserAchievements: async (
      _: any,
      { userId }: { userId: string },
      { req }: { req: any }
    ) => {
      try {
        if (!req.isAuth) {
          const error = new GenericError("Not authenticated!", 401);
          throw error;
        }

        const user = await User.findById(userId).populate("achievements");
        if (!user) {
          throw new Error("User not found");
        }

        // Return an empty array if no achievements are found
        if (!user.achievements || user.achievements.length === 0) {
          return [];
        }

        return user.achievements;
      } catch (error) {
        throw new Error(`Error fetching user achievements: ${error.message}`);
      }
    },
    // Get number of likes for a user
    getNumLikes: async (
      _: any,
      { userId }: { userId: string },
      { req }: { req: any }
    ) => {
      try {
        if (!req.isAuth) {
          const error = new GenericError("Not authenticated!", 401);
          throw error;
        }

        // Find the user and populate the likes field to get the users who liked
        const user = await User.findById(userId).populate("likesReceived"); // Assuming 'likes' is a reference to other users
        if (!user) {
          throw new Error("User not found");
        }

        // Return the number of likes and the user details of those who liked
        return {
          numLikes: user.likesReceived.length, // The number of likes
          likedBy: user.likesReceived, // The users who liked
        };
      } catch (error) {
        throw new GenericError(
          `Error fetching user likes: ${error.message}`,
          400
        );
      }
    },
    getFriendRequests: async (_: any, {}: {}, { req }: { req: any }) => {
      try {
        let user_id = req.userId;

        console.log(user_id);

        if (!req.isAuth) {
          throw new GenericError("Not authenticated!", 401);
        }

        // Check if the userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
          throw new GenericError("Invalid user ID", 400);
        }

        // Fetch friend requests for the user
        const requests = await FriendRequest.find({ to: user_id }).populate(
          "to from"
        );

        if (!requests.length) {
          console.log(`No friend requests found for user with ID: ${user_id}`);
          return [];
        }

        return requests;
      } catch (error) {
        console.error("Error occurred while fetching friend requests:", error); // Log the full error for more information
        throw new GenericError(
          error.message || "Error getting friend requests",
          500
        );
      }
    },
  },

  Mutation: {
    // Sign up
    signUp: async (
      _: any,
      {
        name,
        email,
        username,
        password,
        phone,
      }: {
        name: string;
        email: string;
        username: string;
        password: string;
        phone: string;
      },
      { req }: { req: any }
    ) => {
      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error("Email already in use");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
          name,
          email,
          username,
          password: hashedPassword,
          phone,
          level: {
            // Add level field initialization
            name: "beginner", // Default level
            num: 1, // Default level number
          },
        });

        await user.save();
        return user;
      } catch (error) {
        throw new Error(`Sign up failed: ${error.message}`);
      }
    },

    // Login
    login: async (
      _: any,
      { email, password }: { email: string; password: string },
      { req }: { req: any }
    ) => {
      try {
        const user: any = await User.findOne({ email });
        if (!user) {
          throw new Error("User not found");
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          throw new Error("Incorrect password");
        }

        const token = jwt.sign({ userId: user.id }, process.env.SECRET, {
          expiresIn: "24h",
        });
        console.log(token, user);

        return { token, user };
      } catch (error) {
        throw new Error(`Login failed: ${error.message}`);
      }
    },

    // Send friend request
    sendFriendRequest: async (
      _: any,
      { toUserEmail }: { toUserEmail: string },
      { req }: { req: any }
    ) => {
      try {
        // Check if the user is authenticated
        if (!req.isAuth) {
          const error = new GenericError("Not authenticated!", 401);
          throw error;
        }

        let toUser;

        console.log(toUserEmail);

        // Check if the identifier is an email using a regex pattern
        const isEmail = /\S+@\S+\.\S+/.test(toUserEmail);

        if (isEmail) {
          // Find the recipient by email
          toUser = await User.findOne({ email: toUserEmail });
        } else {
          // Find the recipient by username
          toUser = await User.findOne({ username: toUserEmail });
        }

        if (!toUser) {
          console.log(toUser);

          throw new Error("User not found");
        }

        // Create the friend request
        const friendRequest = new FriendRequest({
          from: req.userId, // Assuming req.userId is the authenticated user's ID
          to: toUser.id,
          status: "PENDING",
        });

        // Save the friend request
        await friendRequest.save();

        // Populate the 'from' and 'to' fields with user data
        const populatedFriendRequest = await FriendRequest.findById(
          friendRequest.id
        )
          .populate("from", "id name email username") // Replace fields with the ones you need
          .populate("to", "id name email username"); // Replace fields with the ones you need

        return populatedFriendRequest;
      } catch (error) {
        throw new Error(`Failed to send friend request: ${error.message}`);
      }
    },

    // Accept friend request
    acceptFriendRequest: async (
      _: any,
      { requestId }: { requestId: string },
      { req }: { req: any }
    ) => {
      try {
        const request = await FriendRequest.findById(requestId);
        if (!request) {
          throw new Error("Friend request not found");
        }

        const fromUser = await User.findById(request.from);
        const toUser = await User.findById(request.to);

        if (!fromUser || !toUser) {
          throw new Error("User involved in the request not found");
        }

        fromUser.friends.push(toUser.id);
        toUser.friends.push(fromUser.id);

        await fromUser.save();
        await toUser.save();

        // Optionally, delete the friend request
        await FriendRequest.findByIdAndDelete(requestId);

        // Populate friends' details before returning the user
        const populatedUser = await User.findById(fromUser.id).populate(
          "friends"
        );

        return populatedUser; // Return the populated user object
      } catch (error) {
        throw new Error(`Failed to accept friend request: ${error.message}`);
      }
    },

    // Decline friend request
    declineFriendRequest: async (
      _: any,
      { requestId }: { requestId: string },
      { req }: { req: any }
    ) => {
      try {
        // Check if the user is authenticated
        if (!req.isAuth) {
          const error = new GenericError("Not authenticated!", 401);
          throw error;
        }

        // Find the friend request by ID
        const request = await FriendRequest.findById(requestId);
        if (!request) {
          throw new Error("Friend request not found");
        }

        // Remove the friend request
        await FriendRequest.findByIdAndDelete(requestId);

        // Get the user who declined the friend request (the 'to' field)
        const user = await User.findById(request.to);
        if (!user) {
          throw new Error("User not found");
        }

        // Optionally, return the populated friends of the user
        const populatedUser = await User.findById(user.id).populate("friends");

        return populatedUser; // Return the user who declined the friend request
      } catch (error) {
        throw new Error(`Failed to decline friend request: ${error.message}`);
      }
    },

      // Delete friend
      deleteFriend: async (
        _: any,
        { userEmail }: { userEmail: string },
        { req }: { req: any }
      ) => {
        try {
          if (!req.isAuth) {
            const error = new GenericError("Not authenticated!", 401);
            throw error;
          }

          // Check if the identifier is an email using a regex pattern
          const isEmail = /\S+@\S+\.\S+/.test(userEmail);

          let friend: any;

          if (isEmail) {
            // Find the recipient by email
            friend = await User.findOne({ email: userEmail });
          } else {
            // Find the recipient by username
            friend = await User.findOne({ username: userEmail });
          }

          const user = await User.findById(req.userId).populate("friends");
          if (!user) {
            throw new Error("User not found");
          }

          user.friends = user.friends.filter(
            (friend_: any) => friend_.email !== friend.email
          );
          await user.save();

          // delete also the user from friend friends

          const deletedFriend = await User.findById(friend._id);
          if (deletedFriend) {
            friend.friends = friend.friends.filter(
              (f: any) => f.toString() !== req.userId
            );
            await deletedFriend.save();
          }

          return user;
        } catch (error) {
          throw new Error(`Failed to delete friend: ${error.message}`);
        }
      },

    // Like a user
    likeUser: async (
      _: any,
      { userEmail }: { userEmail: string },
      { req }: { req: any }
    ) => {
      try {
        const userId = req.userId; // Current user's ID
        if (!req.isAuth) {
          const error = new GenericError("Not authenticated!", 401);
          throw error;
        }
    
        // Find the current user (user who is liking someone)
        const user = await User.findById(userId).populate('likesGiven').populate('likesReceived');
        if (!user) {
          throw new Error("User not found");
        }
    
        // Determine if the input is an email or username using regex
        const isEmail = /\S+@\S+\.\S+/.test(userEmail);
    
        // Find the user to be liked
        const likedUser = isEmail
          ? await User.findOne({ email: userEmail })
          : await User.findOne({ username: userEmail });
    
        if (!likedUser) {
          throw new Error("Target user not found");
        }
    
        const likedUserId: any = likedUser._id.toString(); // The ID of the user to be liked
    
        // Check if the current user already liked the target user
        const alreadyLiked = user.likesGiven.some(
          (likedId) => likedId.toString() === likedUserId
        );
    
        if (!alreadyLiked) {
          // Add the target user's ID to likesGiven of the current user
          user.likesGiven.push(likedUserId);
    
          // Ensure the current user's ID is added to the target user's likesReceived array
          const alreadyReceived = likedUser.likesReceived.some(
            (receivedId) => receivedId.toString() === userId
          );
    
          if (!alreadyReceived) {
            likedUser.likesReceived.push(userId);
          }
    
          // Save both users
          await user.save();
          await likedUser.save();
        }
    
        // Populate the likesGiven and likesReceived fields with full user details
        const populatedUser = await User.findById(userId)
          .populate('likesGiven likesReceived');
    
        return populatedUser; // Return the current user after liking someone
      } catch (error) {
        throw new Error(`Failed to like user: ${error.message}`);
      }
    },
    

    // Unlike a user
    unlikeUser: async (
      _: any,
      { userEmail }: { userEmail: string },
      { req }: { req: any }
    ) => {
      try {
        const userId = req.userId; // Current user's ID
        if (!req.isAuth) {
          const error = new GenericError("Not authenticated!", 401);
          throw error;
        }
    
        // Find the current user (user who is unliking someone)
        const user = await User.findById(userId).populate('likesGiven').populate('likesReceived');
        if (!user) {
          throw new Error("User not found");
        }
    
        // Determine if the input is an email or username
        const isEmail = /\S+@\S+\.\S+/.test(userEmail);
    
        // Find the user to be unliked
        let unlikeUser;
        if (isEmail) {
          unlikeUser = await User.findOne({ email: userEmail });
        } else {
          unlikeUser = await User.findOne({ username: userEmail });
        }
    
        if (!unlikeUser) {
          throw new Error("User to unlike not found");
        }
    
        const unlikeUserId = unlikeUser._id.toString(); // The ID of the user to be unliked
    
        // Remove the target user from likesGiven of the current user
        user.likesGiven = user.likesGiven.filter(
          (likedId: any) => likedId.toString() !== unlikeUserId
        );
    
        // Remove the current user from likesReceived of the target user
        unlikeUser.likesReceived = unlikeUser.likesReceived.filter(
          (receivedId: any) => receivedId.toString() !== userId
        );
    
        // Save both users
        await user.save();
        await unlikeUser.save();
    
        // Populate the likesGiven and likesReceived fields with full user details
        const populatedUser = await User.findById(userId)
          .populate("likesGiven likesReceived ");
    
        return populatedUser; // Return the updated current user after unliking
      } catch (error) {
        throw new Error(`Failed to unlike user: ${error.message}`);
      }
    },
    

    // Block a user

    blockUser: async (
      _: any,
      { userEmail }: { userEmail: string }, // Accept userEmail as the parameter
      { req }: { req: any }
    ) => {
      try {
        const userId = req.userId; // Current user's ID
        if (!req.isAuth) {
          const error = new GenericError("Not authenticated!", 401);
          throw error;
        }
    
        // Find the current user (user who is blocking someone)
        const user = await User.findById(userId).populate('friends');
        if (!user) {
          throw new Error("User not found");
        }
    
        // Determine if the input is an email or username
        const isEmail = /\S+@\S+\.\S+/.test(userEmail);
    
        // Find the target user to block
        let blockUser;
        if (isEmail) {
          blockUser = await User.findOne({ email: userEmail }).populate('friends');
        } else {
          blockUser = await User.findOne({ username: userEmail }).populate('friends');
        }
    
        if (!blockUser) {
          throw new Error("User to block not found");
        }
    
        // Check if the user is already blocked
        if (!user.blocked.some((blockedId) => blockedId.toString() === blockUser._id.toString())) {
          // Add the target user to the current user's blocked list
          user.blocked.push(blockUser._id);
    
          // Remove the target user from likesGiven/likesReceived of the current user
          user.likesGiven = user.likesGiven.filter(
            (likedId: any) => likedId.toString() !== blockUser._id.toString()
          );
          blockUser.likesReceived = blockUser.likesReceived.filter(
            (receivedId: any) => receivedId.toString() !== userId
          );
    
          // Remove each other from the friends list, if applicable
          user.friends = user.friends.filter(
            (friendId: any) => friendId.toString() !== blockUser._id.toString()
          );
          blockUser.friends = blockUser.friends.filter(
            (friendId: any) => friendId.toString() !== userId
          );
    
          // Save both users
          await user.save();
          await blockUser.save();
        }
    
        // Populate the blocked field and return the updated user
        const populatedUser = await User.findById(userId).populate('blocked', 'name email username');
    
        return populatedUser; // Return the updated current user after blocking
      } catch (error) {
        throw new Error(`Failed to block user: ${error.message}`);
      }
    },
    
  },
};

export default userResolvers;
