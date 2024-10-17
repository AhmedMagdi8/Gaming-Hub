function getStartOfPeriod(period) {
    const now = new Date();
    if (period === "week") {
      // Start of the current week
      return new Date(now.setDate(now.getDate() - now.getDay()));
    } else if (period === "month") {
      // Start of the current month
      return new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "year") {
      // Start of the current year
      return new Date(now.getFullYear(), 0, 1);
    } else {
      throw new Error("Invalid period specified.");
    }
  }

  
  export default getStartOfPeriod;
  