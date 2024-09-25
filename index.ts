import express from 'express';
import { createServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import dotenv from 'dotenv';
import { setupWebSocketServer } from './config/websocket';
import { connectToDB } from './config/db';
import { applyMiddlewares } from './middlewares/index';

import schema from './graphql/schema'; // Assuming schema combines typeDefs and resolvers

dotenv.config();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  applyMiddlewares(app); // Body parser, static files, etc.

  // WebSocket Setup
  const wsCleanup = setupWebSocketServer(httpServer, schema);

  // Apollo Server Setup
  const server = new ApolloServer({
    schema,
    context: async ({ req }) => { /* Context auth logic */ },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              wsCleanup.dispose(); // Cleanup WebSocket
            },
          };
        },
      },
    ],
  });

  await server.start();
  server.applyMiddleware({ app });

  // Start HTTP Server
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: process.env.PORT }, resolve)
  );
  console.log(`Server running at http://localhost:${process.env.PORT}${server.graphqlPath}`);

  // Connect to MongoDB
  connectToDB();
}

startServer();
