import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { setupWebSocket } from './services/websocket.js';
import { pool } from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import betRoutes from './routes/bets.js';
import withdrawalRoutes from './routes/withdrawals.js';
import presenceRoutes from './routes/presence.js';
import rbacRoutes from './routes/rbac.js';
import walletRoutes from './routes/wallet.js';
import geoipRoutes from './routes/geoip.js';

const app = express();
const server = createServer(app);

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/presence', presenceRoutes);
app.use('/api/rbac', rbacRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/geoip', geoipRoutes);

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// WebSocket
const wss = setupWebSocket(server);
app.set('wss', wss);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
