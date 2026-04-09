import type { Metadata } from "next";
import localFont from "next/font/local";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "./globals.css";
import {SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import ConvexClerkProvider from "@/components/providers/ConvexClerkProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "react-hot-toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ScreenMeet",
  description: "Online interview platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative min-h-screen flex flex-col">
              {/* background glow */}
              <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/2 top-[-200px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="absolute left-[20%] top-[100px] h-[400px] w-[400px] rounded-full bg-emerald-400/10 blur-3xl" />

                <div className="absolute right-[10%] top-[200px] h-[350px] w-[350px] rounded-full bg-teal-400/10 blur-3xl" />
              </div>

              <Navbar />
                <main className="flex-1 px-4 sm:px-6 lg:px-8">
                  <SignedIn>
                    {children}
                  </SignedIn>

                <SignedOut>
                  <div className="flex items-center justify-center h-[60vh] fade-in">

                    <div className="flex flex-col items-center text-center space-y-4 max-w-md w-full border border-border/50 bg-background/60 
                    backdrop-blur-sm rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <h2 className="text-2xl font-semibold tracking-tight">
                        Welcome to ScreenMeet
                      </h2>

                      <p className="text-muted-foreground max-w-sm">
                        Please sign in to start hosting or joining interview sessions.
                      </p>

                      <SignInButton mode="modal">
                        <button className="px-6 py-2 rounded-md bg-primary text-white hover:opacity-90 transition hover:scale-[1.02] duration-200">
                          Sign In to Continue
                        </button>
                      </SignInButton>

                    </div>

                  </div>
                </SignedOut>
                </main>
              <Footer/>
            </div>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ConvexClerkProvider>
  );
}