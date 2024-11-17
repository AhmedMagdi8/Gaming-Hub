import express, { NextFunction } from "express";
import cron from "node-cron";
import { createServer } from "http";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import dotenv from "dotenv";
import { setupWebSocketServer } from "./config/websocket";
import { connectToDB } from "./config/db";
import { applyMiddlewares } from "./middlewares/index";
import authMiddleware from "./middlewares/authMiddleware";
import errorHandler from "./middlewares/errorHandler";
import imageRoutes from "./routes/imageRoutes"; // Import your new user routes
import { resetMonthlyPoints } from "./cron/monthlyReset";
import { resetWeeklyPoints } from "./cron/weeklyReset";
import { updateRankings } from "./cron/updateRankings";

import schema from "./graphql/schema";

dotenv.config();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  applyMiddlewares(app); // Body parser, static files, etc.
  app.use(authMiddleware);

  // Initialize Cronjobs
  // Schedule the cronjob to run every Monday at midnight
  cron.schedule("0 0 * * 1", resetWeeklyPoints);
  // Schedule the cronjob to run on the 1st of every month at midnight
  cron.schedule("0 0 1 * *", resetMonthlyPoints);
  // Schedule the cronjob to run every 1 minute
  cron.schedule("*/1 * * * *", updateRankings);

  // Use the user routes for handling image uploads and retrieval
  app.use("/", imageRoutes);

  // WebSocket Setup
  const wsCleanup = setupWebSocketServer(httpServer, schema);

  // Apollo Server Setup
  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      return { req };
    },
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

  app.use(errorHandler);

  // Start HTTP Server
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: process.env.PORT }, resolve)
  );

  console.log(
    `Server running at http://localhost:${process.env.PORT}${server.graphqlPath}`
  );

  // Connect to MongoDB
  connectToDB();
}

startServer();
