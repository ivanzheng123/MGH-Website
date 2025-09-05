import { Response, Router } from "express";
import PrismaClient from "../../bin/prisma-client.ts";
import { API } from "common/src/api/endpoints.ts";
import { sanitize, SanitizedRequest } from "../../lib/sanitization.ts";
import { authenticate, authorize } from "../../lib/auth.ts";
import { z } from "zod";

export const router: Router = Router();
const db = PrismaClient;

/**
 * POST /api/node2data
 * Replaces ALL rows in the `pathfinding` table with the payload received.
 */
router.post(
    API.SETTINGS.HOSPITALDATA.IMPORT.PATHFINDING.ROUTE,
    authenticate(),
    authorize("admin"),
    sanitize(API.SETTINGS.HOSPITALDATA.IMPORT.PATHFINDING.REQ),
    async (req: SanitizedRequest<typeof API.SETTINGS.HOSPITALDATA.IMPORT.PATHFINDING.REQ>, res: Response) => {
        try {
            // we want to use a transaction here because we want to remove all the nodes first, and then add the ones we received
            await db.$transaction([
                db.pathfinding.deleteMany({}),
                db.pathfinding.createMany({
                    data: req.body.map((node) => ({
                        id: node.id,
                        latitude: node.latitude,
                        longitude: node.longitude,
                        neighbors: node.neighbors,
                        floor: node.floor,
                        name: node.name ?? "",
                    })),
                }),
            ]);
            res.status(200).send("OK" satisfies z.infer<typeof API.SETTINGS.HOSPITALDATA.IMPORT.PATHFINDING.RES>);
        } catch (error) {
            res.status(400).send("Bad request");
        }
    }
);
