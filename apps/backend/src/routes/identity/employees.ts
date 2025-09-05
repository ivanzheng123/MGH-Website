import express, { Request, Response, Router } from "express";
import PrismaClient from "../../bin/prisma-client.ts";
import { API } from "common/src/api/endpoints.ts";
import { sanitize, SanitizedRequest, validateArbitratyData } from "../../lib/sanitization.ts";

export const router: Router = express.Router();

router.get(API.EMPLOYEES.ROUTE, async (req: Request, res: Response) => {
    const raw = await PrismaClient.employee.findMany();
    const data = validateArbitratyData(raw, API.EMPLOYEES.RES);
    if (data.err) {
        res.status(500).send("Internal server error");
    } else {
        res.status(200).json(data.val);
    }
});

router.post(
    API.EMPLOYEES.BYID.ROUTE,
    sanitize(API.EMPLOYEES.BYID.REQ),
    async (req: SanitizedRequest<typeof API.EMPLOYEES.BYID.REQ>, res: Response) => {
        const raw = await PrismaClient.employee.findUnique({
            where: {
                id: req.body.id,
            },
        });
        const data = validateArbitratyData(raw, API.EMPLOYEES.BYID.RES);
        if (data.err) {
            res.status(500).send("Internal server error");
        } else {
            res.status(200).json(data.val);
        }
    }
);

router.post(
    API.EMPLOYEES.BYNAME.ROUTE,
    sanitize(API.EMPLOYEES.BYNAME.REQ),
    async (req: SanitizedRequest<typeof API.EMPLOYEES.BYNAME.REQ>, res: Response) => {
        const raw = await PrismaClient.employee.findMany({
            where: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
            },
        });
        const data = validateArbitratyData(raw[0], API.EMPLOYEES.BYNAME.RES);
        if (data.err) {
            res.status(500).send("Internal server error");
        } else {
            res.status(200).json(data.val);
        }
    }
);
