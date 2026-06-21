"use client";

import ActionCard from "@/components/ActionCard";
import { QUICK_ACTIONS } from "@/constants";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "convex/react";
import { useState, useEffect, useMemo } from "react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import MeetingModal from "@/components/MeetingModal";
import LoaderUI from "@/components/LoaderUI";
import MeetingCard from "@/components/MeetingCard";
import useCurrentTime from "@/hooks/useCurrentTime";
import InterviewCardSkeleton from "../schedule/InterviewCardSkeleton";
import CandidateInterviewFilters, { CandidateFilter } from "@/components/CandidateInterviewFilters";
import { getMeetingStatus } from "@/lib/utils";

export default function Home() {
  const router = useRouter();

  const { isInterviewer, isLoading } = useUserRole();
  const interviews = useQuery(api.interviews.getMyInterviews);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"start" | "join">();
  const currentTime = useCurrentTime();
  const [filter, setFilter] = useState<CandidateFilter>("all");

  useEffect(() => {
    if (isInterviewer) {
      router.prefetch("/schedule");
    }
  }, [router, isInterviewer]);

  const handleQuickAction = (title: string) => {
    switch (title) {
      case "New Call":
        setModalType("start");
        setShowModal(true);
        break;
      case "Join Interview":
        setModalType("join");
        setShowModal(true);
        break;
      default:
        router.push(`/${title.toLowerCase()}`);
    }
  };

  const interviewStats = useMemo(() => {
    if (!interviews) {
      return {
        all: 0,
        upcoming: 0,
        live: 0,
        completed: 0,
        succeeded: 0,
        failed: 0,
        missed: 0,
        cancelled: 0
      };
    }

    return {
      all: interviews.length,

      upcoming: interviews.filter(
        (i) =>
          getMeetingStatus(i, currentTime) ===
          "upcoming"
      ).length,

      live: interviews.filter(
        (i) =>
          getMeetingStatus(i, currentTime) ===
          "live"
      ).length,

      completed: interviews.filter(
        (i) =>
          getMeetingStatus(i, currentTime) ===
          "completed"
      ).length,

      succeeded: interviews.filter(
        (i) =>
          getMeetingStatus(i, currentTime) ===
          "succeeded"
      ).length,

      failed: interviews.filter(
        (i) =>
          getMeetingStatus(i, currentTime) ===
          "failed"
      ).length,

      missed: interviews.filter(
        (i) =>
          getMeetingStatus(i, currentTime) ===
          "missed"
      ).length,

      cancelled: interviews.filter(
        (i) =>
          getMeetingStatus(i, currentTime) ===
          "cancelled"
      ).length,
    };
  }, [interviews, currentTime]);

  const filteredInterviews = useMemo(() => {
    if (!interviews) return [];

    return interviews.filter((interview) => {
      if (filter === "all") {
        return true;
      }

      return (
        getMeetingStatus(
          interview,
          currentTime
        ) === filter
      );
    });
  }, [
    interviews,
    filter,
    currentTime,
  ]);

  const emptyMessages: Record<
    CandidateFilter,
    string
  > = {
    all: "You have no interviews at the moment.",
    upcoming: "No upcoming interviews found.",
    live: "No live interviews right now.",
    completed:
      "No interviews awaiting feedback.",
    succeeded:
      "No passed interviews yet.",
    failed:
      "No failed interviews.",
    missed:
      "No missed interviews.",
    cancelled:
      "No cancelled interviews.",
  };

  if (isLoading) return <LoaderUI />;

  return (
    <div className="container max-w-7xl mx-auto p-6">
      {/* WELCOME SECTION */}
      <div className="rounded-lg bg-card p-6 border shadow-sm mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
          Welcome back!
        </h1>
        <p className="text-muted-foreground mt-2">
          {isInterviewer
            ? "Manage your interviews and review candidates effectively"
            : "Access your upcoming interviews and preparations"}
        </p>
      </div>

      {isInterviewer ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {QUICK_ACTIONS.map((action) => (
              <ActionCard
                key={action.title}
                action={action}
                onClick={() => handleQuickAction(action.title)}
              />
            ))}
          </div>

          <MeetingModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={modalType === "join" ? "Join Meeting" : "Start Meeting"}
            isJoinMeeting={modalType === "join"}
          />
        </>
      ) : (
        <>
          <div>
            <h1 className="text-3xl font-bold">
              Your Interviews
            </h1>

            <p className="text-muted-foreground mt-1">
              View and join your scheduled interviews
            </p>

            <CandidateInterviewFilters
              activeFilter={filter}
              onFilterChange={setFilter}
              counts={interviewStats}
            />
          </div>

          <div className="mt-8">
            {interviews === undefined ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <InterviewCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredInterviews.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredInterviews.map((interview) => (
                  <MeetingCard
                    key={interview._id}
                    interview={interview}
                    currentTime={currentTime}
                    hasFeedback={!!interview.hasFeedback}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="mt-2 text-sm text-muted-foreground">
                  {emptyMessages[filter]}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}