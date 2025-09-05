import { z } from "zod";

const HospitalSchema = z.object({
    name: z.string(),
    address: z.string(),
    identifier: z.string(),
    buildings: z.array(
        z.object({
            name: z.string(),
            hospitalId: z.number(),
            departments: z.array(
                z.object({
                    name: z.string(),
                    floor: z.number(),
                    buildingId: z.number(),
                })
            ),
            floorPlans: z.array(
                z.object({
                    floor: z.number(),
                    imageUrl: z.string(),
                    buildingId: z.number(),
                })
            ),
        })
    ),
});

const NodeSchema = z.object({
    id: z.number(),
    latitude: z.number(),
    longitude: z.number(),
    neighbors: z.array(z.number()),
    floor: z.number(),
    name: z.string().nullable().optional(),
});

export const HospitalDataEndpoints = {
    IMPORT: {
        DIRECTORY: {
            ROUTE: "/api/json2data",
            REQ: z.array(HospitalSchema),
            RES: z.literal("OK"),
        },
        PATHFINDING: {
            ROUTE: "/api/node2data",
            REQ: z.array(NodeSchema),
            RES: z.literal("OK"),
        },
    },
    EXPORT: {
        DIRECTORY: {
            ROUTE: "/api/data2json",
            REQ: z.void(),
            RES: z.array(HospitalSchema),
        },
        PATHFINDING: {
            ROUTE: "/api/data2node",
            REQ: z.void(),
            RES: z.array(NodeSchema),
        },
    },
    FLOORPLANS: {
        ROUTE: "/api/floorplans",
        REQ: z.void(),
        RES: z.void(),
    },
};
