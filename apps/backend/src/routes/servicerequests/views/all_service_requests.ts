import express, { Request, Response, Router } from "express";
import PrismaClient from "../../../bin/prisma-client.ts";
import { API } from "common/src/api/endpoints.ts";
import { authenticate, authorize } from "../../../lib/auth.ts";
import { validateArbitratyData } from "../../../lib/sanitization.ts";

export const router: Router = express.Router();

router.get(API.REQUESTS.VIEW.ALL.ROUTE, authenticate(), authorize("admin"), async (req: Request, res: Response) => {
    // fetches every entry from the service request table
    const raw = await PrismaClient.serviceRequest.findMany({
        include: {
            maintenanceRequest: true,
            foodServiceRequest: true,
            deviceRequest: true,
            languageRequest: true,
            audiovisualRequest: true,
            transportationRequest: true,
            assignedTo: {
                select: {
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });
    const data = validateArbitratyData(raw, API.REQUESTS.VIEW.ALL.RES);
    if (data.err) {
        console.log(data.val);
        res.status(500).send("Internal server error");
    } else {
        res.status(200).json(data.val);
    }
});
