"use client";

import Link from "next/link";
import { ModeToggle } from "./ModeToggle"
import { Video } from "lucide-react";
import { SignedIn, UserButton, SignedOut } from "@clerk/nextjs";
import DasboardBtn from "./DashboardBtn";
import LoginButton from "./LoginButton";

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 mx-auto w-full">
        {/* LEFT SIDE -LOGO */}
        <Link
          href="/"
          className="group flex items-center gap-2 font-semibold text-2xl mr-6 font-mono hover:opacity-80 transition"
        >
          <Video className="size-8 text-emerald-500 transition-transform duration-200 group-hover:rotate-6" />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            ScreenMeet
          </span>
        </Link>

        {/* RIGHT SIDE - ACTIONS */}
        <SignedIn>
          <div className="flex items-center space-x-4 ml-auto">
            <DasboardBtn />
            <ModeToggle />
            <UserButton />
          </div>
        </SignedIn>

        <SignedOut>
          <div className="ml-auto">
            <LoginButton />
          </div>
        </SignedOut>
      </div>
    </nav>
  );
}

export default Navbar;