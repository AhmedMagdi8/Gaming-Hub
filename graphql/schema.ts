import { makeExecutableSchema } from '@graphql-tools/schema';
import resolvers from './resolvers';
import typeDefs from './typeDefs'; // Assuming typeDefs is in a separate file

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default schema;


