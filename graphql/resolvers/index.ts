import merge from 'lodash';
import giftResolver from './giftResolver';
import achievementResolver from './achievementResolver';
import userResolver from './userResolver';
import chatResolver from './chatResolver';

export default merge.merge(achievementResolver, giftResolver, userResolver, chatResolver);
