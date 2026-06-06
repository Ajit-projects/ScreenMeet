import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const syncUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (existingUser) return;

    return await ctx.db.insert("users", {
      ...args,
     role: "pending",
    });
  },
});

export const getUsers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User is not authenticated");

    const users = await ctx.db.query("users").collect();

    return users;
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q =>
        q.eq("clerkId", identity.subject)
      )
      .unique();
  },
});

export const updateRole = mutation({
  args: {
    role: v.union(
      v.literal("candidate"),
      v.literal("interviewer")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkId", identity.subject)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }
    //prevent role changes
    if (user.role !== "pending") {
      throw new Error(
        "Role has already been selected"
      );
    }

    await ctx.db.patch(user._id, {
      role: args.role,
    });
  },
});