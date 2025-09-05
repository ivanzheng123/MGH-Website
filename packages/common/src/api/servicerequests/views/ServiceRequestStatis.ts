import { z } from "zod";

export const StatsEndpoints = {
    COMPLETED_PER_DAY: {
        ROUTE: "/api/stats/completedPerDay",
        TYPE: {
            REQ: z.void(),
            RES: z.array(
                z.object({
                    date: z.string(),
                    count: z.number(),
                })
            ),
        },
    },
    CREATED_PER_DAY: {
        ROUTE: "/api/stats/createdPerDay",
        TYPE: {
            REQ: z.void(),
            RES: z.array(
                z.object({
                    date: z.string(),
                    count: z.number(),
                })
            ),
        },
    },
    SUMMARY: {
        ROUTE: "/api/stats/summary",
        TYPE: {
            REQ: z.void(),
            RES: z.object({
                total: z.number(),
                completed: z.number(),
            }),
        },
    },
    REQUESTS_BY_TYPE: {
        ROUTE: "/api/stats/requestsByType",
        TYPE: {
            REQ: z.void(),
            RES: z.array(
                z.object({
                    type: z.string(),
                    _count: z.number(),
                })
            ),
        },
    },
} as const;
