import { v, Id } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { auth } from "./auth";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    
    return await ctx.db.get(userId);
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    await ctx.db.patch(userId, {
      name: args.name,
    });
  },
});

export const starProject = mutation({
  args: {
    projectId: v.string(),
    projectName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Check if already starred
    const existing = await ctx.db
      .query("starredProjects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .first();
    
    if (existing) {
      // Unstar
      await ctx.db.delete(existing._id);
      return { starred: false };
    } else {
      // Star
      await ctx.db.insert("starredProjects", {
        userId,
        projectId: args.projectId,
        projectName: args.projectName,
        starredAt: Date.now(),
      });
      return { starred: true };
    }
  },
});

export const getStarredProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("starredProjects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const isProjectStarred = query({
  args: { projectId: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return false;
    
    const starred = await ctx.db
      .query("starredProjects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .first();
    
    return !!starred;
  },
});

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    await deleteStarredProjects(ctx, userId);
    await deleteAuthStateForUser(ctx, userId);
    await ctx.db.delete(userId);

    return { success: true };
  },
});

export const cleanupOrphanedAuthRecords = internalMutation({
  args: {},
  handler: async (ctx) => {
    let orphanedAccounts = 0;
    let orphanedSessions = 0;

    const accounts = await ctx.db.query("authAccounts").collect();
    for (const account of accounts) {
      const user = await ctx.db.get(account.userId);
      if (!user) {
        await deleteAccountArtifacts(ctx, account._id);
        orphanedAccounts += 1;
      }
    }

    const sessions = await ctx.db.query("authSessions").collect();
    for (const session of sessions) {
      const user = await ctx.db.get(session.userId);
      if (!user) {
        await deleteSessionArtifacts(ctx, session._id);
        orphanedSessions += 1;
      }
    }

    return { orphanedAccounts, orphanedSessions };
  },
});

async function deleteStarredProjects(ctx: any, userId: Id<"users">) {
  const starredProjects = await ctx.db
    .query("starredProjects")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  for (const project of starredProjects) {
    await ctx.db.delete(project._id);
  }
}

async function deleteAuthStateForUser(ctx: any, userId: Id<"users">) {
  const sessions = await ctx.db
    .query("authSessions")
    .withIndex("userId", (q) => q.eq("userId", userId))
    .collect();

  for (const session of sessions) {
    await deleteSessionArtifacts(ctx, session._id);
  }

  const accounts = await ctx.db
    .query("authAccounts")
    .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
    .collect();

  for (const account of accounts) {
    await deleteAccountArtifacts(ctx, account._id);
  }
}

async function deleteSessionArtifacts(ctx: any, sessionId: Id<"authSessions">) {
  const refreshTokens = await ctx.db
    .query("authRefreshTokens")
    .withIndex("sessionId", (q) => q.eq("sessionId", sessionId))
    .collect();

  for (const token of refreshTokens) {
    await ctx.db.delete(token._id);
  }

  const verifiers = await ctx.db
    .query("authVerifiers")
    .filter((q) => q.eq(q.field("sessionId"), sessionId))
    .collect();

  for (const verifier of verifiers) {
    await ctx.db.delete(verifier._id);
  }

  await ctx.db.delete(sessionId);
}

async function deleteAccountArtifacts(ctx: any, accountId: Id<"authAccounts">) {
  const verificationCodes = await ctx.db
    .query("authVerificationCodes")
    .withIndex("accountId", (q) => q.eq("accountId", accountId))
    .collect();

  for (const code of verificationCodes) {
    await ctx.db.delete(code._id);
  }

  const rateLimit = await ctx.db
    .query("authRateLimits")
    .withIndex("identifier", (q) => q.eq("identifier", accountId as unknown as string))
    .unique();

  if (rateLimit) {
    await ctx.db.delete(rateLimit._id);
  }

  await ctx.db.delete(accountId);
}
