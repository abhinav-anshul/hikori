import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? new Redis({
              url: process.env.UPSTASH_REDIS_REST_URL,
              token: process.env.UPSTASH_REDIS_REST_TOKEN,
          })
        : null;

const redirectLimiter = redis
    ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(30, "60 s"),
          prefix: "ratelimit:redirect",
      })
    : null;

// Fails open when Upstash isn't configured or the request to it errors,
// so a rate-limiter outage degrades to "unprotected" rather than
// breaking every link redirect.
export async function isRedirectRateLimited(ip: string): Promise<boolean> {
    if (!redirectLimiter) return false;

    try {
        const { success } = await redirectLimiter.limit(ip);
        return !success;
    } catch (err) {
        console.error("rate limit check failed:", err);
        return false;
    }
}
