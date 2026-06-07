"use client";

import InterviewerGuard from "@/components/InterviewerGuard";
import InterviewScheduleUI from "./InterviewScheduleUI";

function SchedulePage() {
  return (
    <InterviewerGuard>
      <InterviewScheduleUI />
    </InterviewerGuard>
  );
}
export default SchedulePage;