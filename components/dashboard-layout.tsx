"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboardIcon,
  GlobeIcon,
  TagIcon,
  UsersIcon,
  FileAudioIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import Image from "next/image"

interface NavItemProps {
  href: string
  icon: React.ReactNode
  title: string
  isActive: boolean
  onClick?: () => void
}

function NavItem({ href, icon, title, isActive, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        isActive ? "bg-accent text-white" : "text-inactive-grey hover:bg-primary-light hover:text-accent",
      )}
      onClick={onClick}
    >
      {icon}
      {title}
    </Link>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth()
  const pathname = usePathname()
  const isMobile = useMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  const navItems = [
    { href: "/dashboard", icon: <LayoutDashboardIcon className="h-4 w-4" />, title: "Dashboard" },
    { href: "/dashboard/languages", icon: <GlobeIcon className="h-4 w-4" />, title: "Languages" },
    { href: "/dashboard/genres", icon: <TagIcon className="h-4 w-4" />, title: "Genres" },
    { href: "/dashboard/artists", icon: <UsersIcon className="h-4 w-4" />, title: "Artists" },
    { href: "/dashboard/songs", icon: <FileAudioIcon className="h-4 w-4" />, title: "Songs" },
  ]

  return (
    <div className="dashboard-layout">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4 sm:static md:hidden">
        <Button variant="outline" size="icon" onClick={toggleSidebar} className="md:hidden">
          <MenuIcon className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <Image src="/images/logo.png" alt="Playlist Logo" width={24} height={24} className="object-contain" />
          </div>
          <span className="font-semibold text-accent">Playlist Admin</span>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Sidebar for mobile (overlay) */}
        {isMobile && (
          <div
            className={cn(
              "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-all duration-200",
              sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white transition-transform md:static md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-14 items-center border-b px-4">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <Image src="/images/logo.png" alt="Playlist Logo" width={24} height={24} className="object-contain" />
              </div>
              <span className="font-semibold text-accent">Playlist Admin</span>
            </div>
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={closeSidebar} className="ml-auto md:hidden">
                <XIcon className="h-5 w-5" />
                <span className="sr-only">Close Menu</span>
              </Button>
            )}
          </div>
          <nav className="flex-1 overflow-auto p-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  title={item.title}
                  isActive={pathname === item.href}
                  onClick={isMobile ? closeSidebar : undefined}
                />
              ))}
            </div>
          </nav>
          <div className="border-t p-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-primary-light text-inactive-grey hover:bg-primary-light hover:text-accent"
              onClick={logout}
            >
              <LogOutIcon className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="dashboard-content p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

