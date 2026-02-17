import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  
  // Override users table to include existing app fields
  users: defineTable({
    // Auth fields from authTables
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    
    // Existing app fields (for backward compatibility with your data)
    username: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    activePathId: v.optional(v.string()),
    hasCompletedOnboarding: v.optional(v.boolean()),
    interests: v.optional(v.array(v.string())),
    learningGoal: v.optional(v.string()),
    skillLevel: v.optional(v.string()),
    xp: v.optional(v.number()),
  }).index("email", ["email"]),

  starredProjects: defineTable({
    userId: v.id("users"),
    projectId: v.string(),
    projectName: v.string(),
    starredAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"]),

  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
    submittedAt: v.number(),
    status: v.optional(v.string()), // "new", "read", "responded"
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),
});

export default schema;
