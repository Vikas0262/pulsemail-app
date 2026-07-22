import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import './workers/campaignWorker.js';
import { handleResendWebhook } from './controllers/webhookController.js';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import audienceRoutes from './routes/audienceRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const corsOptions = {
  origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(express.json());
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/audiences', audienceRoutes);
app.use('/api/campaigns', campaignRoutes);
app.post('/api/webhooks/resend', handleResendWebhook);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});