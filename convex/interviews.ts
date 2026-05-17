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

export const createInterview = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    status: v.string(),
    streamCallId: v.string(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

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
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

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

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});