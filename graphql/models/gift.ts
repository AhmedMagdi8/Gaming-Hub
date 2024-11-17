import { gql } from "apollo-server-express";

const giftTypeDefs = gql`
  type Gift {
    id: ID!
    sender: User!
    receivers: [User!]!
    count: Int!
    value: Float!
    currency: String!
    type: String!
    message: String
    status: String!
    expirationDate: Date
    giftCategory: String!
    isAnonymous: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  input CreateGiftInput {
    receiverIds: [ID!]!
    count: Int!
    value: Float!
    currency: String!
    type: String!
    message: String
    status: String!
    expirationDate: Date
    giftCategory: String!
    isAnonymous: Boolean!
  }

  input UpdateGiftInput {
    id: ID!
    count: Int
    value: Float
    currency: String
    type: String
    message: String
    status: String
    expirationDate: Date
    giftCategory: String
    isAnonymous: Boolean
  }

  extend type Query {
    getGift(id: ID!): Gift
    getGiftsGiven: [Gift!]!
    getGiftsReceived: [Gift!]!
  }

  extend type Mutation {
    createGift(input: CreateGiftInput!): Gift!
    updateGift(input: UpdateGiftInput!): Gift!
  }
`;


export default giftTypeDefs;
