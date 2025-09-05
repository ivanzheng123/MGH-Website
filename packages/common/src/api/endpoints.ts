import { z, ZodType, ZodTypeAny } from "zod";
import { ServiceRequestViewEndpoints } from "./servicerequests/views/ServiceRequestViewEndpoints.ts";
import {
    ServiceRequestFormCreateEndpoints,
    ServiceRequestFormUpdateEndpoints,
} from "./servicerequests/forms/ServiceRequestFormCreateEndpoints.ts";
import { PathfindingEndpoints } from "./pathfinding/PathfindingEndpoints.ts";
import { HospitalDataEndpoints } from "./settings/HospitalDataEndpoints.ts";
import { StatsEndpoints } from "./servicerequests/views/ServiceRequestStatis.ts";

export type EndpointScope = "admin" | "employee" | "guest";

// note: this type is NOT actually used, its just to help us remember what the API is supposed to look like.
// (it would be annoying to deal with if we actually made the API use this type, because typescript doesn't support index types with ommisions very well.
type APINode = {
    ROUTE: string;
    REQ: ZodType;
    RES: ZodType;
    // any other nested endpoints
    [key: string]: APINode | string | ZodType;
};

type ApiGeneric<T> =
    // 1) if T is exactly an endpoint definition…
    T extends { ROUTE: infer Path extends string; REQ: infer Req extends ZodTypeAny; RES: infer Res extends ZodTypeAny }
        ? { ROUTE: Path; REQ: z.infer<Req>; RES: z.infer<Res> } & {
              [K in Exclude<keyof T, "ROUTE" | "REQ" | "RES">]: ApiGeneric<T[K]>;
          }
        : // 2) else if T is just a nested grouping…
          T extends object
          ? { [K in keyof T]: ApiGeneric<T[K]> }
          : never;

export type FrontendAPI = ApiGeneric<typeof API>;

export const API = {
    STATS: StatsEndpoints,
    HEALTHCHECK: {
        ROUTE: "/api/healthcheck",
        REQ: z.void(),
        RES: z.literal("OK"),
    },
    REQUESTS: {
        VIEW: ServiceRequestViewEndpoints,
        CREATE: ServiceRequestFormCreateEndpoints,
        UPDATE: ServiceRequestFormUpdateEndpoints,
    },
    PATHFIND: PathfindingEndpoints,
    EMPLOYEES: {
        ROUTE: "/api/employee",
        REQ: z.void(),
        RES: z.array(
            z.object({
                id: z.number(),
                department: z.string().or(z.null()),
                position: z.string(),
                uuid: z.string().or(z.null()),
                userName: z.string(),
                email: z.string(),
                phoneNumber: z.string(),
                firstName: z.string(),
                lastName: z.string(),
            })
        ),
        BYID: {
            ROUTE: "/api/findemployee",
            REQ: z.object({
                id: z.number(),
            }),
            RES: z.object({
                id: z.number(),
                department: z.string().or(z.null()),
                position: z.string(),
                uuid: z.string().or(z.null()),
                userName: z.string(),
                email: z.string(),
                phoneNumber: z.string(),
                firstName: z.string(),
                lastName: z.string(),
            }),
        },
        BYNAME: {
            ROUTE: "/api/findId",
            REQ: z.object({
                firstName: z.string(),
                lastName: z.string(),
            }),
            RES: z.object({
                id: z.number(),
                department: z.string().or(z.null()),
                position: z.string(),
                uuid: z.string().or(z.null()),
                userName: z.string(),
                email: z.string(),
                phoneNumber: z.string(),
                firstName: z.string(),
                lastName: z.string(),
            }),
        },
    },
    USERS: {
        ROUTE: "/api/users/getposition",
        REQ: z.void(),
        RES: z
            .object({
                id: z.number(),
                position: z.literal("admin").or(z.literal("employee")).or(z.literal("guest")),
            })
            .strict(),
        VERBOSE: {
            ROUTE: "/api/users/getemployeebyuuid",
            REQ: z.void(),
            RES: z
                .object({
                    id: z.number(),
                    department: z.string().or(z.null()),
                    position: z.literal("admin").or(z.literal("employee")).or(z.literal("guest")),
                    uuid: z.string(),
                    userName: z.string(),
                    email: z.string(),
                    phoneNumber: z.string(),
                    firstName: z.string(),
                    lastName: z.string(),
                })
                .strict(),
        },
        UPDATE: {
            ROUTE: "/api/users/updateuser",
            REQ: z.object({
                id: z.number().or(z.null()),
                department: z.string().or(z.null()),
                position: z.literal("admin").or(z.literal("employee")).or(z.literal("guest")),
                userName: z.string(),
                email: z.string(),
                phoneNumber: z.string(),
                firstName: z.string(),
                lastName: z.string(),
            }),
            RES: z.literal("OK"),
            ME: {
                ROUTE: "/api/users/updateme",
                REQ: z.object({
                    firstName: z.string(),
                    lastName: z.string(),
                    phoneNumber: z.string(),
                }),
                RES: z.literal("OK"),
            },
        },
    },
    SETTINGS: {
        HOSPITALDATA: HospitalDataEndpoints,
    },
    CALENDAR: {
        ROUTE: "/api/calendar",
        REQ: z.object({
            id: z.number(),
            date: z.coerce.date(),
            title: z.string(),
            description: z.string(),
        }),
        RES: z.literal("OK"),
        CREATE: {
            ROUTE: "/api/calendar/create",
            REQ: z.object({
                date: z.coerce.date(),
                title: z.string(),
                description: z.string(),
            }),
            RES: z.void(),
        },
    },
    FORUM: {
        ROUTE: "/api/forum",
        REQ: z.void(),
        RES: z.void(),
        CREATE: {
            ROUTE: "/api/forum/create",
            REQ: z.object({
                title: z.string(),
                content: z.string(),
                employeeId: z.number(),
            }),
            RES: z.object({
                id: z.number(),
                authorId: z.number(),
                date: z.string(),
                title: z.string(),
                content: z.string(),
            }),
        },
        REPLIES: {
            ROUTE: "/api/replies",
            REQ: z.object({
                id: z.string().or(z.number()),
            }),
            RES: z.void(),
            CREATE: {
                ROUTE: "/api/replies/create",
                REQ: z.object({
                    originalid: z.number(),
                    content: z.string(),
                    employeeId: z.number(),
                }),
                RES: z.object({
                    id: z.number(),
                    postId: z.number(),
                    authorId: z.number(),
                    content: z.string(),
                    date: z.string(),
                    writtenBy: z.object({
                        firstName: z.string(),
                        lastName: z.string(),
                    }),
                }),
            },
        },
    },
    WONGBOT: {
        STREAM: {
            ROUTE: "/api/wongbot/stream",
            REQ: z.void(),
            RES: z.unknown(),
        },
    },
} as const;
