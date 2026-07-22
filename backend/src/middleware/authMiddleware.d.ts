import { Request, Response, NextFunction } from "express";
export interface AuthRequest extends Request {
    accountId?: number;
    userId?: number;
}
declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export default authMiddleware;
//# sourceMappingURL=authMiddleware.d.ts.map