import express, { Request, Response, Router } from "express";
import { API } from "common/src/api/endpoints.ts";
import PrismaClient from "backend/src/bin/prisma-client.ts";
import { sanitize, SanitizedRequest } from "../lib/sanitization.ts";
import { authenticate, authorize } from "../lib/auth.ts";

export const router: Router = express.Router();

router.get(API.CALENDAR.ROUTE, authenticate(), authorize("employee"), async function (req: Request, res: Response) {
    const result: any = await PrismaClient.calendarEvent.findMany();

    console.log("result sent: " + JSON.stringify(result));

    res.json(result);
});

router.post(
    API.CALENDAR.CREATE.ROUTE,
    authenticate(),
    authorize("employee"),
    sanitize(API.CALENDAR.CREATE.REQ),
    async function (req: SanitizedRequest<typeof API.CALENDAR.CREATE.REQ>, res: Response) {
        console.log('Backend Route "' + API.CALENDAR.CREATE.ROUTE + '" Received Body:\n' + JSON.stringify(req.body));
        console.log("Received request:", req.method, req.url);
        console.log("Headers:", req.headers);
        console.log("Body:", req.body);

        try {
            const request = await PrismaClient.calendarEvent.create({
                data: {
                    date: req.body.date,
                    title: req.body.title,
                    description: req.body.description,
                },
            });
            res.status(200).send("OK");
        } catch (error) {
            console.log('Error from "' + API.CALENDAR.CREATE.ROUTE + '": ' + error);
            res.status(500).send("ERROR");
        }

        //await PrismaClient.calendarEvent.;
    }
);
