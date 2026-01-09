const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';

let ws = null;
let token = null;
const listeners = new Map();

export function connectWs(authToken) {
  token = authToken;
  if (ws) ws.close();
  
  ws = new WebSocket(WS_URL);
  
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'auth', token }));
  };
  
  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      const handlers = listeners.get(msg.type);
      if (handlers) handlers.forEach((fn) => fn(msg));
    } catch {}
  };
  
  ws.onclose = () => {
    // Reconnect after 3s if we have a token
    if (token) setTimeout(() => connectWs(token), 3000);
  };
}

export function disconnectWs() {
  token = null;
  if (ws) {
    ws.close();
    ws = null;
  }
}

export function onWsMessage(type, callback) {
  if (!listeners.has(type)) listeners.set(type, new Set());
  listeners.get(type).add(callback);
  return () => listeners.get(type).delete(callback);
}

export function sendWs(message) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}
