import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
export declare const createAudience: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAudiences: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAudienceMembers: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=audienceController.d.ts.map