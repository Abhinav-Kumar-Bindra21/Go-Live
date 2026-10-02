import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initDb } from "./config/db";
import http from "http";
import { clerkMiddleware } from "@clerk/express";
import { handleClerkWebhook } from "./controllers/webhookController";
import meetingRouter from "./routes/meetingRoutes";
import { Server } from "socket.io";
import { setupSocketIO } from "./socket";

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

const allowedOrigins = process.env.ORIGINS?.split(",");
app.use(cors({ origin: "", credentials: true }));
app.use(cookieParser());

app.use("/api/clerk", express.raw({ type: "application/json" }), handleClerkWebhook);
app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/meetings", meetingRouter);

const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

setupSocketIO(io);

// Centralized Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.log(`[Error] ${err.message}`);
  res.status(500).json({ error: "Internal server error" });
});

const startServer = async () => {
  try {
    // Connect to Neon & Initialize Tables
    await initDb();

    server.listen(PORT, () => {
      console.log("Server Started");
    });
  } catch (error: any) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
