import { Request, Response } from "express";
import { sql } from "../config/db";

const generateMeetingId = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const segment = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

  return `${segment(3)}-${segment(3)}-${segment(3)}`;
};

// Create Meeting
export const createMeeting = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const userId = req.user?.id;

    // fetch user details & plan
    const users = await sql`SELECT name,plan FROM users WHERE id =${userId}`;
    const userPlan = users[0]?.plan || "free";

    // check meeting limit per calendar month
    if (userPlan === "free") {
      const monthlyCountResult =
        await sql`SELECT COUNT(*) as count FROM meetings WHERE host_id = ${userId} AND created_at >= date_trunc("month", NOW())`;

      const monthyCount = parseInt(monthlyCountResult[0]?.count || "0");

      if (monthyCount >= 30) {
        return res.status(403).json({
          error:
            "Monthly limit reached. Free plan includes 30 meeting per month. Please upgrade to Premium for unlimited meetings!",
          limitReached: true,
          monthyCount,
          limit: 30,
        });
      }
    }

    let meetingId = generateMeetingId();

    // Ensure unique ID
    let existing = await sql`SELECT id FROM meetings WHERE meeting_id = ${meetingId}`;
    while (existing.length > 0) {
      meetingId = generateMeetingId();
      existing = await sql`SELECT id FROM meetings WHERE meeting_id = ${meetingId}`;
    }

    const [meeting] =
      await sql`INSERT INTO meetings(meeting_id,title,host_id,status) VALUES (${meetingId},${title || "Instant Meeting"},${userId} , active) RETURNING id,meeting_id,title,host_id,status,created_at`;

    const hostName = users[0]?.name || "Host";

    // Insert host into participants
    await sql`INSERT INTO meeting_participants (meeting_id,user_id,name) VALUES (${meeting.id},${userId},${hostName})`;

    res.status(201).json({
      success: true,
      meeting: {
        id: meeting.id,
        meetingId: meeting.meeting_id,
        title: meeting.title,
        host: meeting.host_id,
        status: meeting.status,
        createdAt: meeting.created_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// get meeting by id
export const getMeeting = async (req: Request, res: Response) => {};

// get all user's meeting sessions
export const getUserSessions = async (req: Request, res: Response) => {};

// get meeting sessions details by id
export const getSessionsDetails = async (req: Request, res: Response) => {};

// get plan & meeting statistics for user dashboard
export const getMeetingStats = async (req: Request, res: Response) => {};
