import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Returns only interviews relevant to the currently authenticated user:
 * - Candidate assigned to the interview
 * - Interviewer assigned to the interview
 * - Creator of the interview
 */
export const getAllInterviews = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const userId = identity.subject;

    const interviews = await ctx.db.query("interviews").collect();

    return interviews.filter(
      (interview) =>
        interview.candidateId === userId ||
        interview.interviewerIds.includes(userId) ||
        interview.createdBy === userId
    );
  },
});

export const getMyInterviews = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const interviews = await ctx.db
      .query("interviews")
      .withIndex("by_candidate_id", (q) => q.eq("candidateId", identity.subject))
      .collect();

    return interviews!;
  },
});

export const getInterviewByStreamCallId = query({
  args: { streamCallId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interviews")
      .withIndex("by_stream_call_id", (q) => q.eq("streamCallId", args.streamCallId))
      .first();
  },
});

function validateInterviewData(data: {
  title: string;
  description?: string;
  startTime: number;
  interviewerIds: string[];
  expectedDuration: number;
}) {
  if (!data.title.trim()) {
    throw new Error("Interview title is required");
  }

  if (data.title.length > 100) {
    throw new Error("Title too long");
  }

  if (data.description && data.description.length > 500) {
    throw new Error("Description too long");
  }

  if (data.startTime <= Date.now()) {
    throw new Error("Interview must be scheduled in future");
  }

  if (data.interviewerIds.length === 0) {
    throw new Error("At least one interviewer required");
  }

  if (!data.expectedDuration) {
    throw new Error("Interview duration is required");
  }

  const validDurations = [15, 30, 45, 60, 90, 120];

  if (!validDurations.includes(data.expectedDuration)) {
    throw new Error("Invalid interview duration");
  }
}

export const createInterview = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    status: v.string(),
    streamCallId: v.string(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),
    expectedDuration: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    validateInterviewData(args);

    return await ctx.db.insert("interviews", {
      ...args,
      createdBy: identity.subject,
      createdAt: Date.now(),
    });
  },
});

export const updateInterviewStatus = mutation({
  args: {
    id: v.id("interviews"),
    status: v.union(
      v.literal("completed"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const interview = await ctx.db.get(args.id);

    if (!interview) {
      throw new Error("Interview not found");
    }

    const userId = identity.subject;

    // Only interviewers assigned to this interview
    // or the creator of the interview can update status.
    // Candidates should not be allowed to modify status.
    const hasAccess =
      interview.interviewerIds.includes(userId) ||
      interview.createdBy === userId;

    if (!hasAccess) {
      throw new Error("Unauthorized");
    }

    // Prevent evaluating interviews that are not completed yet
    if (
      (args.status === "succeeded" ||
        args.status === "failed") &&
      interview.status !== "completed"
    ) {
      throw new Error(
        "Interview must be completed before evaluation"
      );
    }

    return await ctx.db.patch(args.id, {
      status: args.status,
      ...(args.status === "completed"
        ? { endTime: Date.now() }
        : {}),
    });
  },
});

/**
 * Update interview details.
 * Only the creator of the interview can modify it.
 */
export const updateInterview = mutation({
  args: {
    id: v.id("interviews"),
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),
    expectedDuration: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const interview = await ctx.db.get(args.id);

    if (!interview) {
      throw new Error("Interview not found");
    }

    if (interview.createdBy !== identity.subject) {
      throw new Error(
        "Only the creator of this interview can edit it"
      );
    }

    const { id, ...updates } = args;

    validateInterviewData(args);

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const cancelInterview = mutation({
  args: {
    id: v.id("interviews"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const interview = await ctx.db.get(args.id);
    if (!interview) throw new Error("Interview not found");

    if (interview.createdBy !== identity.subject) {
      throw new Error("Only the creator can cancel this interview");
    }

    return await ctx.db.patch(args.id, {
      status: "cancelled",
      updatedAt: Date.now(),
    });
  },
});