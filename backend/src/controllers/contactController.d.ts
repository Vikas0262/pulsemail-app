import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
declare const createContact: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const getContacts: (req: AuthRequest, res: Response) => Promise<void>;
declare const updateContact: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const deleteContact: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export { createContact, getContacts, updateContact, deleteContact };
//# sourceMappingURL=contactController.d.ts.map