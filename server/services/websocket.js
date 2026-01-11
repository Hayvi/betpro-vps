import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const clients = new Map(); // userId -> Set of ws connections

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    let userId = null;

    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data);
        
        if (msg.type === 'auth') {
          const decoded = jwt.verify(msg.token, process.env.JWT_SECRET);
          
          // Check if user is still active
          const result = await query('SELECT is_active FROM profiles WHERE id = $1', [decoded.userId]);
          if (!result.rows[0] || !result.rows[0].is_active) {
            ws.send(JSON.stringify({ type: 'error', message: 'Account disabled' }));
            ws.close();
            return;
          }
          
          userId = decoded.userId;
          
          if (!clients.has(userId)) clients.set(userId, new Set());
          clients.get(userId).add(ws);
          
          ws.send(JSON.stringify({ type: 'auth_ok' }));
        }
        
        if (msg.type === 'presence' && userId) {
          // Handle presence heartbeat
          ws.send(JSON.stringify({ type: 'presence_ack' }));
        }
      } catch {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message' }));
      }
    });

    ws.on('close', () => {
      if (userId && clients.has(userId)) {
        clients.get(userId).delete(ws);
        if (clients.get(userId).size === 0) clients.delete(userId);
      }
    });
  });

  return wss;
}

export function broadcast(userId, message) {
  const userClients = clients.get(userId);
  if (userClients) {
    const data = JSON.stringify(message);
    userClients.forEach((ws) => {
      if (ws.readyState === 1) ws.send(data);
    });
  }
}

export function broadcastAll(message) {
  const data = JSON.stringify(message);
  clients.forEach((userClients) => {
    userClients.forEach((ws) => {
      if (ws.readyState === 1) ws.send(data);
    });
  });
}
