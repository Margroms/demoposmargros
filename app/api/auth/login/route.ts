import { NextRequest, NextResponse } from "next/server"

const DEMO_EMAIL = "demo@margros.in"
const DEMO_PASSWORD = "demo@123"
const SESSION_COOKIE_NAME = "admin_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate credentials
    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Create session token (simple but effective for demo)
    const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Create response
    const response = NextResponse.json(
      { success: true, message: "Login successful" },
      { status: 200 }
    )

    // Set secure HTTP-only cookie
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[login] error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

