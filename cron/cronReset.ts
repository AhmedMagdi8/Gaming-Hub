import cron from 'node-cron';
import User from '../models/user';
import Ranking from '../models/ranking';
import League from '../models/league';

// Function to reset user points and update rankings
const resetUserPointsAndUpdateRankings = async () => {
  const users = await User.find().populate('league');

  for (const user of users) {
    const { currentPoints, league } = user;

    // Create a new ranking record
    await Ranking.create({
      user: user._id,
      league: league,
      points: currentPoints,
      period: 'week', // Change to 'month' when called for monthly reset
      periodStart: new Date(),
      periodEnd: new Date(new Date().setDate(new Date().getDate() + 7)), // Set to 1 week ahead
      position: 0,
    });

    user.currentPoints = 0;
    await user.save();
  }

  // Calculate rankings after resetting points
  await calculateRankings();
};

// Function to calculate rankings based on points
const calculateRankings = async () => {
  const leagues = await League.find();

  for (const league of leagues) {
    const weeklyRankings = await User.find({ league: league._id }).sort({ currentPoints: -1 }).limit(10);

    for (let i = 0; i < weeklyRankings.length; i++) {
      const userRanking = await Ranking.findOne({ user: weeklyRankings[i]._id, period: 'week' });
      if (userRanking) {
        userRanking.position = i + 1;
        await userRanking.save();
      }
    }
  }
};

// Weekly reset every Sunday at midnight
cron.schedule('0 0 * * 0', resetUserPointsAndUpdateRankings);

// Monthly reset on the first day of every month at midnight
cron.schedule('0 0 1 * *', async () => {
  const users = await User.find().populate('league');

  for (const user of users) {
    const { currentPoints, league } = user;

    await Ranking.create({
      user: user._id,
      league: league,
      points: currentPoints,
      period: 'month',
      periodStart: new Date(),
      periodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      position: 0,
    });

    user.currentPoints = 0;
    await user.save();
  }

  await calculateRankings();
});

export default {
  resetUserPointsAndUpdateRankings,
  calculateRankings,
};
