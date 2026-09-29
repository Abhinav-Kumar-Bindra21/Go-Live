import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initDb } from "./config/db";
import { clerkMiddleware } from "@clerk/express";
import { handleClerkWebhook } from "./controllers/webhookController";
import meetingRouter from "./routes/meetingRoutes";

const app = express();

const PORT = process.env.PORT || 3000;

const allowedOrigins = process.env.ORIGINS?.split(",");
app.use(cors({ origin: "", credentials: true }));
app.use(cookieParser());

app.use("/api/clerk", express.raw({ type: "application/json" }), handleClerkWebhook);
app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/meetings", meetingRouter);

const startServer = async () => {
  try {
    // Connect to Neon & Initialize Tables
    await initDb();

    app.listen(PORT, () => {
      console.log("Server Started");
    });
  } catch (error: any) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
