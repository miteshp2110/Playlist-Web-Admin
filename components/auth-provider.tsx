"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isAuthenticated } from "@/lib/api"

interface AuthContextType {
  isLoggedIn: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      setIsLoggedIn(authenticated)
      setIsLoading(false)

      // Redirect if not authenticated and trying to access protected routes
      if (!authenticated && pathname !== "/" && !pathname.includes("/_next")) {
        router.push("/")
      }

      // Redirect to dashboard if already logged in and on login page
      if (authenticated && pathname === "/") {
        router.push("/dashboard")
      }
    }

    checkAuth()
  }, [pathname, router])

  const logout = () => {
    localStorage.removeItem("authToken")
    setIsLoggedIn(false)
    router.push("/")
  }

  if (isLoading) {
    return null // Or a loading spinner
  }

  return <AuthContext.Provider value={{ isLoggedIn, logout }}>{children}</AuthContext.Provider>
}

