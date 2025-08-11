"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { ThemeToggle } from "./theme-toggle"

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
]

export default function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"
          >
            TuitionTrack
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}

            <ThemeToggle />

            <SignedOut>
              <div className="flex items-center gap-2">
                <SignInButton>
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button size="sm">Get Started</Button>
                </SignUpButton>
              </div>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-border/40">
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-border/40">
              <SignedOut>
                <div className="flex flex-col gap-2">
                  <SignInButton>
                    <Button variant="ghost" size="sm" className="justify-start">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button size="sm" className="justify-start">
                      Get Started
                    </Button>
                  </SignUpButton>
                </div>
              </SignedOut>

              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
