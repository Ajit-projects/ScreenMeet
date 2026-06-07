"use client";

import InterviewerGuard from "@/components/InterviewerGuard";
import DashboardUI from "./DashboardUI";

export default function DashboardPage() {
  return (
    <InterviewerGuard>
      <DashboardUI />
    </InterviewerGuard>
  );
}