import { ApolloError } from 'apollo-server-express';
import Achievement from '../../models/achievement';
import  User  from '../../models/user';
import GenericError  from '../../utils/error';

const resolvers = {
  Query: {
    getAchievements: async (_: any, __: any, { req }: { req: any }) => {
      if (!req.isAuth) {
        throw new GenericError("Not authenticated!", 401);
      }
      try {
        return await Achievement.find().populate('userId');
      } catch (error) {
        throw new GenericError(`Failed to fetch achievements: ${error.message}`, 400  );
      }
    },
    getAchievement: async (_: any, { id }: { id: string }, { req }: { req: any }) => {
      if (!req.isAuth) {
        throw new GenericError("Not authenticated!", 401);
      }
      try {
        const achievement = await Achievement.findById(id);
        if (!achievement) {
          throw new GenericError("Achievement not found", 404);
        }
        return achievement;
      } catch (error) {
        throw new GenericError(`Failed to fetch achievement: ${error.message}`, 500);
      }
    },
  },

  Mutation: {
    createAchievement: async (
      _: any,
      { input }: { input: { name: string; description: string } },
      { req }: { req: any }
    ) => {
      if (!req.isAuth) {
        throw new GenericError("Not authenticated!", 401);
      }

      try {
        const user = await User.findById(req.userId);
        if (!user) {
          throw new GenericError("User not found", 404);
        }

        const existingAchievement = await Achievement.findOne({ name: input.name });
        if (existingAchievement) {
          throw new GenericError("Achievement with this name already exists", 400);
        }

        const newAchievement = new Achievement({
          name: input.name,
          description: input.description,
          userId: req.userId,
        });

        await newAchievement.save();
        return newAchievement;
      } catch (error) {
        throw new GenericError(`Failed to create achievement: ${error.message}`, 500);
      }
    },

    deleteAchievement: async (_: any, { id }: { id: string }, { req }: { req: any }) => {
      if (!req.isAuth) {
        throw new GenericError("Not authenticated!", 401);
      }

      try {
        const achievement = await Achievement.findById(id);
        if (!achievement) {
          throw new GenericError("Achievement not found", 404);
        }

        if (achievement.userId.toString() !== req.userId) {
          throw new GenericError("You are not authorized to delete this achievement", 403);
        }

        await Achievement.findByIdAndDelete(id);
        return achievement;
      } catch (error) {
        throw new GenericError(`Failed to delete achievement: ${error.message}`, 500);
      }
    },

    updateAchievement: async (
      _: any,
      { id, input }: { id: string; input: { name?: string; description?: string } },
      { req }: { req: any }
    ) => {
      if (!req.isAuth) {
        throw new GenericError("Not authenticated!", 401);
      }

      try {
        // Find the achievement
        const achievement = await Achievement.findById(id);
        if (!achievement) {
          throw new GenericError("Achievement not found", 404);
        }

        // Check if the user is the owner of the achievement
        if (achievement.userId.toString() !== req.userId) {
          throw new GenericError("You are not authorized to update this achievement", 403);
        }

        // Update fields
        if (input.name) {
          achievement.name = input.name;
        }
        if (input.description) {
          achievement.description = input.description;
        }

        // Save updated achievement
        await achievement.save();
        return achievement;
      } catch (error) {
        throw new GenericError(`Failed to update achievement: ${error.message}`, 500);
      }
    },
  },
};

export default resolvers;
