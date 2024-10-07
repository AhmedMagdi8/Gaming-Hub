import express from 'express';
import { createServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import dotenv from 'dotenv';
import { setupWebSocketServer } from './config/websocket';
import { connectToDB } from './config/db';
import { applyMiddlewares } from './middlewares/index';
import  authMiddleware  from './middlewares/authMiddleware';
import errorHandler from './middlewares/errorHandler';

import schema from './graphql/schema'; // Assuming schema combines typeDefs and resolvers
import KafkaController from './middlewares/kafkaController';

dotenv.config();

async function startServer() {
  const app = express();

  const httpServer = createServer(app);

  applyMiddlewares(app); // Body parser, static files, etc.
  app.use(authMiddleware);

  // kafka setup
  app.post('/kafka-create-topic', async (req, res) => {
    try {
    const kafkaController = new KafkaController();
    const { topicName, noOfPartition } = req.body;
    await kafkaController.createTopic(topicName, noOfPartition)

    res.send({
      status: "Ok",
      message: "Topic created successfully",
    });

    } catch(e) {
      res.status(500).send({
        message: "Failed to create Topic",
      });
    }
  });

  app.post('/publish', async(req, res) => {
    try {
      const { topicName, message } = req.body;
      const messages = [{
        key: message?.key,
        value: message?.value
      }]
      const kafkaController = new KafkaController();
      await kafkaController.publishMessageToTopic(topicName, messages);
      res.send({
        status:'Ok',
        message: 'Message successfully published'
      })
    } catch(e) {
      res.status(500).send({
        message: 'Failed to send Message'
      })
    }
  });

  // app.post('/consume', async(req, res) => {
  //   try {
  //     console.log(1);

  //     const { topicName } = req.body;
  //     const kafkaController = new KafkaController();
  //     console.log(2);

  //     await kafkaController.consumeMessageFromTopic(topicName, (message: any) => {
  //       console.log(6);
  //         res.send({
  //         status:'Ok',
  //         message
  //       });
  //     });
  //     console.log(7);
      

  //   } catch(e) {
  //     res.status(500).send({
  //       message: 'Failed to consume Message from the topic'
  //     })
  //   }
  // });

  // WebSocket Setup
  app.post('/consume', async (req, res) => {
    try {
      console.log("Starting message consumption...");
      const { topicName } = req.body;
      const kafkaController = new KafkaController();
  
      // Timeout handler to prevent hanging indefinitely
      const timeoutId = setTimeout(() => {
        return res.status(408).send({ message: "Request timed out" });
      }, 10000); // Set timeout duration (e.g., 10 seconds)
  
      await kafkaController.consumeMessageFromTopic(topicName, (message) => {
        clearTimeout(timeoutId); // Clear timeout on first message
        console.log("Received callback message:", message);
        return res.send({
          status: 'Ok',
          message,
        });
      });
    } catch (e) {
      res.status(500).send({
        message: 'Failed to consume message from the topic',
      });
    }
  });
  
  
  const wsCleanup = setupWebSocketServer(httpServer, schema);

  // Apollo Server Setup
  const server = new ApolloServer({
    schema,
    context: async ({ req }) => { 
      return {req};
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

  console.log(`Server running at http://localhost:${process.env.PORT}${server.graphqlPath}`);

  // Connect to MongoDB
  connectToDB();
}

startServer();
