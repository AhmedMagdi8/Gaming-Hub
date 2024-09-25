import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
  }

  type Query {
    getUser(id: ID!): User
  }

  type Mutation {
    login(email: String!, password: String!): String!
  }

  type Subscription {
    userAdded: User
  }
`;

export default typeDefs;
