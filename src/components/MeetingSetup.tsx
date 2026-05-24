import { DeviceSettings, useCall, VideoPreview } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { CameraIcon, MicIcon, SettingsIcon } from "lucide-react";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import toast from "react-hot-toast";

function MeetingSetup({ onSetupComplete }: { onSetupComplete: () => void }) {
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  const MEETING_LOCK_TIMEOUT = 1000 * 60 * 60; // 1 hour

  const call = useCall();

  if (!call) return null;

  useEffect(() => {
    setIsCameraEnabled(false);
    setIsMicEnabled(false);
  }, []);

  useEffect(() => {
    let cameraPermission: PermissionStatus;
    let micPermission: PermissionStatus;

    const setupPermissionListeners = async () => {
      try {
        // CAMERA PERMISSION
        cameraPermission = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });

        // MIC PERMISSION
        micPermission = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });

        cameraPermission.onchange = async () => {
          try {
            if (cameraPermission.state === "granted") {
              setIsCameraEnabled(true);
            }

            if (cameraPermission.state === "denied") {
              setIsCameraEnabled(false);
            }
          } catch (error) {
            console.error(error);

            setIsCameraEnabled(false);
          }
        };

        micPermission.onchange = async () => {
          try {
            if (micPermission.state === "granted") {
              await call.microphone.disable();
              await call.microphone.enable();

              setIsMicEnabled(true);
            }

            if (micPermission.state === "denied") {
              setIsMicEnabled(false);
            }
          } catch (error) {
            console.error(error);

            setIsMicEnabled(false);
          }
        };
      } catch (error) {
        console.error(error);
      }
    };

    setupPermissionListeners();

    return () => {
      if (cameraPermission) {
        cameraPermission.onchange = null;
      }

      if (micPermission) {
        micPermission.onchange = null;
      }
    };
  }, [call]);

  const handleJoin = async () => {
    try {
      setIsJoining(true);

      const activeMeetingKey = `active-meeting-${call.id}`;

      // Detect if meeting already opened in another tab
      const existingSession = localStorage.getItem(activeMeetingKey);

      if (existingSession) {
        const parsed = JSON.parse(existingSession);

        const isExpired =
          Date.now() - parsed.joinedAt >
          MEETING_LOCK_TIMEOUT;

        if (!isExpired) {
          toast.error(
            "This meeting is already active in another tab"
          );

          setIsJoining(false);
          return;
        }

        // Remove stale lock
        localStorage.removeItem(activeMeetingKey);
      }

      // Store active meeting lock
      localStorage.setItem(
        activeMeetingKey,
        JSON.stringify({
          meetingId: call.id,
          joinedAt: Date.now(),
        })
      );

      await call.join();

      onSetupComplete();

      const cleanup = async () => {
        try {
          await call.leave();
        } catch (error) {
          console.error(error);
        }

        localStorage.removeItem(activeMeetingKey);
      };

      // Remove lock when tab closes
      window.addEventListener("beforeunload", cleanup);

      // Remove lock when user switches route
      window.addEventListener("unload", cleanup);
    } catch (error) {
      console.error(error);

      localStorage.removeItem(
        `active-meeting-${call.id}`
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleCameraToggle = async (checked: boolean) => {
    try {
      setIsCameraLoading(true);

      if (checked) {
        await call.camera.enable();
        setIsCameraEnabled(true);
      } else {
        await call.camera.disable();
        setIsCameraEnabled(false);
      }
    } catch (error) {
      console.error(error);

      setIsCameraEnabled(false);

      toast.error(
        "Camera permission denied or unavailable"
      );
    } finally {
      setTimeout(() => {
        setIsCameraLoading(false);
      }, 300);
    }
  };

  const handleMicToggle = async (checked: boolean) => {
    try {
      if (checked) {
        await call.microphone.enable();
        setIsMicEnabled(true);
      } else {
        await call.microphone.disable();
        setIsMicEnabled(false);
      }
    } catch (error) {
      console.error(error);

      setIsMicEnabled(false);

      toast.error(
        "Microphone permission denied or unavailable"
      );
    }
  };

  return (
    <div className="min-h-screen p-6 bg-background/95 overflow-y-auto">
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* VIDEO PREVIEW CONTAINER */}
          <Card className="md:sticky md:top-6 p-6 flex flex-col">
            <div>
              <h1 className="text-xl font-semibold mb-1">Camera Preview</h1>
              <p className="text-sm text-muted-foreground">Make sure you look good!</p>
            </div>

            {/* VIDEO PREVIEW */}
            <div className="mt-4 flex-1 min-h-[400px] rounded-xl overflow-hidden bg-muted/50 border relative">
              {isCameraLoading ? (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                  Starting camera...
                </div>
              ) : !isCameraEnabled ? (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                  Camera is turned off
                </div>
              ) : (
                <VideoPreview className="h-full w-full" />
              )}
            </div>
          </Card>

          {/* CARD CONTROLS */}

          <Card className="md:col-span-1 p-6 overflow-visible relative z-20">
            <div className="h-full flex flex-col overflow-visible relative">
              {/* MEETING DETAILS  */}
              <div>
                <h2 className="text-xl font-semibold mb-1">Meeting Details</h2>
                <p className="text-sm text-muted-foreground break-all">{call.id}</p>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-6 mt-8">
                  {/* CAM CONTROL */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CameraIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Camera</p>
                        <p className="text-sm text-muted-foreground">
                          {isCameraEnabled ? "On" : "Off"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isCameraEnabled}
                      onCheckedChange={handleCameraToggle}
                      className="data-[state=unchecked]:bg-zinc-600"
                    />
                  </div>

                  {/* MIC CONTROL */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MicIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Microphone</p>
                        <p className="text-sm text-muted-foreground">
                          {isMicEnabled ? "On" : "Off"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isMicEnabled}
                      onCheckedChange={handleMicToggle}
                      className="data-[state=unchecked]:bg-zinc-600"
                    />
                  </div>

                  {/* DEVICE SETTINGS */}
                  <div className="flex items-center justify-between relative z-50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <SettingsIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Settings</p>
                        <p className="text-sm text-muted-foreground">
                          Configure devices
                        </p>
                      </div>
                    </div>
                    <div className="stream-device-settings">
                      <DeviceSettings />
                    </div>
                  </div>
                </div>

                {/* JOIN Button */}
                <div className="space-y-3 mt-8">
                  <Button className="w-full" size="lg" onClick={handleJoin} disabled={isJoining}>
                    {isJoining ? "Joining..." : "Join Meeting"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Do not worry, our team is super friendly! We want you to succeed. 🎉
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default MeetingSetup;