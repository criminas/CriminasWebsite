import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import { rateLimits } from "./rateLimit";

export const subscribe = mutation({
    args: {
        email: v.string(),
    },
    handler: async (ctx, args) => {
        const email = args.email.toLowerCase().trim();

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email) || email.length > 255) {
            throw new ConvexError("Invalid email address.");
        }

        // Enforce rate limit per email to prevent spamming
        await rateLimits.limit(ctx, "newsletterSubscribe", { key: email });

        // Check if already subscribed (unauthenticated table)
        const existing = await ctx.db
            .query("newsletterSubscriptions")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (!existing) {
            await ctx.db.insert("newsletterSubscriptions", {
                email,
                subscribedAt: Date.now(),
            });
        }

        // If user is authenticated, also mark on their profile
        const userId = await auth.getUserId(ctx);
        if (userId) {
            await ctx.db.patch(userId, {
                newsletterSubscribed: true,
                newsletterSubscribedAt: Date.now(),
            });
        }

        return { success: true };
    },
});

export const unsubscribe = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new ConvexError("Not authenticated");

        const user = await ctx.db.get(userId);
        if (!user) throw new ConvexError("User not found");

        // Unmark on user profile
        await ctx.db.patch(userId, {
            newsletterSubscribed: false,
        });

        // Also remove from subscriptions table if email exists
        if (user.email) {
            const sub = await ctx.db
                .query("newsletterSubscriptions")
                .withIndex("by_email", (q) => q.eq("email", user.email!))
                .first();

            if (sub) {
                await ctx.db.delete(sub._id);
            }
        }

        return { success: true };
    },
});

export const isSubscribed = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return false;

        const user = await ctx.db.get(userId);
        return user?.newsletterSubscribed ?? false;
    },
});
