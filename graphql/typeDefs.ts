import { gql } from "apollo-server-express";

const typeDefs = gql`
  scalar Date

  # User Type
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

  # Updated User Type for Update Mutation Response
  type UpdatedUser {
    name: String!
    email: String!
    username: String!
    bio: String
    phone: String!
  }

  # Level Type
  type Level {
    name: String!
    num: Int!
  }

  # Subscription Details Type
  type Subscription_ {
    is: Boolean
    start: String
    end: String
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

  # Define the League type to represent league information
  type League {
    id: ID!
    name: String!
  }

  # Define the UserLeagueStats type to represent user league statistics
  type UserLeagueStats {
    username: String!
    currentMonthRank: Int
    currentMonthPoints: Int
    lastMonthRank: Int
    lastMonthPoints: Int
  }

  #  definition for Game Ranking
  type GameRanking {
    username: String!
    currentWeekPoints: Int!
    currentMonthPoints: Int!
    totalGamePoints: Int!
    weekRank: Int!
    monthRank: Int!
    totalRank: Int!
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

  # Gift Type
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

  # Message Type
  type Message {
    id: ID!
    content: String!
    sender: User!
    chat: Chat!
    createdAt: String!
    updatedAt: String!
  }

  input CreateMessageInput {
    content: String!
    chatId: ID!
  }

  # Chat Type
  type Chat {
    id: ID!
    users: [User!]!
    latestMessage: Message
    createdAt: String!
    updatedAt: String!
  }

  # Top Player Type
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


  input CreateChatInput {
    users: [ID!]!
  }

  # Typing Status for Subscription
  type TypingStatus {
    userId: ID!
    room: String!
  }

  # Friend Request Type
  type FriendRequest {
    id: ID!
    from: User!
    to: User!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  # Auth Data Type
  type AuthData {
    token: String!
    user: User!
  }

  # Likes Type
  type Likes {
    numLikes: Int!
    likedBy: [User!]
  }

  # Inputs
  input UserInputData {
    name: String!
    email: String!
    password: String!
    phone: String!
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
    onlineUsers: [String!]!

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

    # League and Ranking Queries
    getCurrentWeekGameStats: [GameRanking!]!
    getCurrentMonthGameStats: [GameRanking!]!
    getOverallGameStats: [GameRanking!]!
    # Fetch current month league rankings by league name
    getCurrentMonthLeagueRankings(leagueName: String!): [UserLeagueStats!]!
    # Fetch last month league rankings by league name
    getLastMonthLeagueRankings(leagueName: String!): [UserLeagueStats!]!
    # Fetch Top players 
    getTop3CurrentWeekPlayers: [CurrentWeekPlayerStats!]!
    getTop3CurrentMonthPlayers: [CurrentMonthPlayerStats!]!
    getTop3OverallPlayers: [OverallPlayerStats!]!
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
      name: String
      email: String
      bio: String
      phone: String
    ): UpdatedUser
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

  # Subscriptions
  type Subscription {
    messageReceived: Message!
    typing: TypingStatus!
    stopTyping: TypingStatus!
  }
`;

export default typeDefs;
