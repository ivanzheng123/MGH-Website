import { z } from "zod";
import { Node } from "../../node.ts";

export const PathfindingEndpoints = {
    ROUTE: "/api/pathfind",
    REQ: z.object({ start: z.number().min(1), end: z.number().min(1) }).strict(),
    RES: z.object({
        path: z.array(z.number()),
        graph: z.array(z.tuple([z.number(), z.instanceof(Node)])),
    }),
    UPDATEGRAPH: {
        ROUTE: "/api/pathfind/updategraph",
        REQ: z
            .object({
                graph: z.array(
                    z.tuple([
                        z.number(),
                        z.object({
                            id: z.number(),
                            lat: z.number(),
                            lng: z.number(),
                            floor: z.number(),
                            neighbors: z.set(z.number()).or(z.array(z.number())),
                            name: z.string().or(z.null()),
                        }),
                    ])
                ),
            })
            .strict(),
        RES: z.void(),
    },
    GETGRAPH: {
        ROUTE: "/api/pathfind/getgraph",
        REQ: z.void(),
        RES: z
            .object({
                graph: z.array(
                    z.tuple([
                        z.number(),
                        z.object({
                            id: z.number(),
                            lat: z.number(),
                            lng: z.number(),
                            floor: z.number(),
                            neighbors: z.set(z.number()).or(z.array(z.number())),
                            name: z.string().or(z.null()),
                        }),
                    ])
                ),
            })
            .strict(),
    },
    SETALGO: {
        ROUTE: "/api/pathfind/setalgo",
        REQ: z.object({ algo: z.string() }).strict(),
        RES: z.void(),
    },
    GETALGO: {
        ROUTE: "/api/pathfind/getalgo",
        REQ: z.void(),
        RES: z.object({ algorithm: z.string() }).strict(),
    },
    GETALGOTIMES: {
        ROUTE: "/api/pathfind/getalgotimes",
        REQ: z.void(),
        RES: z.object({ aStar: z.number(), dfs: z.number(), bfs: z.number(), djikstra: z.number() }).strict(),
    },
};
