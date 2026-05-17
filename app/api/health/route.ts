import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { isDbConfigured } from "@/lib/env/server";

export async function GET() {
  const payload: {
    status: string;
    service: string;
    timestamp: string;
    database?: string;
  } = {
    status: "ok",
    service: "atomquest-portal",
    timestamp: new Date().toISOString(),
  };

  if (!isDbConfigured()) {
    payload.database = "not_configured";
    return NextResponse.json(payload);
  }

  try {
    await connectDB();
    payload.database = "connected";
  } catch {
    payload.status = "degraded";
    payload.database = "error";
  }

  return NextResponse.json(payload, {
    status: payload.status === "ok" ? 200 : 503,
  });
}
