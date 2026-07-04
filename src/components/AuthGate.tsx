"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import RoleSelection from "./RoleSelection";
import LoaderUI from "./LoaderUI";

function AuthGate({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const currentUser = useQuery(api.users.getCurrentUser);

    const previousUserId = useRef<string>();

    useEffect(() => {
        if (!currentUser) return;

        if (
            previousUserId.current &&
            previousUserId.current !== currentUser.clerkId
        ) {
            router.refresh();
        }

        previousUserId.current = currentUser.clerkId;
    }, [currentUser?.clerkId, router]);

    return (
        <>
            <SignedIn>
                {currentUser === undefined ? (
                    <LoaderUI />
                ) : currentUser?.role === "pending" ? (
                    <RoleSelection />
                ) : (
                    children
                )}
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
        </>
    );
}
export default AuthGate;