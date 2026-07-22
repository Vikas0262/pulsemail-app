import express from 'express';
import dotenv from 'dotenv';
import prisma from './db/prisma.js';
import cors from 'cors';
dotenv.config();
const PORT = process.env.PORT || 5000;
import './workers/campaignWorker.js';
import authRoutes from './routes/authRoutes.js';
// import authMiddleware, { AuthRequest } from './middleware/authMiddleware.js';
import contactRoutes from './routes/contactRoutes.js';
import audienceRoutes from './routes/audienceRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';


const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/audiences', audienceRoutes);  
app.use('/api/campaigns', campaignRoutes);

// app.get("/health",(req,res)=>{
//     res.status(200).send("Server is healthy");
// });
// app.get('/api/test-protected', authMiddleware, (req: AuthRequest, res) => {
//   res.json({ message: 'You are authenticated!', accountId: req.accountId, userId: req.userId });
// });

app.get('/test-db', async (req, res) => {
  const accounts = await prisma.account.findMany();
  res.json({ accounts });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 