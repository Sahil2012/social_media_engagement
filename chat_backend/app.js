import express from "express";
import { WebSocketServer } from 'ws'; 
import dotenv from "dotenv";
import { handleWebSocketMessage } from "./wsHandler.js"; 
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const connections = new Map();

// HTTP server
app.get("/", (req, res) => res.send("WebSocket + Langflow Server is running!"));

// WebSocket Server
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const wss = new WebSocketServer({ server });

// WebSocket connection handling
wss.on("connection", (ws,req) => {
  console.log("New WebSocket connection");

  const ip = req.socket.remoteAddress;

    // rate limitting for DDOS
    if (!connections.has(ip)) {
        connections.set(ip, { count: 1, timestamp: Date.now() });
    } else {
        const conn = connections.get(ip);
        if (conn.count >= 5 && Date.now() - conn.timestamp < 60000) {
            ws.close(1008, 'Too many connections');
            return;
        }
        conn.count++;
    }

    ws.on("message", (message) => handleWebSocketMessage(ws, message));

    ws.on('close', () => {
        const conn = connections.get(ip);
        conn.count--;
        if (conn.count === 0) {
            connections.delete(ip);
        }
        console.log("WebSocket connection closed");
        
    });
});
