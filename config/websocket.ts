import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { verify } from '../utils/verify';
import User from '../models/user';

export const setupWebSocketServer = (httpServer: any, schema: any) => {
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const wsCleanup = useServer(
    {
      schema,
      context: async ({ connectionParams }) => {
        // const auth = connectionParams?.Authorization?._j || connectionParams?.Authorization || null;
        const auth : any= connectionParams?.Authorization || null;
        if (auth) {
          const decodedToken: any = verify(auth.slice(7));
          const user = await User.findById(decodedToken._id).select('-password');
          return { user };
        } else {
          throw new Error('You must be logged in');
        }
      },
      onConnect: () => {
        console.log('Client connected');
      },
      onDisconnect: () => {
        console.log('Client disconnected');
      },
    },
    wsServer
  );

  return wsCleanup;
};
