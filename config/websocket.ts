import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import User from '../models/user';
import { verify } from '../utils/verify'; // Import the shared function
import redis from '../redis/redis';
export const setupWebSocketServer = (httpServer: any, schema: any) => {
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const wsCleanup = useServer(
    {
      schema,
      context: async ({ connectionParams }) => {
        const auth: any = connectionParams?.Authorization || null;
        if (auth) {
          const token = auth.slice(7); // Assuming the token is prefixed with "Bearer "
          try {
            const decodedToken: any = verify(token); // Use the shared function
            const user = await User.findById(decodedToken._id).select('-password name email username');
            return { user }; // This will be accessible in your GraphQL resolvers
          } catch (err) {
            throw new Error('Invalid token');
          }
        } else {
          throw new Error('You must be logged in');
        }
      },
      onConnect: async (connectionParams: any) => {
        console.log('Client connected');
        const userId = connectionParams?.userId; // Adjust according to your setup
        console.log('Client connected:', userId);
        // Add user to Redis set
        await redis.sadd('onlineUsers', userId);
      },
      onDisconnect: async  (ws, req: any) => {
        console.log('Client disconnected');
        const userId = req.userId; // Get the user ID from the request (adjust as needed)
        console.log('Client disconnected:', userId);

        // Remove user from Redis set
        await redis.srem('onlineUsers', userId);
      },
    },
    wsServer
  );

  return wsCleanup; 
};
