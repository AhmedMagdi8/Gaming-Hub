import merge from 'lodash';
import giftResolver from './giftResolver';
import achievementResolver from './achievementResolver';
import userResolver from './userResolver';
import chatResolver from './chatResolver';
import leagueResolver from './leagueResolver';
import profileRankingResolver from './profileRankingResolver';
import { mergeTypeDefs } from '@graphql-tools/merge';


export default merge.merge(achievementResolver, giftResolver, userResolver, chatResolver, leagueResolver, profileRankingResolver);
