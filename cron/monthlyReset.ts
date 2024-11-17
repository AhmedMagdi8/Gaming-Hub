import User from '../models/user';

export const resetMonthlyPoints = async () => {
    try {
      // Reset current month points and move to last month for all users
      const users = await User.find();
      
      // Loop through each user and reset their points
      for (const user of users) {
        // Game points reset
        user.gamePoints.lastMonth = user.gamePoints.currentMonth;
        user.gamePoints.currentMonth = 0;
  
        // League points reset (if the user is enrolled in a league)
        if (user.league) {
          user.league.lastMonthPoints = user.league.currentMonthPoints;
          user.league.currentMonthPoints = 0;
        }
  
        await user.save();
      }
  
      console.log('Monthly game and league points reset.');
    } catch (error) {
      console.error('Error resetting monthly points:', error);
    }
  };
  
