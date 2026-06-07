import useMeetingActions from "@/hooks/useMettingActions";
import { Doc } from "../../convex/_generated/dataModel";
import { getMeetingStatus } from "@/lib/utils";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CalendarIcon, PencilIcon, Trash2Icon, Clock3Icon } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

type Interview = Doc<"interviews">;

type MeetingCardProps = {
  interview: Interview;
  onEdit?: () => void;
  onCancel?: () => void;
  canManage?: boolean;
  currentTime: number;
};

function MeetingCard({
  interview,
  onEdit,
  onCancel,
  canManage,
  currentTime,
}: MeetingCardProps) {
  const { joinMeeting } = useMeetingActions();

  const status = getMeetingStatus(interview, currentTime);
  const formattedDate = format(new Date(interview.startTime), "EEEE, MMMM d · h:mm a");

  const canModify = canManage && status === "upcoming";

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
            <Badge
              variant={
                status === "live"
                  ? "default"
                  : status === "upcoming"
                    ? "secondary"
                    : status === "succeeded"
                      ? "default"
                      : status === "failed"
                        ? "destructive"
                        : "outline"
              }
            >
              {status === "live"
                ? "Live Now"
                : status === "upcoming"
                  ? "Upcoming"
                  : status === "completed"
                    ? "Completed"
                    : status === "succeeded"
                      ? "Passed"
                      : status === "failed"
                        ? "Failed"
                        : "Cancelled"}
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

      <CardContent>
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
          <Button variant="ghost" disabled className="w-full">
            Candidate Passed
          </Button>
        )}

        {status === "failed" && (
          <Button variant="ghost" disabled className="w-full">
            Candidate Failed
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
export default MeetingCard;