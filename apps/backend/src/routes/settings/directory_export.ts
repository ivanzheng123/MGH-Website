import express, { Request, Response } from "express";
import PrismaClient from "../../bin/prisma-client.ts";
import { API } from "common/src/api/endpoints.ts";
import { authenticate, authorize } from "../../lib/auth.ts";
import { validateArbitratyData } from "../../lib/sanitization.ts";

export const router = express.Router();
const db = PrismaClient;

router.get(
    API.SETTINGS.HOSPITALDATA.EXPORT.DIRECTORY.ROUTE,
    authenticate(),
    authorize("admin"),
    async (req: Request, res: Response) => {
        const raw = await db.hospital.findMany({
            include: {
                buildings: {
                    include: {
                        departments: true,
                        floorPlans: true,
                    },
                },
            },
        });
        const data = validateArbitratyData(raw, API.SETTINGS.HOSPITALDATA.EXPORT.DIRECTORY.RES);
        if (data.err) {
            res.status(500).send("Internal server error");
        } else {
            res.status(200).json(data.val);
        }
    }
);
