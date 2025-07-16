import { io } from "socket.io-client";

const socket = io("https://pregwell-backend.onrender.com"); // Use your actual backend IP + port
export default socket;
