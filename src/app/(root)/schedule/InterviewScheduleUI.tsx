"use client";

import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useMutation, useQuery } from "convex/react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { api } from "../../../../convex/_generated/api";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import UserInfo from "@/components/UserInfo";
import { Loader2Icon, SearchIcon, XIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { TIME_SLOTS } from "@/constants";
import { createMeetingDate, isDateDisabled } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";
import InterviewGrid from "./InterviewGrid";

function InterviewScheduleUI() {
  const client = useStreamVideoClient();
  const { user } = useUser();

  const interviews = useQuery(api.interviews.getAllInterviews) ?? [];
  const users = useQuery(api.users.getUsers) ?? [];

  const createInterview = useMutation(api.interviews.createInterview);
  const updateInterview = useMutation(api.interviews.updateInterview);

  const cancelInterview = useMutation(api.interviews.cancelInterview);
  const rescheduleInterview = useMutation(api.interviews.rescheduleInterview);

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingInterviewId, setEditingInterviewId] = useState<Id<"interviews"> | null>(null);

  const [selectedInterviewer, setSelectedInterviewer] = useState("");
  const [rescheduleHandled, setRescheduleHandled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  const candidates = useMemo(
    () => users?.filter((u) => u.role === "candidate") ?? [],
    [users]
  );

  const interviewers = useMemo(
    () => users?.filter((u) => u.role === "interviewer") ?? [],
    [users]
  );

  const initialFormState = useMemo(
    () => ({
      title: "",
      description: "",
      date: new Date(),
      time: "09:00",
      expectedDuration: 60,
      candidateId: "",
      interviewerIds: user?.id ? [user.id] : [],
    }),
    [user?.id]
  );

  const [formData, setFormData] = useState(initialFormState);

  const searchParams = useSearchParams();

  const rescheduleId = searchParams.get("rescheduleId");
  //editing interview opened from re-schedule
  const isRescheduleMode = !!rescheduleId;

  useEffect(() => {
    if (
      !interviews ||
      !rescheduleId ||
      rescheduleHandled
    ) {
      return;
    }

    const interview = interviews.find(
      (i) => i._id === rescheduleId
    );

    if (!interview) return;

    setRescheduleHandled(true);
    handleEditInterview(interview);
  }, [interviews, rescheduleId, rescheduleHandled]);

  useEffect(() => {
    if (!rescheduleId) {
      setRescheduleHandled(false);
    }
  }, [rescheduleId]);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingInterviewId(null);
  };

  const handleDialogChange = (value: boolean) => {
    setOpen(value);

    if (!value && rescheduleId) {
      resetForm();
      router.replace("/schedule");
      return;
    }

    if (!value) {
      resetForm();
    }
  };

  const addInterviewer = (interviewerId: string) => {
    if (formData.interviewerIds.includes(interviewerId)) return;

    setFormData((prev) => ({
      ...prev,
      interviewerIds: [...prev.interviewerIds, interviewerId],
    }));
  };

  const removeInterviewer = useCallback((id: string) => {
    if (id === user?.id) return;

    setFormData(prev => ({
      ...prev,
      interviewerIds: prev.interviewerIds.filter(x => x !== id),
    }));
  }, [user?.id]);

  const selectedInterviewers = useMemo(
    () =>
      interviewers.filter((i) =>
        formData.interviewerIds.includes(i.clerkId)
      ),
    [interviewers, formData.interviewerIds]
  );

  const availableInterviewers = useMemo(
    () =>
      interviewers.filter(
        (i) => !formData.interviewerIds.includes(i.clerkId)
      ),
    [interviewers, formData.interviewerIds]
  );

  const handleEditInterview = (interview: any) => {
    if (interview.createdBy !== user?.id) {
      toast.error("Only the creator can edit this interview");
      return;
    }

    const interviewDate = new Date(interview.startTime);

    const hours = interviewDate
      .getHours()
      .toString()
      .padStart(2, "0");

    const minutes = interviewDate
      .getMinutes()
      .toString()
      .padStart(2, "0");

    setEditingInterviewId(interview._id);

    setFormData({
      title: interview.title,
      description: interview.description || "",
      date: interviewDate,
      time: `${hours}:${minutes}`,
      expectedDuration: interview.expectedDuration ?? 60,
      candidateId: interview.candidateId,
      interviewerIds: interview.interviewerIds,
    });

    setOpen(true);
  };

  const handleCancel = async (interviewId: any) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this interview?"
    );

    if (!confirmed) return;

    try {
      await cancelInterview({
        id: interviewId,
      });

      toast.success("Interview cancelled successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel interview");
    }
  };

  const handleSubmit = async () => {
    if (!client || !user) return;

    if (
      !formData.candidateId ||
      formData.interviewerIds.length === 0
    ) {
      toast.error(
        "Please select candidate and at least one interviewer"
      );
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Interview title is required");
      return;
    }

    if (formData.title.length > 100) {
      toast.error("Interview title must be under 100 characters");
      return;
    }

    if (formData.description.length > 500) {
      toast.error("Description too long");
      return;
    }

    if (!formData.expectedDuration) {
      toast.error("Please select interview duration");
      return;
    }

    const meetingDate = createMeetingDate(
      formData.date,
      formData.time
    );

    const now = new Date();

    if (meetingDate <= now) {
      toast.error("Please select a future time");
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        title,
        description,
        expectedDuration,
        candidateId,
        interviewerIds,
      } = formData;

      /**
       * Re-Scheduled INTERVIEW
       */
      if (editingInterviewId && isRescheduleMode) {
        await rescheduleInterview({
          id: editingInterviewId,
          startTime: meetingDate.getTime(),
          expectedDuration,
        });

        const interview = interviews?.find(
          (i) => i._id === editingInterviewId
        );

        if (interview?.streamCallId) {
          const call = client.call(
            "default",
            interview.streamCallId
          );

          await call.update({
            starts_at: meetingDate.toISOString(),
          });
        }

        toast.success("Interview rescheduled successfully");
        router.replace("/schedule");
      }
      //edit interview
      else if (editingInterviewId) {
        await updateInterview({
          id: editingInterviewId,
          title,
          description,
          startTime: meetingDate.getTime(),
          expectedDuration,
          candidateId,
          interviewerIds,
        });

        const interview = interviews?.find(
          (i) => i._id === editingInterviewId
        );

        if (interview?.streamCallId) {
          const call = client.call(
            "default",
            interview.streamCallId
          );

          await call.update({
            starts_at: meetingDate.toISOString(),
            custom: {
              description: title,
              additionalDetails: description,
            },
          });
        }
        toast.success("Interview updated successfully");
      }
      else {
        /**
         * CREATE INTERVIEW
         */
        const id = crypto.randomUUID();

        const call = client.call("default", id);

        await call.getOrCreate({
          data: {
            starts_at: meetingDate.toISOString(),
            custom: {
              description: title,
              additionalDetails: description,
            },
          },
        });

        // Prevent automatic device activation
        await call.camera.disable();
        await call.microphone.disable();

        await createInterview({
          title,
          description,
          startTime: meetingDate.getTime(),
          expectedDuration,
          status: "upcoming",
          streamCallId: id,
          candidateId,
          interviewerIds,
        });

        toast.success("Interview scheduled successfully");
      }

      setOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);

      toast.error(
        editingInterviewId
          ? isRescheduleMode
            ? "Failed to reschedule interview"
            : "Failed to update interview"
          : "Failed to schedule interview"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Interviews
          </h1>

          <p className="text-muted-foreground mt-1">
            Schedule and manage interviews
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <SearchIcon
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />

          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search interviews..."
            className="h-11 pl-11 pr-4 rounded-lg border-border bg-background shadow-sm transition-all placeholder:text-muted-foreground
            focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
          />
        </div>

        {/* DIALOG */}
        <Dialog
          open={open}
          onOpenChange={handleDialogChange}
        >
          <DialogTrigger asChild>
            <Button size="lg" className="w-full sm:w-auto shrink-0">
              Schedule Interview
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px] h-[calc(100vh-200px)] overflow-auto">
            <DialogHeader>
              <DialogTitle>
                {isRescheduleMode
                  ? "Reschedule Interview"
                  : editingInterviewId
                    ? "Edit Interview"
                    : "Schedule Interview"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* TITLE */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Title
                </label>

                <Input
                  placeholder="Interview title"
                  value={formData.title}
                  disabled={isRescheduleMode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Description
                </label>

                <Textarea
                  placeholder="Interview description"
                  disabled={isRescheduleMode}
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* CANDIDATE */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Candidate
                </label>

                <Select
                  disabled={isRescheduleMode}
                  value={formData.candidateId}
                  onValueChange={(candidateId) =>
                    setFormData({
                      ...formData,
                      candidateId,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select candidate" />
                  </SelectTrigger>

                  <SelectContent className="max-h-72">
                    {candidates.map((candidate) => (
                      <SelectItem
                        key={candidate.clerkId}
                        value={candidate.clerkId}
                      >
                        <div className="flex w-full items-center">
                          <UserInfo user={candidate} />
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* INTERVIEWERS */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Interviewers
                </label>

                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedInterviewers.map((interviewer) => (
                    <div
                      key={interviewer.clerkId}
                      className="inline-flex items-center gap-2 rounded-md bg-secondary px-2 py-1 text-sm"
                    >
                      <UserInfo user={interviewer} />

                      {!isRescheduleMode &&
                        interviewer.clerkId !== user?.id && (
                          <button
                            type="button"
                            onClick={() =>
                              removeInterviewer(interviewer.clerkId)
                            }
                            className="rounded-sm transition-colors hover:text-destructive"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        )}
                    </div>
                  ))}
                </div>

                {availableInterviewers.length > 0 && (
                  <Select
                    disabled={isRescheduleMode}
                    onValueChange={addInterviewer}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add interviewer" />
                    </SelectTrigger>

                    <SelectContent className="max-h-72">
                      {availableInterviewers.map(
                        (interviewer) => (
                          <SelectItem
                            key={interviewer.clerkId}
                            value={interviewer.clerkId}
                          >
                            <UserInfo user={interviewer} />
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* DATE & TIME */}
              <div className="flex gap-4">
                {/* CALENDAR */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Date
                  </label>

                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) =>
                      date &&
                      setFormData({
                        ...formData,
                        date,
                      })
                    }
                    disabled={isDateDisabled}
                    className="rounded-md border"
                  />
                </div>

                {/* TIME */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Time
                  </label>

                  <Select
                    value={formData.time}
                    onValueChange={(time) =>
                      setFormData({
                        ...formData,
                        time,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>

                    <SelectContent className="max-h-72">
                      {TIME_SLOTS.map((time) => (
                        <SelectItem
                          key={time}
                          value={time}
                        >
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Expected Duration
                </label>

                <Select
                  value={String(formData.expectedDuration)}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      expectedDuration: Number(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent className="max-h-72">
                    <SelectItem value="15">
                      15 Minutes
                    </SelectItem>

                    <SelectItem value="30">
                      30 Minutes
                    </SelectItem>

                    <SelectItem value="45">
                      45 Minutes
                    </SelectItem>

                    <SelectItem value="60">
                      1 Hour
                    </SelectItem>

                    <SelectItem value="90">
                      1 Hour 30 Minutes
                    </SelectItem>

                    <SelectItem value="120">
                      2 Hours
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2Icon className="mr-2 size-4 animate-spin" />
                      {isRescheduleMode
                        ? "Rescheduling..."
                        : editingInterviewId
                          ? "Updating..."
                          : "Scheduling..."
                      }
                    </>
                  ) : isRescheduleMode
                    ? "Reschedule Interview"
                    : editingInterviewId

                      ? "Update Interview"
                      : "Schedule Interview"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* INTERVIEWS */}
      <InterviewGrid
        interviews={interviews}
        users={users}
        searchQuery={searchQuery}
        currentUserId={user?.id}
        onEdit={handleEditInterview}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default InterviewScheduleUI;