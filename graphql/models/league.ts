import { gql } from "apollo-server-express";

const leagueTypeDefs = gql`
  # League Type
  type League {
    id: ID!
    name: String!
  }

  # UserLeagueStats Type
  type UserLeagueStats {
    username: String!
    currentMonthRank: Int
    currentMonthPoints: Int
    lastMonthRank: Int
    lastMonthPoints: Int
  }

  # GameRanking Type
  type GameRanking {
    username: String!
    currentWeekPoints: Int!
    currentMonthPoints: Int!
    totalGamePoints: Int!
    weekRank: Int!
    monthRank: Int!
    totalRank: Int!
  }

  # Top Player Stats
  type CurrentWeekPlayerStats {
    username: String!
    currentWeekPoints: Int
    weekRank: Int
  }

  type CurrentMonthPlayerStats {
    username: String!
    currentMonthPoints: Int
    monthRank: Int
  }

  type OverallPlayerStats {
    username: String!
    overallPoints: Int
    totalRank: Int
  }

  # League and Ranking Queries
  extend type Query {
    getCurrentWeekGameStats: [GameRanking!]!
    getCurrentMonthGameStats: [GameRanking!]!
    getOverallGameStats: [GameRanking!]!
    getCurrentMonthLeagueRankings(leagueName: String!): [UserLeagueStats!]!
    getLastMonthLeagueRankings(leagueName: String!): [UserLeagueStats!]!
    getTop3CurrentWeekPlayers: [CurrentWeekPlayerStats!]!
    getTop3CurrentMonthPlayers: [CurrentMonthPlayerStats!]!
    getTop3OverallPlayers: [OverallPlayerStats!]!
  }
`;

export default leagueTypeDefs;
