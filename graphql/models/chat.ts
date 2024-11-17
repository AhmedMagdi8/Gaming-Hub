import { gql } from "apollo-server-express";

const chatTypeDefs = gql`
  type Chat {
    id: ID!
    users: [User!]!
    latestMessage: Message
    createdAt: String!
    updatedAt: String!
  }

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

  input CreateChatInput {
    users: [ID!]!
  }

  type TypingStatus {
    userId: ID!
    room: String!
  }

  extend type Query {
    getInbox: [Chat!]!
    getChat(chatId: ID!): Chat
    getFullChat(chatId: ID!): [Message!]!
    getChats: [Chat!]!
  }

  extend type Mutation {
    createNewMessage(input: CreateMessageInput!): Message!
    createChat(input: CreateChatInput!): Chat!
    markAsRead(chatId: ID!): Boolean!
    userTyping(room: String!, userId: ID!): Boolean!
    userStoppedTyping(room: String!, userId: ID!): Boolean!
  }

  extend type Subscription {
    messageReceived: Message!
    typing: TypingStatus!
    stopTyping: TypingStatus!
  }


`;

export default chatTypeDefs;
