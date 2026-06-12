import { clsx, type ClassValue } from "clsx";
import { addMinutes, intervalToDuration, isBefore, isWithinInterval } from "date-fns";
import { twMerge } from "tailwind-merge";
import { Doc } from "../../convex/_generated/dataModel";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Interview = Doc<"interviews">;
type User = Doc<"users">;

export const groupInterviews = (
  interviews: Interview[],
  currentTime:number
) => {
  return interviews.reduce<Record<string, Interview[]>>(
  (acc, interview) => {
    const status = getMeetingStatus(
      interview,
      currentTime
    );

    acc[status] = [
      ...(acc[status] || []),
      interview,
    ];

    return acc;
  }, {});
};

export const getCandidateInfo = (users: User[], candidateId: string) => {
  const candidate = users?.find((user) => user.clerkId === candidateId);
  return {
    name: candidate?.name || "Unknown Candidate",
    image: candidate?.image || "",
    initials:
      candidate?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("") || "UC",
  };
};

export const getInterviewerInfo = (users: User[], interviewerId: string) => {
  const interviewer = users?.find((user) => user.clerkId === interviewerId);
  return {
    name: interviewer?.name || "Unknown Interviewer",
    image: interviewer?.image,
    initials:
      interviewer?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("") || "UI",
  };
};

export const calculateRecordingDuration = (startTime: string, endTime: string) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const duration = intervalToDuration({ start, end });

  if (duration.hours && duration.hours > 0) {
    return `${duration.hours}:${String(duration.minutes).padStart(2, "0")}:${String(
      duration.seconds
    ).padStart(2, "0")}`;
  }

  if (duration.minutes && duration.minutes > 0) {
    return `${duration.minutes}:${String(duration.seconds).padStart(2, "0")}`;
  }

  return `${duration.seconds} seconds`;
};

export const getMeetingStatus = (
  interview: Interview,
  currentTime: number
) => {
  const now = new Date(currentTime);

  const startTime = new Date(interview.startTime);

  const endTime = addMinutes(
    startTime,
    interview.expectedDuration
  );

  switch (interview.status) {
    case "cancelled":
      return "cancelled";

    case "succeeded":
      return "succeeded";

    case "failed":
      return "failed";

    case "completed":
      return "completed";

    default:
      if (
        isWithinInterval(now, {
          start: startTime,
          end: endTime,
        })
      ) {
        return "live";
      }

      if (isBefore(now, startTime)) {
        return "upcoming";
      }

      return "missed";
  }
};

export const createMeetingDate = (
  date: Date,
  time: string
) => {
  const [hours, minutes] = time.split(":");

  const meetingDate = new Date(date);

  meetingDate.setHours(
    parseInt(hours),
    parseInt(minutes),
    0,
    0
  );

  return meetingDate;
};