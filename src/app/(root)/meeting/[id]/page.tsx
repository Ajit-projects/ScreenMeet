"use client";

import { Loader2Icon } from "lucide-react";
import MeetingRoom from "@/components/MeetingRoom";
import MeetingSetup from "@/components/MeetingSetup";
import useGetCallById from "@/hooks/useGetCallById";
import { useUser } from "@clerk/nextjs";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useParams } from "next/navigation";
import { useState } from "react";

function MeetingPage() {
  const { id } = useParams<{ id: string }>();
  const { isLoaded } = useUser();
  const { call, isCallLoading } = useGetCallById(id);

  const [isSetupComplete, setIsSetupComplete] = useState(false);

  if (!isLoaded || isCallLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2Icon className="h-8 w-8 animate-spin" />

        <div className="text-center">
          <h2 className="text-xl font-semibold">
            Initializing Meeting
          </h2>

          <p className="text-muted-foreground mt-1">
            Connecting to the interview room...
          </p>
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-2xl font-semibold">Meeting not found</p>
      </div>
    );
  }

  return (
    <StreamCall call={call}>
      <StreamTheme>
        {!isSetupComplete ? (
          <MeetingSetup onSetupComplete={() => setIsSetupComplete(true)} />
        ) : (
          <MeetingRoom />
        )}
      </StreamTheme>
    </StreamCall>
  );
}
export default MeetingPage;