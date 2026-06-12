import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// add a new comment
export const addComment = mutation({
  args: {
    interviewId: v.id("interviews"),
    content: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const interview = await ctx.db.get(args.interviewId);

    if (!interview) {
      throw new Error("Interview not found");
    }

    const userId = identity.subject;

    const hasAccess =
      interview.createdBy === userId ||
      interview.interviewerIds.includes(userId);

    if (!hasAccess) {
      throw new Error("Unauthorized");
    }

    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    if (!args.content.trim()) {
      throw new Error("Comment is required");
    }

    if (args.content.length > 1000) {
      throw new Error("Comment too long");
    }

    const existingComment = await ctx.db
      .query("comments")
      .withIndex("by_interview_and_interviewer", (q) =>
        q
          .eq("interviewId", args.interviewId)
          .eq("interviewerId", identity.subject)
      )
      .unique();

    if (existingComment) {
      await ctx.db.patch(existingComment._id, {
        content: args.content,
        rating: args.rating,
      });

      return existingComment._id;
    }

    return await ctx.db.insert("comments", {
      interviewId: args.interviewId,
      content: args.content,
      rating: args.rating,
      interviewerId: identity.subject,
    });
  },
});

// get all comments for an interview
export const getComments = query({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {

    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const interview = await ctx.db.get(args.interviewId);

    if (!interview) {
      throw new Error("Interview not found");
    }

    const userId = identity.subject;

    const hasAccess =
      interview.createdBy === userId ||
      interview.candidateId === userId ||
      interview.interviewerIds.includes(userId);

    if (!hasAccess) {
      throw new Error("Unauthorized");
    }

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_interview_id", (q) => q.eq("interviewId", args.interviewId))
      .collect();

    return comments;
  },
});

export const getMyComment = query({
  args: {
    interviewId: v.id("interviews"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("comments")
      .withIndex("by_interview_and_interviewer", (q) =>
        q
          .eq("interviewId", args.interviewId)
          .eq("interviewerId", identity.subject)
      )
      .unique();
  },
});