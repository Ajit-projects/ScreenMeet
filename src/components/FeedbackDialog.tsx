"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import {
    MessageSquareIcon,
    StarIcon,
} from "lucide-react";

import { format } from "date-fns";
import { getInterviewerInfo } from "@/lib/utils";

type FeedbackDialogProps = {
    interviewId: Id<"interviews">;
};

function FeedbackDialog({
    interviewId,
}: FeedbackDialogProps) {
    const comments = useQuery(
        api.comments.getComments,
        { interviewId }
    );

    const users = useQuery(
        api.users.getUsers
    );

    const renderStars = (
        rating: number,
        size = "h-4 w-4"
    ) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((starValue) => (
                <StarIcon
                    key={starValue}
                    className={`${size} ${starValue <= rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                        }`}
                />
            ))}
        </div>
    );

    if (
        comments === undefined ||
        users === undefined
    ) {
        return null;
    }

    const averageRating =
        comments.length > 0
            ? (
                comments.reduce(
                    (sum, comment) =>
                        sum + comment.rating,
                    0
                ) / comments.length
            ).toFixed(1)
            : null;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="secondary"
                    className="w-full"
                >
                    <MessageSquareIcon className="h-4 w-4 mr-2" />
                    View Feedback
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>
                        Candidate Feedback
                    </DialogTitle>
                </DialogHeader>

                {comments.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        No feedback available yet.
                    </div>
                ) : (
                    <>
                        {/* Summary */}
                        <div className="rounded-xl border bg-card p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-semibold">
                                        Feedback Summary
                                    </p>

                                    <p className="text-sm text-muted-foreground mt-1">
                                        Reviews submitted by interviewers
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    {averageRating && (
                                        <>
                                            <div className="text-right">
                                                <p className="text-xl font-semibold">
                                                    {averageRating}/5
                                                </p>

                                                <p className="text-xs text-muted-foreground">
                                                    Average Rating
                                                </p>
                                            </div>

                                            {renderStars(
                                                Math.round(
                                                    Number(averageRating)
                                                )
                                            )}
                                        </>
                                    )}

                                    <Badge variant="outline">
                                        {comments.length} Review
                                        {comments.length > 1
                                            ? "s"
                                            : ""}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Reviews */}
                        <ScrollArea className="h-[420px] mt-4">
                            <div className="space-y-4">
                                {comments.map((comment) => {
                                    const interviewer =
                                        getInterviewerInfo(
                                            users,
                                            comment.interviewerId
                                        );

                                    return (
                                        <div
                                            key={comment._id}
                                            className="rounded-xl border bg-card p-5"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <Avatar className="h-10 w-10 shrink-0">
                                                        <AvatarImage
                                                            src={
                                                                interviewer.image
                                                            }
                                                        />
                                                        <AvatarFallback>
                                                            {
                                                                interviewer.initials
                                                            }
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm truncate">
                                                            {
                                                                interviewer.name
                                                            }
                                                        </p>

                                                        <p className="text-xs text-muted-foreground">
                                                            {comment.updatedAt
                                                                ? `Updated ${format(
                                                                    comment.updatedAt,
                                                                    "MMM d, yyyy • h:mm a"
                                                                )}`
                                                                : format(
                                                                    comment._creationTime,
                                                                    "MMM d, yyyy • h:mm a"
                                                                )}
                                                        </p>
                                                    </div>
                                                </div>

                                                {renderStars(
                                                    comment.rating
                                                )}
                                            </div>

                                            <div className="mt-4 rounded-lg border bg-muted/40 p-3">
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default FeedbackDialog;