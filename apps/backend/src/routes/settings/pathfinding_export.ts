import { API } from "common/src/api/endpoints.ts";
import { Request, Response, Router } from "express";
import PrismaClient from "../../bin/prisma-client.ts";
import { validateArbitratyData } from "../../lib/sanitization.ts";
import { authenticate, authorize } from "../../lib/auth.ts";

export const router: Router = Router();
const db = PrismaClient;

router.get(
    API.SETTINGS.HOSPITALDATA.EXPORT.PATHFINDING.ROUTE,
    authenticate(),
    authorize("admin"),
    async (req: Request, res: Response) => {
        const raw = await db.pathfinding.findMany();
        const data = validateArbitratyData(raw, API.SETTINGS.HOSPITALDATA.EXPORT.PATHFINDING.RES);
        if (data.err) {
            res.status(500).send("Internal server error!");
        } else {
            res.status(200).json(data.val);
        }
    }
);
