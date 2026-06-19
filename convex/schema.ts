import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    role: v.union(
      v.literal("pending"),
      v.literal("candidate"),
      v.literal("interviewer")
    ),
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  interviews: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    status: v.string(),
    streamCallId: v.string(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),

    // Clerk ID of the interviewer who created the interview
    createdBy: v.string(),

    // Optional timestamps for auditing
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),

    //expected duration
    expectedDuration: v.number(),
    rescheduleCount: v.optional(v.number()),
    //feedback
    hasFeedback: v.optional(v.boolean()),
  })
    .index("by_candidate_id", ["candidateId"])
    .index("by_stream_call_id", ["streamCallId"])
    .index("by_created_by", ["createdBy"]),

  comments: defineTable({
    content: v.string(),
    rating: v.number(),
    interviewerId: v.string(),
    interviewId: v.id("interviews"),
    updatedAt: v.optional(v.number()),
  }).index("by_interview_id", ["interviewId"])
    .index("by_interview_and_interviewer", [
      "interviewId",
      "interviewerId",
])
});