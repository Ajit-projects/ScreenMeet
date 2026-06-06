import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useUserRole = () => {

  const userData = useQuery(api.users.getCurrentUser);

  const isLoading = userData === undefined;

  return {
    isLoading,
    isInterviewer: userData?.role === "interviewer",
    isCandidate: userData?.role === "candidate",
    isPending: userData?.role === "pending",
  };
};