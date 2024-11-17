import mongoose from "mongoose";
import { ApolloError } from "apollo-server-express";
import CustomLeague from "../../models/customLeague";
import User from "../../models/user";
import Chat from "../../models/chat";
import Match from "../../models/match";
import GenericError from "../../utils/error";
import { shuffle } from "lodash";
import { PubSub } from "graphql-subscriptions";
import Message from "../../models/message";

const pubsub = new PubSub();

const MESSAGE_ADDED = "MESSAGE_ADDED";

const resolvers = {
  Mutation: {
    // Create a new league
    createCustomLeague: async (
        _: any,
        {
          input,
        }: {
          input: {
            name: string;
            description?: string;
            isPrivate: boolean;
            password?: string;
            maxSeats: number;
            createdByAdmin?: boolean;
            pointsForWin?:number;
          };
        },
        { req }: { req: any }
      ) => {
        if (!req.isAuth) {
          throw new GenericError("Not authenticated!", 401);
        }
  
        try {
          if (input.isPrivate && !input.password) {
            throw new GenericError("Private leagues require a password", 400);
          }
  
          const league = new CustomLeague({
            ...input,
            createdByAdmin: req.isAdmin || false,
            status: "coming",
            registeredPlayers: [],
            spectators: [],
          });
  
          await league.save();
          return league;
        } catch (error) {
          throw new GenericError(
            `Failed to create league: ${error.message}`,
            500
          );
        }
      },
  

   // Add a spectator to a league
   addSpectatorToLeague: async (
    _: any,
    { leagueId, userId }: { leagueId: string; userId: string },
    { req }: { req: any }
  ) => {
    if (!req.isAuth) {
      throw new GenericError("Not authenticated!", 401);
    }

    try {
      const league = await CustomLeague.findById(leagueId);
      if (!league) {
        throw new GenericError("League not found", 404);
      }

      const userObjectId = new mongoose.Types.ObjectId(userId);
      if (league.spectators.includes(userObjectId)) {
        throw new GenericError(
          "User is already a spectator of this league",
          400
        );
      }

      league.spectators.push(userObjectId);
      await league.save();
      return league;
    } catch (error) {
      throw new GenericError(
        `Failed to add spectator: ${error.message}`,
        500
      );
    }
  },


  // Automatically generate matches
  generateMatches: async (
    _: any,
    { leagueId }: { leagueId: string },
    { req }: { req: any }
  ) => {
    if (!req.isAuth) {
      throw new GenericError("Not authenticated!", 401);
    }

    try {
      const league = await CustomLeague.findById(leagueId);
      if (!league) {
        throw new GenericError("League not found", 404);
      }

      if (league.registeredPlayers.length !== league.maxSeats) {
        throw new GenericError("League is not full yet", 400);
      }

      const shuffledPlayers = shuffle(league.registeredPlayers);
      const teams = [];
      for (let i = 0; i < shuffledPlayers.length; i += 2) {
        teams.push([shuffledPlayers[i], shuffledPlayers[i + 1]]);
      }

      const stage = `Round of ${league.maxSeats}`;
      let round = Math.log2(league.maxSeats);

      const matches = [];
      for (let i = 0; i < teams.length; i += 2) {
        const match = new Match({
          round,
          stage,
          participants: [
            { team: teams[i] },
            { team: teams[i + 1] },
          ],
        });

        await match.save();
        matches.push(match._id);
      }

      league.matches = matches;
      league.status = "active";
      await league.save();

      return league;
    } catch (error) {
      throw new GenericError(
        `Failed to generate matches: ${error.message}`,
        500
      );
    }
  },

 // Report match result
 reportMatchResult: async (
    _: any,
    {
      matchId,
      winningTeam,
    }: { matchId: string; winningTeam: [string, string] },
    { req }: { req: any }
  ) => {
    if (!req.isAuth) {
        throw new GenericError("Not authenticated!", 401);
      }
    
      try {
        // Convert the winning team strings to ObjectId and ensure it is a tuple
        if (winningTeam.length !== 2) {
          throw new GenericError("A team must consist of exactly two players", 400);
        }
    
        const winningTeamIds: [mongoose.Types.ObjectId, mongoose.Types.ObjectId] = [
          new mongoose.Types.ObjectId(winningTeam[0]),
          new mongoose.Types.ObjectId(winningTeam[1]),
        ];
    
        // Find the match and check if it exists
        const match = await Match.findById(matchId);
        if (!match) {
          throw new GenericError("Match not found", 404);
        }
    
        // Update the winner team
        match.winnerTeam = { team: winningTeamIds }; // Assign ObjectId values
        await match.save();
    
        // Update the points for the winning team
        await User.updateMany(
          { _id: { $in: winningTeamIds } },
          { $inc: { currentPoints: 3 } } // Increment points for the winning players
        );
    
        // Find the league and process the next stage if needed
        const league = await CustomLeague.findOne({ matches: matchId });
        if (league) {
          const allMatchesComplete = await Match.find({
            _id: { $in: league.matches },
            winnerTeam: { $exists: false },
          });
    
          if (!allMatchesComplete.length) {
            const advancingTeams = (
              await Match.find({ _id: { $in: league.matches } })
            ).map((m) => m.winnerTeam);
    
            const nextStage = `Round of ${advancingTeams.length}`;
            const nextRound = match.round - 1;
    
            const nextMatches = [];
            for (let i = 0; i < advancingTeams.length; i += 2) {
              const nextMatch = new Match({
                round: nextRound,
                stage: nextStage,
                participants: [
                  { team: advancingTeams[i].team },
                  { team: advancingTeams[i + 1].team },
                ],
              });
    
              await nextMatch.save();
              nextMatches.push(nextMatch._id);
            }
    
            league.matches.push(...nextMatches);
            await league.save();
          }
        }
    
        return match;
      } catch (error) {
        throw new GenericError(
          `Failed to report match result: ${error.message}`,
          500
        );
      }
  },
    joinLeague: async (
      _: any,
      { leagueId, password }: { leagueId: string; password?: string },
      { req }: { req: any }
    ) => {
      if (!req.isAuth) {
        throw new GenericError("Not authenticated!", 401);
      }

      try {
        const league = await CustomLeague.findById(leagueId);
        if (!league) {
          throw new GenericError("League not found", 404);
        }

        if (league.isPrivate && league.password !== password) {
          throw new GenericError("Invalid password for private league", 403);
        }

        const userId = req.userId;
        if (league.registeredPlayers.includes(userId)) {
          throw new GenericError("User already joined this league", 400);
        }

        if (league.registeredPlayers.length >= league.maxSeats) {
          throw new GenericError("League is full", 400);
        }

        league.registeredPlayers.push(userId);
        await league.save();
        return league;
      } catch (error) {
        throw new GenericError(`Failed to join league: ${error.message}`, 500);
      }
    },
    // Send a message in the league chat
    sendMessage: async (
        _: any,
        { leagueId, content }: { leagueId: string; content: string },
        { req }: { req: any }
      ) => {
        if (!req.isAuth) {
          throw new GenericError("Not authenticated!", 401);
        }
  
        try {
          const league = await CustomLeague.findById(leagueId).populate("chat");
          if (!league) {
            throw new GenericError("League not found", 404);
          }
  
          const chat = await Chat.findById(league.chat);
          if (!chat) {
            throw new GenericError("Chat room not found", 404);
          }
  
          const message = new Message({
            sender: req.userId,
            content,
            chat: chat._id,
            readBy: [req.userId], // Mark as read by the sender
          });
  
          await message.save();
  
          // Update the latest message in the chat
          chat.latestMessage = message._id as mongoose.Types.ObjectId; // Ensure it's a valid ObjectId
          await chat.save();
  
          // Publish the new message for subscriptions
          pubsub.publish(`MESSAGE_ADDED_${chat._id}`, {
            messageAdded: {
              chatId: chat._id,
              message,
            },
          });
          
  
          return message;
        } catch (error) {
          throw new GenericError(`Failed to send message: ${error.message}`, 500);
        }
      },

    // Mark a message as read
    markMessageAsRead: async (
      _: any,
      { messageId }: { messageId: string },
      { req }: { req: any }
    ) => {
      if (!req.isAuth) {
        throw new GenericError("Not authenticated!", 401);
      }

      try {
        const message = await Message.findById(messageId);
        if (!message) {
          throw new GenericError("Message not found", 404);
        }

        if (!message.readBy.includes(req.userId)) {
          message.readBy.push(req.userId);
          await message.save();
        }

        return message;
      } catch (error) {
        throw new GenericError(
          `Failed to mark message as read: ${error.message}`,
          500
        );
      }
    },
  },
  Subscription: {
    messageAdded: {
        subscribe: async (
            _: any,
            { chatId }: { chatId: string },
            { req }: { req: any }
          ) => {
            if (!req.isAuth) {
              throw new GenericError("Not authenticated!", 401);
            }
        
            const chat = await Chat.findById(chatId);
            if (!chat) {
              throw new GenericError("Chat not found", 404);
            }
        
            // Use a dynamic topic specific to the chat
            return pubsub.asyncIterator(`MESSAGE_ADDED_${chatId}`);
        },
    },
  },
};

export default resolvers;
