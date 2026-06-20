"use client";

import RecordingSkeleton from "./RecordingSkeleton";
import RecordingCard from "@/components/RecordingCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import useGetCalls from "@/hooks/useGetCalls"
import { CallRecording } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";

function RecordingsUI() {
  const { calls, isLoading } = useGetCalls();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [isFetchingRecordings, setIsFetchingRecordings] = useState(true);

  const validateRecording = async (
    recording: CallRecording
  ) => {
    try {
      const response = await fetch(
        recording.url,
        {
          method: "HEAD",
        }
      );

      return response.ok;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const fetchRecordings = async () => {
      if (!calls) return;
      setIsFetchingRecordings(true);
      try {
        // Get recordings for each call
        const callData = await Promise.all(calls.map((call) => call.listRecordings()));
        const allRecordings = callData.flatMap((call) => call.recordings);

        const validRecordings = await Promise.all(
          allRecordings.map(async (recording) => {
            const isValid = await validateRecording(recording);

            return isValid ? recording : null;
          })
        );

        setRecordings(
          validRecordings.filter(
            (recording): recording is CallRecording =>
              recording !== null
          )
        );

      } catch (error) {
        console.log("Error fetching recordings:", error);
      } finally {
        setIsFetchingRecordings(false);
      }
    };

    fetchRecordings();
  }, [calls]);

  return (
    <div className="container max-w-7xl mx-auto p-6">
      {/* HEADER SECTION */}
      <h1 className="text-3xl font-bold">Recordings</h1>
      <p className="text-muted-foreground my-1">
        {recordings.length} {recordings.length === 1 ? "recording" : "recordings"} available
      </p>

      {/* RECORDINGS GRID */}

      <ScrollArea className="h-[calc(100vh-12rem)] mt-3">
        <div className="pr-4">
          {(isLoading || isFetchingRecordings) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <RecordingSkeleton key={i} />
              ))}
            </div>
          ) : recordings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
              {recordings.map((r) => (
                <RecordingCard key={r.end_time} recording={r} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
              <p className="text-xl font-medium text-muted-foreground">
                No recordings available
              </p>
            </div>
          )}
        </div>

        <ScrollBar
          orientation="vertical"
          className="bg-muted/10 hover:bg-muted/90 transition-colors"
        />
      </ScrollArea>
    </div>
  );
}
export default RecordingsUI;