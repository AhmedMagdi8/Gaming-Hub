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


# CustomLeague Type representing league details
type CustomLeague {
  id: ID!
  name: String!
  description: String
  isPrivate: Boolean!
  maxSeats: Int!
  registeredPlayers: [User!]!
  spectators: [User!]!
  chat: Chat
  status: String!
  pointsForTopThree: [Int!]!
  pointsForWin: Int!
  playSpeed: String!
  playType: String!
  levelName: String!
  roomBackground: String
  matches: [Match!]!
  createdAt: String!
  updatedAt: String!
}

# Match Type representing matches within a league
type Match {
  id: ID!
  round: Int!
  stage: String!
  participants: [User!]!
  winner: User
  loser: User
  createdAt: String!
  updatedAt: String!
}

  # Input for creating or updating a league
  input CreateCustomLeagueInput {
    name: String!
    description: String
    isPrivate: Boolean!
    password: String
    maxSeats: Int!
    pointsForTopThree: [Int!]!
    pointsForWin: Int!
    playSpeed: String!
    playType: String!
    levelName: String!
    roomBackground: String
  }
  # Input for adding or updating a match
  input AddCustomMatchInput {
    leagueId: ID!
    round: Int!
    stage: String!
    participantIds: [ID!]! # IDs of the two participants
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

    # Fetch all leagues
    getCustomLeagues: [CustomLeague!]!

    # Fetch a specific league by ID
    getCustomLeague(id: ID!): CustomLeague!

    # Fetch matches in a specific league
    getCustomLeagueMatches(leagueId: ID!): [Match!]!
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
  

    # Create a new custom league
    createCustomLeague(input: CreateCustomLeagueInput!): CustomLeague!

    # Update a custom league's details
    updateCustomLeague(id: ID!, input: CreateCustomLeagueInput!): CustomLeague!

    # Delete a custom league
    deleteCustomLeague(id: ID!): CustomLeague!

    # Add a match to a custom league
    addCustomMatch(input: AddCustomMatchInput!): Match!

    # Update match results
    updateCustomMatchResult(matchId: ID!, winnerId: ID!, loserId: ID!): Match!

    # Register a user to a custom league
    registerUserToCustomLeague(leagueId: ID!, userId: ID!): CustomLeague!

    # Add a spectator to a custom league
    addSpectatorToCustomLeague(leagueId: ID!, userId: ID!): CustomLeague!

    joinLeague(leagueId: ID!, password: String): CustomLeague!
    addSpectatorToLeague(leagueId: ID!): CustomLeague!
    sendMessageToChat(leagueId: ID!, message: String!): Chat!
  }

  # Subscriptions
  type Subscription {
    messageReceived: Message!
    typing: TypingStatus!
    stopTyping: TypingStatus!
  }
`;

export default typeDefs;
