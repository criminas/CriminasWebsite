import { RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

export const rateLimits = new RateLimiter(components.rateLimiter, {
    newsletterSubscribe: { kind: "fixed window", rate: 3, period: 60000 },
    updateProfile: { kind: "token bucket", rate: 5, period: 60000, capacity: 5 },
    starProject: { kind: "token bucket", rate: 20, period: 60000, capacity: 20 }
});
