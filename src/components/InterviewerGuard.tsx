"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";

export default function InterviewerGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isInterviewer, isLoading } = useUserRole();

    useEffect(() => {
        if (!isLoading && !isInterviewer) {
            router.replace("/");
        }
    }, [isLoading, isInterviewer, router]);

    if (isLoading) return null;

    if (!isInterviewer) return null;

    return <>{children}</>;
}