import useMeetingActions from "@/hooks/useMettingActions";
import { Doc } from "../../convex/_generated/dataModel";
import { getMeetingStatus } from "@/lib/utils";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CalendarIcon, PencilIcon, Trash2Icon, Clock3Icon } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import FeedbackDialog from "./FeedbackDialog";

type Interview = Doc<"interviews">;

type MeetingCardProps = {
  interview: Interview;
  onEdit?: () => void;
  onCancel?: () => void;
  canManage?: boolean;
  currentTime: number;
  hasFeedback?: boolean;
};

function MeetingCard({
  interview,
  onEdit,
  onCancel,
  canManage,
  currentTime,
  hasFeedback
}: MeetingCardProps) {
  const { joinMeeting } = useMeetingActions();

  const status = getMeetingStatus(interview, currentTime);
  const formattedDate = format(new Date(interview.startTime), "EEEE, MMMM d · h:mm a");

  const canModify = canManage && status === "upcoming";

  const statusConfig = {
    live: {
      label: "Live Now",
      variant: "default" as const,
    },
    upcoming: {
      label: "Upcoming",
      variant: "secondary" as const,
    },
    completed: {
      label: "Completed",
      variant: "outline" as const,
    },
    succeeded: {
      label: "Passed",
      variant: "default" as const,
    },
    failed: {
      label: "Failed",
      variant: "destructive" as const,
    },
    missed: {
      label: "Missed",
      variant: "destructive" as const,
    },
    cancelled: {
      label: "Cancelled",
      variant: "outline" as const,
    },
  };

  const badgeConfig = statusConfig[status as keyof typeof statusConfig];

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {formattedDate}
            </div>

            <div className="flex items-center gap-2">
              <Clock3Icon className="h-4 w-4" />
              {interview.expectedDuration} min
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={badgeConfig.variant}>
              {badgeConfig.label}
            </Badge>

            {canModify && (
              <>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={onEdit}
                >
                  <PencilIcon className="size-4" />
                </Button>

                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={onCancel}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <CardTitle>{interview.title}</CardTitle>

        <CardDescription className="line-clamp-2 min-h-[40px]">
          {interview.description || " "}
        </CardDescription>
      </CardHeader>

      <CardContent className="min-h-[100px] flex flex-col justify-end">
        {status === "live" && (
          <Button className="w-full" onClick={() => joinMeeting(interview.streamCallId)}>
            Join Meeting
          </Button>
        )}

        {status === "upcoming" && (
          <Button variant="outline" className="w-full" disabled>
            Waiting to Start
          </Button>
        )}

        {status === "completed" && (
          <Button variant="ghost" className="w-full" disabled>
            Interview Completed
          </Button>
        )}

        {status === "succeeded" && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              disabled
              className="w-full"
            >
              Candidate Passed
            </Button>

            {hasFeedback && (
              <FeedbackDialog
                interviewId={interview._id}
              />
            )}
          </div>
        )}

        {status === "failed" && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              disabled
              className="w-full"
            >
              Candidate Failed
            </Button>

            {hasFeedback && (
              <FeedbackDialog
                interviewId={interview._id}
              />
            )}
          </div>
        )}

        {status === "missed" && (
          <Button variant="ghost" disabled className="w-full">
            Interview Missed
          </Button>
        )}

        {status === "cancelled" && (
          <Button variant="ghost" disabled className="w-full">
            Interview Cancelled
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
export default MeetingCard;