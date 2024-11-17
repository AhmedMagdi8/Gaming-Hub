import merge from 'lodash';
import giftResolver from './resolvers/giftResolver';
import achievementResolver from './resolvers/achievementResolver';
import userResolver from './resolvers/userResolver';
import chatResolver from './resolvers/chatResolver';
import leagueResolver from './resolvers/leagueResolver';
import gamesResolver from './resolvers/gamesResolver';
import customLeagueResolver from './resolvers/customLeagueResolver';

// import { mergeTypeDefs } from '@graphql-tools/merge';


export default merge.merge(achievementResolver, giftResolver, userResolver, chatResolver, leagueResolver, gamesResolver, customLeagueResolver);
