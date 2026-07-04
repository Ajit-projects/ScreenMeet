import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export const useUserRole = () => {
  const { isLoaded } = useUser();

  const userData = useQuery(
    api.users.getCurrentUser,
    isLoaded ? {} : "skip"
  );

  const isLoading = !isLoaded || userData === undefined;

  return {
    isLoading,
    isInterviewer: userData?.role === "interviewer",
    isCandidate: userData?.role === "candidate",
    isPending: userData?.role === "pending",
  };
};