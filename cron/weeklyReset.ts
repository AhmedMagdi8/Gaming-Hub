import User from '../models/user';

export const resetWeeklyPoints = async () => {
    try {
      // Reset current week game points for all users
      await User.updateMany({}, { 'gamePoints.currentWeek': 0 });
      console.log('Weekly game points reset.');
    } catch (error) {
      console.error('Error resetting weekly points:', error);
    }
  };
  
  