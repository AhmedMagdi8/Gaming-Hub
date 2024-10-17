import GenericError from "../../utils/error";
import getStartOfPeriod from "../../utils/periodStart"; // Utility to calculate period start date
import User from "../../models/user";
import Ranking from "../../models/ranking"; // Import the Ranking model

const resolvers = {
  Query: {
    // Fetch user's ranking and points for a specific period
    getUserRanking: async (_ : any, { period }: { period: any }, { req }: { req: any}) => {
      if (!req.isAuth) throw new GenericError("Not authenticated!", 401);

      try {
        const userId = req.userId;
        // Fetch the user's current points and league name
        const user: any = await User.findById(userId).populate("league");
        if (!user) throw new GenericError("User not found", 404);

        // Get the user's ranking and period points
        const { rank, periodPoints, rankings } = await getRankingForUser(userId, period);

        return {
          userId,
          currentPoints: user.currentPoints,  // User's all-time points
          periodPoints,                       // Points for the specified period
          rank,                               // User's rank in the specified period
          rankings,                           // List of rankings in the specified period
          leagueName: user.league.name,      // User's league name
        };
      } catch (error) {
        throw new GenericError(`Failed to fetch user ranking: ${error.message}`, 500);
      }
    },
  },
};

// Helper function to get ranking and points based on userId and period
async function getRankingForUser(userId: string, period: 'week' | 'month') {
  // Calculate the start date for the specified period
  const startOfPeriod = getStartOfPeriod(period);

  // Aggregate rankings to find points for the specified period
  const rankings = await Ranking.aggregate([
    { $match: { period, periodStart: { $gte: startOfPeriod } } },
    { $sort: { points: -1 } },
    { $group: { _id: "$user", points: { $sum: "$points" } } },
  ]);

  // Sort rankings by points to determine the user's rank
  const sortedRankings = rankings.sort((a, b) => b.points - a.points);
  const userRank = sortedRankings.findIndex(user => user._id.toString() === userId.toString()) + 1;

  // Extract period points for the user
  const periodPoints = sortedRankings.find(user => user._id.toString() === userId.toString())?.points || 0;

  return {
    rank: userRank || null,            // User's rank in the period
    periodPoints,                      // User's points in the period
    rankings: sortedRankings.map((user, index) => ({
      userId: user._id,
      points: user.points,
      position: index + 1,
    })),
  };
}

export default resolvers;
