import User from "../models/user";
import League from '../models/league'; // Adjust the path as needed

// Function to calculate rankings
export const updateRankings = async () => {
  try {
    // Update Game Rankings (Week, Month, Overall)
    const users: any = await User.find().populate('league.id');

    // Sort by current week points (Game Rankings)
    users.sort((a, b) => b.gamePoints.currentWeek - a.gamePoints.currentWeek);
    users.forEach((user, index) => {
      user.gameRankings.weekRank = index + 1;
    });

    // Sort by current month points (Game Rankings)
    users.sort((a, b) => b.gamePoints.currentMonth - a.gamePoints.currentMonth);
    users.forEach((user, index) => {
      user.gameRankings.monthRank = index + 1;
    });

    // Sort by total game points (Overall Ranking)
    users.sort((a, b) => b.level.totalGamePoints - a.level.totalGamePoints);
    users.forEach((user, index) => {
      user.gameRankings.totalRank = index + 1;
    });

    // Fetch leagues from the database
    const leagues = await League.find().select('name'); // Get only league names
    const leagueNames = leagues.map(league => league.name); // Extract league names

    // Group users by league type
    const usersByLeagueType = leagueNames.reduce((acc, type) => {
      acc[type] = users.filter(user =>
        user.league?.id && user.league.id.name === type // Safe access to league.id
      );
      return acc;
    }, {});

    // Update League Rankings
    for (const leagueName of leagueNames) {
      const leagueUsers = usersByLeagueType[leagueName] || [];
      
      // Sort league users by current month points
      leagueUsers.sort((a, b) => b.league?.currentMonthPoints - a.league?.currentMonthPoints || 0);
      leagueUsers.forEach((user, index) => {
        if (user.league) {
          user.league.currentMonthRank = index + 1; // Update current month rank in league
        }
      });

      // Sort league users by last month points
      leagueUsers.sort((a, b) => b.league?.lastMonthPoints - a.league?.lastMonthPoints || 0);
      leagueUsers.forEach((user, index) => {
        if (user.league) {
          user.league.lastMonthRank = index + 1; // Update last month rank in league
        }
      });
    }

    // Save all updated users
    await Promise.all(users.map(user => user.save()));
    console.log("Rankings updated successfully.");
  } catch (error) {
    console.error("Error updating rankings:", error);
  }
};
