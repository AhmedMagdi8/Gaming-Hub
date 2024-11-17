import { gql } from "apollo-server-express";

const achievementTypeDefs = gql`
  type Achievement {
    id: ID!
    name: String!
    description: String!
    userId: ID!
    createdAt: String!
    updatedAt: String!
  }

  input CreateAchievementInput {
    name: String!
    description: String!
  }

  input UpdateAchievementInput {
    name: String
    description: String
  }

  extend type Query {
    getAchievements: [Achievement!]!
    getAchievement(id: ID!): Achievement!
    getUserAchievements(userId: ID!): [Achievement!]
  }

  extend type Mutation {
    createAchievement(input: CreateAchievementInput!): Achievement!
    updateAchievement(id: ID!, input: UpdateAchievementInput!): Achievement!
    deleteAchievement(id: ID!): Achievement!
  }
`;

export default achievementTypeDefs;
