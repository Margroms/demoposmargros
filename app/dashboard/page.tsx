import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const SESSION_COOKIE_NAME = "admin_session"

export default async function DashboardPage() {
  // Check for admin session cookie
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  // If no session, redirect to login
  if (!sessionCookie || !sessionCookie.value) {
    redirect("/")
  }

  // Redirect to admin dashboard (since only admin can login with demo credentials)
  redirect("/dashboard/admin")
}

