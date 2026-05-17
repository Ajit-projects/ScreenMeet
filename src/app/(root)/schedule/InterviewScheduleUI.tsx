"use client";

import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
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
import { Loader2Icon, PencilIcon, XIcon, Trash2Icon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { TIME_SLOTS } from "@/constants";
import MeetingCard from "@/components/MeetingCard";
import InterviewCardSkeleton from "./InterviewCardSkeleton";

function InterviewScheduleUI() {
  const client = useStreamVideoClient();
  const { user } = useUser();

  const interviews = useQuery(api.interviews.getAllInterviews);
  const users = useQuery(api.users.getUsers);

  const createInterview = useMutation(api.interviews.createInterview);
  const updateInterview = useMutation(api.interviews.updateInterview);

  const cancelInterview = useMutation(api.interviews.cancelInterview);

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingInterviewId, setEditingInterviewId] = useState<
    string | null
  >(null);

  const candidates =
    users?.filter((u) => u.role === "candidate") ?? [];

  const interviewers =
    users?.filter((u) => u.role === "interviewer") ?? [];

  const initialFormState = useMemo(
    () => ({
      title: "",
      description: "",
      date: new Date(),
      time: "09:00",
      candidateId: "",
      interviewerIds: user?.id ? [user.id] : [],
    }),
    [user?.id]
  );

  const [formData, setFormData] = useState(initialFormState);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingInterviewId(null);
  };

  const handleDialogChange = (value: boolean) => {
    setOpen(value);

    if (!value) {
      resetForm();
    }
  };

  const addInterviewer = (interviewerId: string) => {
    if (!formData.interviewerIds.includes(interviewerId)) {
      setFormData((prev) => ({
        ...prev,
        interviewerIds: [...prev.interviewerIds, interviewerId],
      }));
    }
  };

  const removeInterviewer = (interviewerId: string) => {
    if (interviewerId === user?.id) return;

    setFormData((prev) => ({
      ...prev,
      interviewerIds: prev.interviewerIds.filter(
        (id) => id !== interviewerId
      ),
    }));
  };

  const selectedInterviewers = interviewers.filter((interviewer) =>
    formData.interviewerIds.includes(interviewer.clerkId)
  );

  const availableInterviewers = interviewers.filter(
    (interviewer) =>
      !formData.interviewerIds.includes(interviewer.clerkId)
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

    setIsSubmitting(true);

    try {
      const {
        title,
        description,
        date,
        time,
        candidateId,
        interviewerIds,
      } = formData;

      const [hours, minutes] = time.split(":");

      const meetingDate = new Date(date);

      meetingDate.setHours(
        parseInt(hours),
        parseInt(minutes),
        0
      );

      /**
       * EDIT INTERVIEW
       */
      if (editingInterviewId) {
        await updateInterview({
          id: editingInterviewId as any,
          title,
          description,
          startTime: meetingDate.getTime(),
          candidateId,
          interviewerIds,
        });

        toast.success("Interview updated successfully");
      } else {
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

        await createInterview({
          title,
          description,
          startTime: meetingDate.getTime(),
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
          ? "Failed to update interview"
          : "Failed to schedule interview"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Interviews
          </h1>

          <p className="text-muted-foreground mt-1">
            Schedule and manage interviews
          </p>
        </div>

        {/* DIALOG */}
        <Dialog
          open={open}
          onOpenChange={handleDialogChange}
        >
          <DialogTrigger asChild>
            <Button size="lg">
              Schedule Interview
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px] h-[calc(100vh-200px)] overflow-auto">
            <DialogHeader>
              <DialogTitle>
                {editingInterviewId
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

                  <SelectContent>
                    {candidates.map((candidate) => (
                      <SelectItem
                        key={candidate.clerkId}
                        value={candidate.clerkId}
                      >
                        <UserInfo user={candidate} />
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
                      className="inline-flex items-center gap-2 bg-secondary px-2 py-1 rounded-md text-sm"
                    >
                      <UserInfo user={interviewer} />

                      {interviewer.clerkId !== user?.id && (
                        <button
                          onClick={() =>
                            removeInterviewer(
                              interviewer.clerkId
                            )
                          }
                          className="hover:text-destructive transition-colors"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {availableInterviewers.length > 0 && (
                  <Select
                    onValueChange={addInterviewer}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add interviewer" />
                    </SelectTrigger>

                    <SelectContent>
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
                    disabled={(date) =>
                      date < new Date()
                    }
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

                    <SelectContent>
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
                      {editingInterviewId
                        ? "Updating..."
                        : "Scheduling..."}
                    </>
                  ) : editingInterviewId ? (
                    "Update Interview"
                  ) : (
                    "Schedule Interview"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* INTERVIEWS */}
      {interviews === undefined ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <InterviewCardSkeleton key={i} />
          ))}
        </div>
      ) : interviews.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {interviews.map((interview) => (
            <div
              key={interview._id}
              className="relative"
            >
              <MeetingCard interview={interview} />

                  {interview.createdBy === user?.id && (
                      <div className="absolute top-3 right-3 z-10 flex gap-2">
                          {/* Edit Button */}
                          <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleEditInterview(interview)}
                          >
                              <PencilIcon className="size-4" />
                          </Button>

                          {/* Cancel/Delete Button */}
                          <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => handleCancel(interview._id)}
                          >
                              <Trash2Icon className="size-4" />
                          </Button>
                      </div>
                  )}
              </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No interviews scheduled
        </div>
      )}
    </div>
  );
}

export default InterviewScheduleUI;