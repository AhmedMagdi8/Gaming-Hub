import { gql } from "apollo-server-express";

const medalTypeDefs = gql`
  type Medal {
    id: ID!
    name: String!
    description: String!
    img: String!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    getMedal(id: ID!): Medal
    getMedals: [Medal!]!
  }
`;

export default medalTypeDefs;
