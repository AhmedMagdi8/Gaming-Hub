import User from "../../models/user";

const resolvers = {
  Query: {
    // Fetch current week game points and rankings
    getCurrentWeekGameStats: async () => {
      return await User.find({})
        .select("username gamePoints.currentWeek gameRankings.weekRank") // Select only username, current week points, and current week rank
        .sort({ "gameRankings.weekRank": 1 }) // Sort by week rank
        .lean(); // Convert to plain JavaScript object
    },

    // Fetch current month game points and rankings
    getCurrentMonthGameStats: async () => {
      return await User.find({})
        .select("username gamePoints.currentMonth gameRankings.monthRank") // Select only username, current month points, and current month rank
        .sort({ "gameRankings.monthRank": 1 }) // Sort by month rank
        .lean(); // Convert to plain JavaScript object
    },

    // Fetch overall game points and rankings
    getOverallGameStats: async () => {
      return await User.find({})
        .select("username level.totalGamePoints gameRankings.totalRank") // Select only username, total game points, and overall rank
        .sort({ "gameRankings.totalRank": 1 }) // Sort by total rank
        .lean(); // Convert to plain JavaScript object
    },
    // Fetch top 3 players for the current week
    getTop3CurrentWeekPlayers: async () => {
      const players = await User.find({})
        .select("username gamePoints.currentWeek gameRankings.weekRank")
        .sort({ "gameRankings.weekRank": 1 })
        .limit(3)
        .lean();

      return players.map((player) => ({
        username: player.username,
        currentWeekPoints: player.gamePoints.currentWeek,
        weekRank: player.gameRankings.weekRank,
      }));
    },

    // Fetch top 3 players for the current month
    getTop3CurrentMonthPlayers: async () => {
      const players = await User.find({})
        .select("username gamePoints.currentMonth gameRankings.monthRank")
        .sort({ "gameRankings.monthRank": 1 })
        .limit(3)
        .lean();

      return players.map((player) => ({
        username: player.username,
        currentMonthPoints: player.gamePoints.currentMonth,
        monthRank: player.gameRankings.monthRank,
      }));
    },

    // Fetch top 3 players overall
    getTop3OverallPlayers: async () => {
      const players = await User.find({})
        .select("username level.totalGamePoints gameRankings.totalRank")
        .sort({ "gameRankings.totalRank": 1 })
        .limit(3)
        .lean();

      return players.map((player) => ({
        username: player.username,
        overallPoints: player.level.totalGamePoints,
        totalRank: player.gameRankings.totalRank,
      }));
    },
  },
};

export default resolvers;
