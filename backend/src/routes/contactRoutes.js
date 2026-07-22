import { Router } from 'express';
import multer from 'multer';
import authMiddleware from '../middleware/authMiddleware.js';
import { createContact, getContacts, updateContact, deleteContact, } from '../controllers/contactController.js';
import { importContacts } from '../controllers/contactImportController.js';
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
router.post('/', authMiddleware, createContact);
router.post('/import', authMiddleware, (req, _res, next) => {
    //   console.log('[contacts/import] auth passed, starting multer upload.single(file)');
    next();
}, upload.single('file'), (req, _res, next) => {
    // console.log('[contacts/import] multer finished; req.file present:', Boolean(req.file));
    next();
}, importContacts);
router.get('/', authMiddleware, getContacts);
router.put('/:id', authMiddleware, updateContact);
router.delete('/:id', authMiddleware, deleteContact);
export default router;
//# sourceMappingURL=contactRoutes.js.map