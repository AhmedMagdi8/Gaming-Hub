import { gql } from 'apollo-server-core';

const typeDefs = gql`
  type Query {
    # Get a user by ID
    user(id: ID!): User
    # List of all users
    users: [User!]!
    # Get a single post
    post(id: ID!): Post
    # List all posts
    posts: [Post!]!
  }

  type Mutation {
    # Create a new user
    createUser(name: String!, email: String!): User!
    # Update user details
    updateUser(id: ID!, name: String, email: String): User!
    # Delete a user
    deleteUser(id: ID!): Boolean!
    
    # Create a new post
    createPost(title: String!, content: String!, authorId: ID!): Post!
    # Update a post
    updatePost(id: ID!, title: String, content: String): Post!
    # Delete a post
    deletePost(id: ID!): Boolean!
  }

  type Subscription {
    # Subscription to get notified when a user is created
    userCreated: User!
    # Subscription to get notified when a post is created
    postCreated: Post!
  }

  # User type definition
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }

  # Post type definition
  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
  }
`;

export default typeDefs;
