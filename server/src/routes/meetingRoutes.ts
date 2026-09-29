import express from "express";
import { protect } from "../middleware/auth";
import {
  createMeeting,
  getMeeting,
  getMeetingStats,
  getSessionsDetails,
  getUserSessions,
} from "../controllers/meetingController";

const meetingRouter = express.Router();
meetingRouter.use(protect);

meetingRouter.post("/", createMeeting);
meetingRouter.get("/stats", getMeetingStats);
meetingRouter.get("/sessions", getUserSessions);
meetingRouter.get("/sessions/:id", getSessionsDetails);
meetingRouter.get("/:meetingId", getMeeting);

export default meetingRouter;
