import useMeetingActions from "@/hooks/useMettingActions";
import { Doc } from "../../convex/_generated/dataModel";
import { getMeetingStatus } from "@/lib/utils";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CalendarIcon, PencilIcon, Trash2Icon } from "lucide-react";
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

  const canModify =
    canManage &&
    status !== "cancelled" &&
    status !== "completed";

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            {formattedDate}
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={
                status === "live"
                  ? "default"
                  : status === "upcoming"
                    ? "secondary"
                    : status === "completed"
                      ? "outline"
                      : "destructive"
              }
            >
              {status === "live"
                ? "Live Now"
                : status === "upcoming"
                  ? "Upcoming"
                  : status === "completed"
                    ? "Completed"
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

        {interview.description && (
          <CardDescription className="line-clamp-2">{interview.description}</CardDescription>
        )}
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
      </CardContent>
    </Card>
  );
}
export default MeetingCard;