import express, { Response, Router } from "express";
import PrismaClient from "../../../bin/prisma-client.ts";
import { API } from "common/src/api/endpoints.ts";
import { sanitize, SanitizedRequest, validateArbitratyData } from "../../../lib/sanitization.ts";
import { authenticate, authorize } from "../../../lib/auth.ts";
import { z } from "zod";
import { sendCompletedCreatedEmail } from "../../../lib/email.ts";

export const router: Router = express.Router();

//gets the service requests based on id
router.post(
    API.REQUESTS.VIEW.ASSIGNED.ROUTE,
    authenticate(),
    authorize("employee"),
    sanitize(API.REQUESTS.VIEW.ASSIGNED.REQ),
    async (req: SanitizedRequest<typeof API.REQUESTS.VIEW.ASSIGNED.REQ>, res: Response) => {
        //makes the request to the database to get all the requests that belong to a specific user id
        const raw = await PrismaClient.serviceRequest.findMany({
            where: {
                assignedToId: req.body.id,
                NOT: {
                    assignedToId: null,
                },
            },
            //makes sure to include all of the additional values
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
        //tries to validate the data to make sure its the right typing
        const data = validateArbitratyData(raw, API.REQUESTS.VIEW.ASSIGNED.RES);
        //checks for errors and if not send the data to front end
        if (data.err) {
            res.status(400).send(data.val);
        } else {
            res.status(200).json(data.val);
        }
    }
);

//updates a specific service request to finished status and sets the time that it is completed
router.post(
    API.REQUESTS.VIEW.ASSIGNED.COMPLETE.ROUTE,
    authenticate(),
    authorize("employee"),
    sanitize(API.REQUESTS.VIEW.ASSIGNED.COMPLETE.REQ),
    async (req: SanitizedRequest<typeof API.REQUESTS.VIEW.ASSIGNED.COMPLETE.REQ>, res: Response) => {
        // attempt to update the service request
        try {
            //gets the specific service request that is tied to the id of the user
            const sreq = await PrismaClient.serviceRequest.findUnique({
                where: {
                    id: req.body.serviceRequestId,
                },
                include: {
                    requestedBy: {
                        select: {
                            id: true,
                        },
                    },
                },
            });
            //if it is null throw an error
            if (sreq === null || sreq.requestedBy === null) throw new Error();
            //otherwise sets that specific service request to be resolved and set the resolve time
            await PrismaClient.serviceRequest.update({
                where: {
                    id: req.body.serviceRequestId,
                },
                data: {
                    is_resolved: true,
                    status: "Finished",
                    completed_time: new Date(Date.now()),
                },
            });
            //sends an email that says the service request is completed
            sendCompletedCreatedEmail(sreq.requestedBy.id, req.body.serviceRequestId);
            //sends the status
            res.status(200).send("OK" satisfies z.infer<typeof API.REQUESTS.VIEW.ASSIGNED.COMPLETE.RES>);
        } catch (error) {
            // most of the time, the error here will be because no record existed in the db for the id, which is a client error. prisma doesn't provide any information on the type of the RecordNotFound exception, so I have no way of knowing whether it for sure was that or if it was a server error :( so ive decided to assume its always a client error
            res.status(400).send("Bad request");
        }
    }
);
