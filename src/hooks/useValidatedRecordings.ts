"use client";

import { useQuery } from "@tanstack/react-query";
import { CallRecording } from "@stream-io/video-react-sdk";
import useGetCalls from "./useGetCalls";

export default function useValidatedRecordings() {
  const { calls, isLoading: isLoadingCalls } = useGetCalls();

  const {
    data: recordings = [],
    isLoading: isLoadingRecordings,
  } = useQuery({
    queryKey: [
      "validated-recordings",
      calls?.map((c) => c.cid).join(","),
    ],

    enabled: !!calls,

    staleTime: 10 * 60 * 1000,

    gcTime: 15 * 60 * 1000,

    queryFn: async () => {
      if (!calls?.length) return [];

      const recordingResults = await Promise.all(
        calls.map((call) => call.listRecordings())
      );

      const allRecordings = recordingResults.flatMap(
        (result) => result.recordings
      );

      const validated = await Promise.all(
        allRecordings.map(async (recording) => {
          try {
            const response = await fetch(recording.url, {
              method: "HEAD",
            });

            return response.ok ? recording : null;
          } catch {
            return null;
          }
        })
      );

      return validated.filter(
        (recording): recording is CallRecording =>
          recording !== null
      );
    },
  });

  return {
    recordings,
    isLoading:
      isLoadingCalls || isLoadingRecordings,
  };
}