import type { Metadata } from "next";
import localFont from "next/font/local";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "./globals.css";
import ConvexClerkProvider from "@/components/providers/ConvexClerkProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "react-hot-toast";
import AuthGate from "@/components/AuthGate";

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
                  <AuthGate>{children}</AuthGate>
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