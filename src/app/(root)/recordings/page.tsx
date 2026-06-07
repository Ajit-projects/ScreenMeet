"use client";

import InterviewerGuard from "@/components/InterviewerGuard";
import RecordingsUI from "./RecordingsUI";

export default function RecordingsPage() {
  return (
    <InterviewerGuard>
      <RecordingsUI />
    </InterviewerGuard>
  );
}