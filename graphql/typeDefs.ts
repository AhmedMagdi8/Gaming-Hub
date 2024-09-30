import { gql } from "apollo-server-express";

const typeDefs = gql`
  # Achievement Type
  type Achievement {
    id: ID!
    name: String!
    description: String!
    createdAt: String!
    updatedAt: String!
  }

  # Medal Type
  type Medal {
    id: ID!
    name: String!
    description: String!
    img: String!
    createdAt: String!
    updatedAt: String!
  }

  # GraphQL Schema (gift.graphql)

  scalar Date

  # The Gift type that represents a gift object
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

  # Input type for creating a new gift
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

  # Input type for updating an existing gift
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
  # Achievement Type
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
  type Message {
    id: ID!
    content: String!
    sender: User!
    chat: Chat!
  }
  input CreateChatInput {
    users: [ID!]!
  }
  type Chat {
    id: ID!
    users: [User!]!
    latestMessage: Message
  }

  type TypingStatus {
    userId: ID!
    room: String!
  }

  input CreateMessageInput {
    content: String!
    chatId: ID!
  }

  type Level {
    name: String!
    num: Int!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    username: String!
    phone: String!
    medals: [Medal!]
    friends: [User!]
    diamond: Int!
    subscribed: Subscription_!
    likesGiven: [User]
    likesReceived: [User!]
    blocked: [User!]
    achievements: [Achievement!]
    giftsGiven: [Gift!]!
    giftsReceived: [Gift!]!
    friendRequests: [FriendRequest!]
    level: Level! # Add level field
    createdAt: String!
    updatedAt: String!
  }

  type FriendRequest {
    id: ID!
    from: User! # The user who sent the request
    to: User! # The user who received the request
    status: String! # Status of the friend request (PENDING, ACCEPTED, REJECTED)
    createdAt: String!
    updatedAt: String!
  }

  # Subscription details
  type Subscription_ {
    is: Boolean
    start: String
    end: String
  }

  # Auth Data type
  type AuthData {
    token: String!
    user: User!
  }

  # Inputs
  input userInputData {
    name: String!
    email: String!
    password: String!
    phone: String!
  }

  type Likes {
    numLikes: String
    likedBy: [User!]
  }
  # Queries
  type Query {
    # User Queries
    getUser(id: ID!): User
    getUsers: [User!]!
    getFriendsByLevel: [User!]
    getUserAchievements(userId: ID!): [Achievement!]
    getNumLikes(userId: ID!): Likes!
    getFriendRequests: [FriendRequest]!

    # Achievement Queries
    getAchievements: [Achievement!]!
    getAchievement(id: ID!): Achievement!

    # Gift Queries
    getGift(id: ID!): Gift
    getGiftsGiven: [Gift!]!
    getGiftsReceived: [Gift!]!

    # Medal Queries
    getMedal(id: ID!): Medal
    getMedals: [Medal!]!

    # Chat Queries
    getInbox: [Chat!]!
    getChat(chatId: ID!): Chat
    getFullChat(chatId: ID!): [Message!]!
    getChats: [Chat!]!
  }

  # Mutations
  type Mutation {
    # User Mutations
    signUp(
      name: String!
      email: String!
      username: String!
      password: String!
      phone: String!
    ): User
    login(email: String!, password: String!): AuthData!

    updateUser(
      id: ID!
      name: String
      email: String
      phone: String
      password: String
    ): User

    deleteUser(id: ID!): User

    # Friend Management
    sendFriendRequest(toUserEmail: String!): FriendRequest
    acceptFriendRequest(requestId: ID!): User
    declineFriendRequest(requestId: ID!): User
    deleteFriend(userEmail: String!): User

    # Like Management
    likeUser(userEmail: String!): User
    unlikeUser(userEmail: String!): User

    # Block Management
    blockUser(userEmail: String!): User

    # Achievement Mutations
    createAchievement(input: CreateAchievementInput!): Achievement!
    deleteAchievement(id: ID!): Achievement!
    updateAchievement(id: ID!, input: UpdateAchievementInput!): Achievement!

    # Gift Mutations
    createGift(input: CreateGiftInput!): Gift!

    # Chat Mutations
    createNewMessage(input: CreateMessageInput!): Message!
    createChat(input: CreateChatInput!): Chat!
    markAsRead(chatId: ID!): Boolean!
    userTyping(room: String!, userId: ID!): Boolean!
    userStoppedTyping(room: String!, userId: ID!): Boolean!
  }
  type Subscription {
    messageReceived: Message!
    typing: TypingStatus!
    stopTyping: TypingStatus!
  }
`;

export default typeDefs;
