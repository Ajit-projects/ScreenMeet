"use client";

import { useMemo } from "react";

import MeetingCard from "@/components/MeetingCard";
import InterviewCardSkeleton from "./InterviewCardSkeleton";
import useCurrentTime from "@/hooks/useCurrentTime";
import { getMeetingStatus } from "@/lib/utils";

interface InterviewGridProps {
    interviews: any[] | undefined;
    users: any[] | undefined;
    searchQuery: string;
    currentUserId?: string;
    onEdit: (interview: any) => void;
    onCancel: (id: any) => void;
}

export default function InterviewGrid({
    interviews,
    users,
    searchQuery,
    currentUserId,
    onEdit,
    onCancel,
}: InterviewGridProps) {
    const currentTime = useCurrentTime();

    const usersMap = useMemo(() => {
        return new Map(
            (users ?? []).map((user) => [user.clerkId, user])
        );
    }, [users]);

    const activeInterviews = useMemo(() => {
        if (!interviews || !users) return [];

        const query = searchQuery.trim().toLowerCase();

        return interviews.filter((interview) => {
            const status = getMeetingStatus(interview, currentTime);

            if (status !== "upcoming" && status !== "live") {
                return false;
            }

            if (!query) return true;

            const candidate = usersMap.get(interview.candidateId);

            const candidateName =
                candidate?.name?.toLowerCase() ?? "";

            return (
                candidateName.includes(query) ||
                interview.title.toLowerCase().includes(query)
            );
        });
    }, [
        interviews,
        users,
        usersMap,
        currentTime,
        searchQuery,
    ]);

    if (interviews === undefined) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <InterviewCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (activeInterviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="mt-2 text-sm text-muted-foreground">
                    {searchQuery
                        ? "No interviews match your search."
                        : "No upcoming interviews scheduled ... "}
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeInterviews.map((interview) => (
                <MeetingCard
                    key={interview._id}
                    interview={interview}
                    currentTime={currentTime}
                    canManage={interview.createdBy === currentUserId}
                    onEdit={() => onEdit(interview)}
                    onCancel={() => onCancel(interview._id)}
                />
            ))}
        </div>
    );
}