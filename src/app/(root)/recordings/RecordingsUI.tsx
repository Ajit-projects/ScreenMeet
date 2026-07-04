"use client";

import RecordingSkeleton from "./RecordingSkeleton";
import RecordingCard from "@/components/RecordingCard";
import {
  ScrollArea,
  ScrollBar,
} from "@/components/ui/scroll-area";
import useValidatedRecordings from "@/hooks/useValidatedRecordings";

function RecordingsUI() {
  const {
    recordings,
    isLoading,
  } = useValidatedRecordings();

  return (
    <div className="container max-w-7xl mx-auto p-6">
      {/* HEADER */}
      <h1 className="text-3xl font-bold">
        Recordings
      </h1>

      <p className="text-muted-foreground my-1">
        {recordings.length}{" "}
        {recordings.length === 1
          ? "recording"
          : "recordings"}{" "}
        available
      </p>

      <ScrollArea className="h-[calc(100vh-12rem)] mt-3">
        <div className="pr-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
              {Array.from({
                length: 6,
              }).map((_, i) => (
                <RecordingSkeleton key={i} />
              ))}
            </div>
          ) : recordings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
              {recordings.map((recording) => (
                <RecordingCard
                  key={recording.url}
                  recording={recording}
                />
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