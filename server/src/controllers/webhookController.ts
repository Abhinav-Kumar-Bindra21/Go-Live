import { verifyWebhook } from "@clerk/express/webhooks";
import { Request, Response } from "express";
import { sql } from "../config/db";

export const handleClerkWebhook = async (req: Request, res: Response) => {
  try {
    const evt = await verifyWebhook(req);

    const eventType = evt.type;
    const data = evt.data;

    switch (eventType) {
      case "user.created": {
        const userId = data.id;
        const primaryEmail = data.email_addresses?.[0].email_address || "";
        const name = `${data.first_name || "User"} ${data.last_name}`;
        const image = data.image_url || "";
        const plan = "free";

        await sql`
        INSERT INTO users(id,name,email,image,plan)
        VALUES (${userId},${name},${primaryEmail},${image},${plan})
        ON CONFLICT (email) DO UPDATE SET
        id=EXCLUDED.id,
        name=EXCLUDED.name,
        image=EXCLUDED.image,
        plan=EXCLUDED.plan,
        updated_at= NOW()
        `;

        break;
      }

      case "user.updated": {
        const userId = data.id;
        const primaryEmail = data.email_addresses?.[0].email_address || "";
        const name = `${data.first_name || "User"} ${data.last_name}`;
        const image = data.image_url || "";

        await sql`
        INSERT INTO users(id,name,email,image)
        VALUES (${userId},${name},${primaryEmail},${image})
        ON CONFLICT (email) DO UPDATE SET
        id=EXCLUDED.id,
        name=EXCLUDED.name,
        image=EXCLUDED.image,
        updated_at= NOW()
        `;

        break;
      }

      case "user.deleted": {
        const userId = data.id;

        if (userId) {
          await sql`DELETE FROM users WHERE id = ${userId}`;
        }
        break;
      }

      default:
        console.log(`Unhandle Clerk webhook event type:${eventType}`);
    }

    return res.status(200).json({ success: true, eventType });
  } catch (error: any) {
    console.log("Error verifying Clerk webhook:", error.message || error);
    return res.status(400).json({ error: "webhook verification failed:" + (error.message || error) });
  }
};
