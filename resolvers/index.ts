import merge from 'lodash';
import likesResolver from './likesResolver';
import friendResolver from './friendResolver';

export default merge.merge(likesResolver, friendResolver);
