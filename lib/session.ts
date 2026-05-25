import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export interface SessionData {
  id: string;
  email: string;
  role: "ADMIN" | "STAFF";
}

const SECRET = process.env.SESSION_SECRET || "aptech-tracker-cah-secret-key-99887766";

// Generates signature for a given payload string
function signPayload(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function serializeSession(data: SessionData): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64");
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function deserializeSession(token: string): SessionData | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payload, signature] = parts;
    const expectedSignature = signPayload(payload);

    // Verify signature to prevent session tampering
    if (signature !== expectedSignature) {
      return null;
    }

    const json = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(json) as SessionData;
  } catch {
    return null;
  }
}

export async function getSession(req?: NextRequest): Promise<SessionData | null> {
  if (req) {
    const cookie = req.cookies.get("session");
    if (!cookie) return null;
    return deserializeSession(cookie.value);
  }

  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("session");
    if (!cookie) return null;
    return deserializeSession(cookie.value);
  } catch {
    return null;
  }
}
