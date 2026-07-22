import bcrypt from 'bcrypt';
import prisma from '../db/prisma.js';
import jwt from 'jsonwebtoken';
const signup = async (req, res) => {
    const { accountName, email, password } = req.body;
    try {
        if (!accountName || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const account = await prisma.account.create({
            data: { name: accountName }
        });
        const user = await prisma.user.create({
            data: { accountId: account.id, email, passwordHash }
        });
        const token = jwt.sign({ userId: user.id, accountId: account.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user.id, email: user.email, accountId: account.id } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export default signup;
//# sourceMappingURL=signupController.js.map