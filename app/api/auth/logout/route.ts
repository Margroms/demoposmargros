import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE_NAME = "admin_session"

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { success: true, message: "Logout successful" },
    { status: 200 }
  )

  // Clear the session cookie
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })

  return response
}

