import { SERVICEREQUEST_RESPONSE_SCHEMA_WITH_ASSIGNED } from "./ServiceRequestViewSchemas.ts";
import { z } from "zod";

export const ServiceRequestViewEndpoints = {
    ASSIGNED: {
        ROUTE: "/api/assigned/staff",
        REQ: z.object({
            id: z.number(),
        }),
        RES: SERVICEREQUEST_RESPONSE_SCHEMA_WITH_ASSIGNED,
        COMPLETE: {
            ROUTE: "/api/assigned/finish",
            REQ: z.object({ serviceRequestId: z.number() }),
            RES: z.literal("OK"),
        },
    },
    CREATED: {
        ROUTE: "/api/myservicereqs",
        REQ: z.object({
            id: z.number(),
        }),
        RES: SERVICEREQUEST_RESPONSE_SCHEMA_WITH_ASSIGNED,
    },
    ALL: {
        ROUTE: "/api/servicerequests",
        REQ: z.void(),
        RES: SERVICEREQUEST_RESPONSE_SCHEMA_WITH_ASSIGNED,
    },
} as const;
