import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import { sql } from "../config/db";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);

  const userId = auth?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Not authorized authentication required" });
  }

  req.user = { id: userId };

  const userActivePlan = auth.has({ plan: "premium" }) ? "premium" : "free";

  const users = await sql`SELECT name,plan FROM users WHERE id = ${userId}`;
  const userPlan = users[0]?.plan;

  if (userActivePlan !== userPlan) {
    await sql`UPDATE users SET plan =${userActivePlan} WHERE id =${userId}`;
  }
  next();
};
