import Ranking from "../../models/ranking"; // Ranking model
import { startOfMonth, endOfMonth, subMonths, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import GenericError from "../../utils/error";

const rankingResolvers = {
  Query: {
    // Fetch rankings for a specific league and period (current or last month)
    leagueRankings: async (_: any, { leagueName, period }: {leagueName: String, period: String}, {req} : { req: any}) => {
      try {

        if (!req.isAuth) throw new GenericError("Not authenticated!", 401);

        
        // Calculate date range based on the period
        const currentMonthStart = startOfMonth(new Date());
        const currentMonthEnd = endOfMonth(new Date());
        const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
        const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

        const periodStart = period === "current" ? currentMonthStart : lastMonthStart;
        const periodEnd = period === "current" ? currentMonthEnd : lastMonthEnd;

        // Query for rankings in the specified league and period
        const rankings: any = await Ranking.find({
          leagueName,
          period: "month",
          periodStart: { $gte: periodStart, $lte: periodEnd },
        })
          .populate({
            path: "user",
            select: "username", // Fetch only the username field from the user
          })
          .sort({ points: -1 }) // Sort by points in descending order
          .select("points");

        // Map results to return an array of usernames and points
        return rankings.map(ranking => ({
          username: ranking.user.username,
          points: ranking.points,
        }));
      } catch (error) {
        throw new GenericError(`Failed to fetch rankings: ${error.message}`, 500);
      }
    },

    // Fetch top players for last week
    topPlayers: async (_: any, __: any, { req }: { req: any}) => {
      if (!req.isAuth) throw new GenericError("Not authenticated!", 401);

      try {
        // Get top players for last week
        const lastWeekTop = await getTopPlayers("week");

        return {
          lastWeek: lastWeekTop,
        };
      } catch (error) {
        throw new GenericError(`Failed to fetch top players: ${error.message}`, 500);
      }
    },
  },
};

// Helper function to get top players by period
async function getTopPlayers(period) {
  let periodStart;
  let periodEnd;

  // Define date range for each period
  if (period === "week") {
    periodStart = startOfWeek(subWeeks(new Date(), 1));
    periodEnd = endOfWeek(subWeeks(new Date(), 1));
  } else if (period === "month") {
    periodStart = startOfMonth(subMonths(new Date(), 1));
    periodEnd = endOfMonth(subMonths(new Date(), 1));
  }

  // Query top players based on points and date range
  const query: any = {};
  if (periodStart && periodEnd) {
    query.periodStart = { $gte: periodStart, $lte: periodEnd };
  }

  const topPlayers: any = await Ranking.find(query)
    .populate("user", "username") // Fetch username from User model
    .sort({ points: -1 }) // Sort by points descending
    .limit(3) // Limit to top 3 players
    .select("points");

  return topPlayers.map(player => ({
    username: player.user.username,
    points: player.points,
  }));
}

export default rankingResolvers;
