import { Queue } from 'bullmq';
import connection from '../db/redis.js';
export const campaignQueue = new Queue('campaign-sending', { connection });
//# sourceMappingURL=campaignQueue.js.map