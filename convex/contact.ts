import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("contactSubmissions", {
      name: args.name,
      email: args.email,
      subject: args.subject || "",
      message: args.message,
      submittedAt: Date.now(),
      status: "new",
    });
    
    return { success: true, id };
  },
});

// Admin query to list all submissions
export const list = query({
  args: {},
  handler: async (ctx) => {
    // Optional: Check if user is admin before returning
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("contactSubmissions")
      .order("desc")
      .collect();
  },
});

// Admin mutation to update status
export const updateStatus = mutation({
  args: {
    id: v.id("contactSubmissions"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    await ctx.db.patch(args.id, { status: args.status });
    return { success: true };
  },
});
