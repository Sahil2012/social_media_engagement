import express from "express";
import { WebSocketServer } from 'ws'; 
import dotenv from "dotenv";
import { handleWebSocketMessage } from "./wsHandler.js"; 
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// HTTP server
app.get("/", (req, res) => res.send("WebSocket + Langflow Server is running!"));

// WebSocket Server
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const wss = new WebSocketServer({ server });

// WebSocket connection handling
wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  ws.on("message", (message) => handleWebSocketMessage(ws, message));

  ws.on("close", () => console.log("WebSocket connection closed"));
});
