import { gql } from "apollo-server-express";

const userTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    bio: String
    image: String
    username: String!
    phone: String!
    medals: [Medal!]
    friends: [User!]
    diamond: Int!
    currentPoints: Int!
    totalPoints: Int!
    league: League
    subscribed: Subscription_!
    level: Level!
    likesGiven: [User]
    likesReceived: [User!]
    blocked: [User!]
    achievements: [Achievement!]
    giftsGiven: [Gift!]!
    giftsReceived: [Gift!]!
    friendRequests: [FriendRequest!]
    createdAt: String!
    updatedAt: String!
  }

  type UpdatedUser {
    name: String!
    email: String!
    username: String!
    bio: String
    phone: String!
  }

  input UserInputData {
    name: String!
    email: String!
    password: String!
    phone: String!
  }

  extend type Query {
    getUser(id: ID!): User
    getUsers: [User!]!
    getFriendsByLevel: [User!]
    getUserAchievements(userId: ID!): [Achievement!]
    getNumLikes(userId: ID!): Likes!
    getFriendRequests: [FriendRequest]!
    onlineUsers: [String!]!
  }

  extend type Mutation {
    signUp(
      name: String!
      email: String!
      username: String!
      password: String!
      phone: String!
    ): User
    login(email: String!, password: String!): AuthData!
    updateUser(
      name: String
      email: String
      bio: String
      phone: String
    ): UpdatedUser
    deleteUser(id: ID!): User

    sendFriendRequest(toUserEmail: String!): FriendRequest
    acceptFriendRequest(requestId: ID!): User
    declineFriendRequest(requestId: ID!): User
    deleteFriend(userEmail: String!): User

    likeUser(userEmail: String!): User
    unlikeUser(userEmail: String!): User

    blockUser(userEmail: String!): User
  }
`;

export default userTypeDefs;
