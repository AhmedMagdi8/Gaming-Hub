import merge from 'lodash';
import giftResolver from './giftResolver';
import achievementResolver from './achievementResolver';
import userResolver from './userResolver';

export default merge.merge(achievementResolver, giftResolver, userResolver);
