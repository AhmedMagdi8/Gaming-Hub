import User from "../../models/user";
import League from "../../models/league";

const resolvers = {
  Query: {
    // Fetch current month league rankings by league name (pre-sorted by cron job)
    getCurrentMonthLeagueRankings: async (_: any, { leagueName }: { leagueName: string }) => {
      const league = await League.findOne({ name: leagueName });
      if (!league) throw new Error("League not found");

      return await User.find({ 'league.id': league._id }) // Use league ID for querying users
        .select('username league.currentMonthRank league.currentMonthPoints') // Select only username, rank, and current month points
        .sort({ 'league.currentMonthRank': 1 }) // Sort by current month rank in ascending order
        .lean(); // Convert to plain JavaScript object
    },

    // Fetch last month league rankings by league name (pre-sorted by cron job)
    getLastMonthLeagueRankings: async (_: any, { leagueName }: { leagueName: string }) => {
      const league = await League.findOne({ name: leagueName });
      if (!league) throw new Error("League not found");

      return await User.find({ 'league.id': league._id }) // Use league ID for querying users
        .select('username league.lastMonthRank league.lastMonthPoints') // Select only username, rank, and last month points
        .sort({ 'league.lastMonthRank': 1 }) // Sort by last month rank in ascending order
        .lean(); // Convert to plain JavaScript object
    }
  }
};

export default resolvers;
