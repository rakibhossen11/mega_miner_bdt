import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Run a native PostgreSQL system query to get current server timestamp
    const result = await query("SELECT NOW(), current_database(), current_user");
    
    // Extract metadata from response
    const serverTime = result.rows[0].now;
    const databaseName = result.rows[0].current_database;
    const databaseUser = result.rows[0].current_user;

    return NextResponse.json({
      success: true,
      message: "🚀 DATABASE CONNECTION SUCCESSFUL!",
      diagnostics: {
        connected_to: databaseName,
        authenticated_as: databaseUser,
        postgres_server_time: serverTime,
        pool_status: "HEALTHY & ACTIVE"
      }
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Database Connection Test Failed:", error);
    
    return NextResponse.json({
      success: false,
      error: "DATABASE CONNECTION FAILED",
      reason: error.message,
      troubleshooting: [
        "1. Check if your pgAdmin / PostgreSQL server is running locally.",
        "2. Verify your credentials in the .env.local file.",
        "3. Ensure the database name configured actually exists in pgAdmin.",
        "4. Verify the default PostgreSQL port (usually 5432)."
      ]
    }, { status: 500 });
  }
}