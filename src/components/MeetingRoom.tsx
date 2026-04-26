"use client";

import {
  CallControls,
  CallingState,
  CallParticipantsList,
  PaginatedGridLayout,
  SpeakerLayout,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { LayoutListIcon, LoaderIcon, UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import EndCallButton from "./EndCallButton";
import CodeEditor from "./CodeEditor";

// STATUS COMPONENT
function CallStatus({
  text,
  showSpinner = true,
  action,
}: {
  text: string;
  showSpinner?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      {showSpinner && <LoaderIcon className="size-8 animate-spin text-muted-foreground" />}
      <p className="text-sm text-muted-foreground text-center">{text}</p>
      {action}
    </div>
  );
}

function MeetingRoom() {
  const router = useRouter();
  const call = useCall();

  const [layout, setLayout] = useState<"grid" | "speaker">("speaker");
  const [showParticipants, setShowParticipants] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const { useCallCallingState } = useCallStateHooks();

  const callingState = useCallCallingState();

  // AUTO RECONNECT
  useEffect(() => {
    if (
      callingState === CallingState.RECONNECTING &&
      reconnectAttempts < 3 &&
      call
    ) {
      const timeout = setTimeout(async () => {
        try {
          await call.join();
          setReconnectAttempts((prev) => prev + 1);
        } catch (err) {
          console.error("Rejoin failed:", err);
        }
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [callingState, reconnectAttempts, call]);

  const isReconnectStuck =
    callingState === CallingState.RECONNECTING && reconnectAttempts >= 3;

  // STATE HANDLING

  if (callingState === CallingState.IDLE || callingState === CallingState.UNKNOWN) {
    return <CallStatus text="Initializing call..." />;
  }

  if (callingState === CallingState.JOINING) {
    return <CallStatus text="Joining meeting..." />;
  }

  if (callingState === CallingState.RECONNECTING) {
    if (isReconnectStuck) {
      return (
        <CallStatus
          text="Connection lost. Please try rejoining."
          showSpinner={false}
          action={<Button onClick={() => router.push("/")}>Go back home</Button>}
        />
      );
    }

    return <CallStatus text="Reconnecting..." />;
  }

  if (callingState === CallingState.LEFT) {
    return (
      <CallStatus
        text="You have left the meeting"
        showSpinner={false}
        action={<Button onClick={() => router.push("/")}>Go back home</Button>}
      />
    );
  }

  // MAIN UI

  return (
    <div className="h-[calc(100vh-4rem-1px)]">
      <ResizablePanelGroup direction="horizontal">
        {/* VIDEO PANEL */}
        <ResizablePanel defaultSize={35} minSize={25} maxSize={100} className="relative">
          {/* VIDEO LAYOUT */}
          <div className="absolute inset-0">
            {layout === "grid" ? <PaginatedGridLayout /> : <SpeakerLayout />}

            {/* PARTICIPANTS SIDEBAR */}
            {showParticipants && (
              <div className="absolute right-0 top-0 h-full w-[300px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CallParticipantsList onClose={() => setShowParticipants(false)} />
              </div>
            )}
          </div>

          {/* CONTROLS */}
          <div className="absolute bottom-4 left-0 right-0">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 flex-wrap justify-center px-4">
                <CallControls onLeave={() => router.push("/")} />

                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="size-10">
                        <LayoutListIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setLayout("grid")}>
                        Grid View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLayout("speaker")}>
                        Speaker View
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="icon"
                    className="size-10"
                    onClick={() => setShowParticipants((prev) => !prev)}
                  >
                    <UsersIcon className="size-4" />
                  </Button>

                  <EndCallButton />
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* CODE EDITOR */}
        <ResizablePanel defaultSize={65} minSize={25}>
          <CodeEditor />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
export default MeetingRoom;