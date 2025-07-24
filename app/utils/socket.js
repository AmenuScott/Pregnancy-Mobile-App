import { io } from "socket.io-client";

// ✅ Production-safe setup
const socket = io("https://pregwell-backend.onrender.com", {
  transports: ["websocket"], // ensures long-lived socket
  autoConnect: true,         // connect on import
  reconnection: true,        // try to reconnect on disconnect
});

export default socket;
