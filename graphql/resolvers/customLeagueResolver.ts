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
import Team from "../../models/team";
import * as GraphQLUpload from 'graphql-upload';
import path from 'path';
import fs from 'fs';
import CupType from "../../models/cup";


const UPLOAD_DIR = path.join(__dirname, '../../uploads'); // Directory for uploads

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const pubsub = new PubSub();

const MESSAGE_ADDED = "MESSAGE_ADDED";

const resolvers = {
  Mutation: {
    // Create a new league

    createCustomLeague : async (
      _: any,
      { input }: { input: any },
      { req }: { req: any }
    ) => {
      if (!req.isAuth) {
        throw new GenericError("Not authenticated!", 401);
      }
    
      try {
        // Check if it's a private league and if password is provided
        if (input.isPrivate && !input.password) {
          throw new GenericError("Private leagues require a password", 400);
        }
    
        // Find the authenticated user
        const user = await User.findById(req.userId);
        if (!user) {
          throw new GenericError("User not found", 404);
        }
    
        // Deduct the winner prize and loser prize from the user's diamonds
        const winnerPrize = parseInt(input.prizes.winnerPrize, 10);
        const loserPrize = input.prizes.loserPrize
          ? parseInt(input.prizes.loserPrize, 10)
          : 0;
    
        // Validate that the user has enough diamonds
        if (user.diamond < winnerPrize + loserPrize) {
          throw new GenericError("Insufficient diamonds to create this league", 400);
        }
    
        // Deduct diamonds
        user.diamond -= winnerPrize + loserPrize;
        await user.save();
    
        // Handle roomBackground image upload
        let roomBackgroundPath = '';
        if (input.roomBackground) {
          const { createReadStream, filename } = await input.roomBackground;
    
          // Define the path where the image will be saved locally
          const filePath = path.join(UPLOAD_DIR, filename);
          
          // Create a write stream to save the file
          const writeStream = fs.createWriteStream(filePath);
    
          // Pipe the file stream to the local file
          await new Promise((resolve, reject) => {
            createReadStream()
              .pipe(writeStream)
              .on('finish', resolve)
              .on('error', reject);
          });
    
          // Set the room background path to the relative path (or a full URL if needed)
          roomBackgroundPath = `/uploads/${filename}`; // Adjust path if needed for your server
        }
    
        // Create a new custom league
        const league = new CustomLeague({
          ...input,
          createdByAdmin: req.isAdmin || false,
          status: "coming", // Default status
          registeredPlayers: [], // Initialize as empty
          spectators: [], // Initialize as empty
          matches: [], // Empty matches initially
          startTime: null, // This will be set later, based on maxSeats and registration
          cardForm: null, // Optional, can be filled later if needed
          roomBackground: roomBackgroundPath, // Save the image path in the league
          topThreeCups: [], // Set top three cups if applicable
        });
  
    
        // Save the league
        await league.save();
        return league;
      } catch (error) {
        throw new GenericError(`Failed to create league: ${error.message}`, 500);
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

        return { spectatorId: userId }; // Return only the spectatorId
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
        const league = await CustomLeague.findById(leagueId).populate(
          "registeredPlayers"
        );
        if (!league) {
          throw new GenericError("League not found", 404);
        }

        // Check if the league is full
        if (league.registeredPlayers.length !== league.maxSeats) {
          throw new GenericError("League is not full yet", 400);
        }

        // Create shuffled player pairs for the teams
        const shuffledPlayers = shuffle(league.registeredPlayers); // Randomize the players
        const teams = [];

        for (let i = 0; i < shuffledPlayers.length; i += 2) {
          // Create a new team with two players
          const team = new Team({
            league: leagueId,
            players: [shuffledPlayers[i]._id, shuffledPlayers[i + 1]._id],
            totalPoints: 0, // Initially, no points
            matchesPlayed: 0, // No matches played yet
            matchesWon: 0, // No matches won yet
          });
          await team.save();
          teams.push(team);
        }

        // Define round and stage
        const stage = `Round of ${league.maxSeats}`;
        const round = Math.log2(league.maxSeats); // Calculate the round based on the number of teams

        const matches = [];
        for (let i = 0; i < teams.length; i += 2) {
          const match = new Match({
            league: leagueId,
            round,
            stage,
            participants: [
              { team: teams[i]._id }, // First team
              { team: teams[i + 1]._id }, // Second team
            ],
            winner: null, // To be set after match completion
            loser: null, // To be set after match completion
          });

          await match.save();
          matches.push(match);
        }

        // Update the league with the generated matches
        league.matches = matches.map((match) => match._id);
        league.status = "active";
        await league.save();

        return { matches }; // Return the generated matches
      } catch (error) {
        throw new GenericError(
          `Failed to generate matches: ${error.message}`,
          500
        );
      }
    },

    reportMatchResult: async (
      _: any,
      {
        matchId,
        winningTeamId,
        round,
      }: { matchId: string; winningTeamId: string; round: number },
      { req }: { req: any }
    ) => {
      if (!req.isAuth) {
        throw new GenericError("Not authenticated!", 401);
      }

      try {
        // Validate the winning team ID
        const winningTeamObjectId = new mongoose.Types.ObjectId(winningTeamId);

        // Find the match and check if it exists
        const match = await Match.findById(matchId).populate({
          path: "participants.team",
          model: "Team",
        });
        if (!match) {
          throw new GenericError("Match not found", 404);
        }

        // Ensure the winning team is part of the match participants
        const isWinningTeamValid = match.participants.some(
          (participant) =>
            participant.team &&
            (participant.team as any)._id.toString() === winningTeamId
        );
        if (!isWinningTeamValid) {
          throw new GenericError(
            "Winning team is not a participant in this match",
            400
          );
        }

        // Initialize roundWinners if undefined
        match.roundWinners = match.roundWinners;

        // If it's a final match, track the winner for each round
        if (match.isFinal) {
          // Store the winner for the current round in roundWinners
          match.roundWinners.push({
            round,
            winnerTeam: winningTeamObjectId,
          });

          // Check if all rounds are completed for the final match (3 rounds)
          if (match.roundWinners.length === 3) {
            // Determine the final winner based on the team with 2 or more round wins
            const roundWins: Record<string, number> = {
              [match.roundWinners[0].winnerTeam.toString()]: 0,
              [match.roundWinners[1].winnerTeam.toString()]: 0,
              [match.roundWinners[2].winnerTeam.toString()]: 0,
            };

            // Count wins for each team in the 3 rounds
            match.roundWinners.forEach((round) => {
              roundWins[round.winnerTeam.toString()] += 1;
            });

            // Determine the winner based on majority wins (2 or 3 rounds)
            const finalWinnerId = Object.keys(roundWins).find(
              (teamId) => roundWins[teamId] >= 2
            );

            if (finalWinnerId) {
              // Convert the winner's ID to an ObjectId if it's a valid ID
              match.winnerTeam = {
                team: new mongoose.Types.ObjectId(finalWinnerId),
              };
            } else {
              // If there is no majority, handle it as a tie (optional logic)
              match.winnerTeam = null;
            }
          }
        } else {
          // For non-final matches, update the winner normally
          match.winnerTeam = { team: winningTeamObjectId };
        }

        // Identify the losing team
        const loserParticipant = match.participants.find(
          (participant) =>
            participant.team &&
            (participant.team as any)._id.toString() !== winningTeamId
        );
        match.loserTeam = loserParticipant
          ? { team: (loserParticipant.team as any)._id }
          : null;

        await match.save();

        // Update points and stats for the winning team
        const winningTeam = await Team.findById(winningTeamObjectId);
        if (!winningTeam) {
          throw new GenericError("Winning team not found", 404);
        }

        winningTeam.totalPoints += 3; // Increment points for the winning team
        winningTeam.matchesPlayed += 1; // Increment matches played
        winningTeam.matchesWon += 1; // Increment matches won
        await winningTeam.save();

        // Update stats for the losing team if applicable
        if (loserParticipant) {
          const losingTeam = await Team.findById(
            (loserParticipant.team as any)._id
          );
          if (losingTeam) {
            losingTeam.matchesPlayed += 1; // Increment matches played
            await losingTeam.save();
          }
        }

        // Check the associated league for advancement
        const league = await CustomLeague.findOne({
          matches: matchId,
        }).populate({
          path: "matches",
          populate: { path: "participants.team", model: "Team" },
        });
        if (league) {
          // Check if all matches in the current stage are completed
          const incompleteMatches = league.matches.filter(
            (m: any) => !m.winnerTeam
          );

          if (incompleteMatches.length === 0) {
            // All matches in the current stage are completed
            const advancingTeams = league.matches.map(
              (m: any) => m.winnerTeam.team
            );

            if (advancingTeams.length > 1) {
              // Determine the current stage dynamically
              const currentStage =
                advancingTeams.length === 4
                  ? "4 Teams"
                  : advancingTeams.length === 8
                  ? "8 Teams"
                  : advancingTeams.length === 16
                  ? "16 Teams"
                  : advancingTeams.length === 32
                  ? "32 Teams"
                  : "Final";

              // Handle Final Stage
              if (currentStage === "Final") {
                const finalMatches = [];
                for (let i = 0; i < 3; i++) {
                  const finalMatch = new Match({
                    league: league._id,
                    round: 3, // Final matches are always Round 1
                    stage: "Final",
                    participants: [
                      { team: advancingTeams[0] },
                      { team: advancingTeams[1] },
                    ],
                    isFinal: true,
                  });

                  await finalMatch.save();
                  finalMatches.push(finalMatch._id);
                }
                league.matches.push(...finalMatches);
                await league.save();
              } else {
                // Handle other stages (single match per round)
                const nextMatches = [];
                for (let i = 0; i < advancingTeams.length; i += 2) {
                  const nextMatch = new Match({
                    league: league._id,
                    round: 1, // Reset round for each stage
                    stage: currentStage,
                    participants: [
                      { team: advancingTeams[i] },
                      { team: advancingTeams[i + 1] },
                    ],
                  });

                  await nextMatch.save();
                  nextMatches.push(nextMatch._id);
                }
                league.matches.push(...nextMatches);
                await league.save();
              }
            }
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

        return { userId }; // Return only the userId
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
          customLeagueMessage: {
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
    customLeagueMessage: {
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
