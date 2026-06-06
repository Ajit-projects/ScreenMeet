"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import {
  Loader2Icon,
  UserIcon,
  BriefcaseIcon,
} from "lucide-react";
import toast from "react-hot-toast";

function RoleSelection() {
  const updateRole = useMutation(api.users.updateRole);

  const [loadingRole, setLoadingRole] = useState<
    "candidate" | "interviewer" | null
  >(null);

  const handleSelectRole = async (
    role: "candidate" | "interviewer"
  ) => {
    try {
      setLoadingRole(role);

      await updateRole({ role });

      toast.success("Role selected successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to select role");
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-20 px-6">
      <div className="rounded-xl border bg-card p-8 shadow-sm">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold">
            Welcome to ScreenMeet
          </h1>

          <p className="text-muted-foreground">
            Select your role to continue.
            This choice can only be made once.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-10">
          {/* Candidate */}
          <div className="border rounded-xl p-6 space-y-4">
            <UserIcon className="size-10" />

            <h2 className="text-xl font-semibold">
              Candidate
            </h2>

            <p className="text-sm text-muted-foreground">
              View your scheduled interviews and
              join interview sessions when invited.
            </p>

            <Button
              className="w-full"
              disabled={loadingRole !== null}
              onClick={() =>
                handleSelectRole("candidate")
              }
            >
              {loadingRole === "candidate" ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Join as a Candidate"
              )}
            </Button>
          </div>

          {/* Interviewer */}
          <div className="border rounded-xl p-6 space-y-4">
            <BriefcaseIcon className="size-10" />

            <h2 className="text-xl font-semibold">
              Interviewer
            </h2>

            <p className="text-sm text-muted-foreground">
              Schedule interviews, conduct interview
              sessions, and add candidate evaluations.
            </p>

            <Button
              className="w-full"
              disabled={loadingRole !== null}
              onClick={() =>
                handleSelectRole("interviewer")
              }
            >
              {loadingRole === "interviewer" ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Join as a Interviewer"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;