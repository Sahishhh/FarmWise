import dotenv from "dotenv";
import http from "http";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { initializeSocket } from "./controllers/message.controller.js"; // Import Socket.IO setup

// Load environment variables
dotenv.config({
    path: './.env'
});

// Create HTTP server for Socket.IO support
const server = http.createServer(app);

connectDB()
    .then(() => {
        // Initialize Socket.IO
        initializeSocket(server);

        // Start the server
        const PORT = process.env.PORT || 8000;
        server.listen(PORT, () => {
            console.log(`Server is running at port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed", err);
    });
