import merge from 'lodash';
import likesResolver from './likesResolver';
import friendResolver from './friendResolver';
import giftResolver from './giftResolver';
import medalResolver from './medalResolver';
import userResolver from './userResolver';

export default merge.merge(likesResolver, friendResolver, giftResolver, medalResolver, userResolver);
