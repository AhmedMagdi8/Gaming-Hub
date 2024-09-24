import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import resolvers from './resolvers/index';
import User from './models/userModel';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { verify } from './utils';
import bodyParser from 'body-parser';
import { existsSync, promises } from 'fs';
import { join } from 'path';
import mongoose from 'mongoose';
import cors from 'cors';
import typeDefs from './schema';

dotenv.config();
async function context({ req }: { req: any }) {
  if (req) {
    // !need to fix when the user is not logged in and want login
    const auth = req.headers.Authorization || req.headers.authorization || null;
    if (auth) {
      const decodedToken: any = verify(auth.slice(7));
      const user = await User.findById(decodedToken._id).select('-password');
      return { user };
    }
  }
}

const uploadsFolder = join(__dirname, './uploads');

if (!existsSync(uploadsFolder)) {
  (async () => {
    await promises.mkdir(uploadsFolder);
  })();
}

async function startApolloServer(typeDefs: any, resolvers: any) {
  const app = express();
  const httpServer = createServer(app);
  app.get('/health', (req, res) => {
    res.status(200).send('<h1 style="text-align:center;"> welcome to server :) </h1>');
  });
  // set the limit to 10mb
  app.use(cors());
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  // app.use((req, res, next) => {
  //   res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL);
  //   next();
  // });

  app.use(express.static('uploads'));
  // app.use(morgan('dev'));

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });
  const serverCleanup = useServer(
    {
      schema,
      context: async ({ connectionParams }: { connectionParams: any }) => {
        const auth =
          connectionParams?.Authorization?._j ||
          connectionParams?.Authorization ||
          null;
        if (auth) {
          const decodedToken: any = verify(auth.slice(7));
          const user = await User.findById(decodedToken._id).select(
            '-password'
          );
          return { user };
        } else throw new Error('you must be logged in');
      },
      onConnect: (ctx: any) => {
        const { connectionParams, socket, context } = ctx;
        console.log('Client connected');
        // rest of your onConnect code
      },
      // onDisconnect: async (context: any) => {
      //   const auth =
      //     context.connectionParams?.Authorization?._j ||
      //     context.connectionParams?.Authorization ||
      //     null;
      //   if (auth) {
      //     const userId = verify(auth.slice(7))._id;
      //     const room = await Room.findOne({
      //       $or: [
      //         { 'firstPlayer.realPlayer': userId },
      //         { 'secondPlayer.realPlayer': userId },
      //         { 'thirdPlayer.realPlayer': userId },
      //         { 'fourthPlayer.realPlayer': userId },
      //       ],
      //     });
      //     if (room) {
      //       const user = realPlayer(room, userId);
      //       // @ts-ignore
      //       room[user].realPlayer = null;
      //       await room.save();
      //     }
      //   }
      //   console.log('Client disconnected');
      // },
    },
    wsServer
  );
  const server = new ApolloServer({
    schema,
    context,
    introspection: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();
  server.applyMiddleware({ app });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: process.env.PORT }, resolve)
  );
  console.log(
    `Server ready at http://localhost:${process.env.PORT || 8080}${server.graphqlPath}`
  );
  await mongoose
    .connect(process.env.DB_URL || '')
    .then(() => {
      console.log('DB Connected successfully');
    })
    .catch((err) => {
      if (err) throw err;
    });
  return { server, app };
}
startApolloServer(typeDefs, resolvers);
