import express, { Response } from "express";
import PrismaClient from "../../../bin/prisma-client.ts";
import { API } from "common/src/api/endpoints.ts";
import { authenticate, authorize } from "../../../lib/auth.ts";
import { sanitize, SanitizedRequest } from "../../../lib/sanitization.ts";
import { z } from "zod";
import { sendNewAssignedEmail, sendUpdatedAssignedEmail } from "../../../lib/email";

export const router = express.Router();

router.post(
    API.REQUESTS.CREATE.TRANSPORTATION.ROUTE,
    authenticate(),
    authorize("employee"),
    sanitize(API.REQUESTS.CREATE.TRANSPORTATION.REQ),
    async (req: SanitizedRequest<typeof API.REQUESTS.CREATE.TRANSPORTATION.REQ>, res: Response) => {
        const requesterInfo = await PrismaClient.employee.findUnique({
            where: {
                id: req.body.requesterId,
            },
        });
        if (requesterInfo === null) {
            res.status(400).json("Bad request");
        } else {
            try {
                // create general service request record
                const request = await PrismaClient.serviceRequest.create({
                    data: {
                        requester_name: `${requesterInfo.firstName} ${requesterInfo.lastName}`,
                        location: req.body.department,
                        request_time: new Date(),
                        status: "Assigned",
                        note: req.body.note,
                        is_resolved: false,
                        type: "TransportationRequest",
                        hospital: req.body.hospitalName,
                        urgency_level: req.body.urgency_level,
                        requestedBy: { connect: { id: req.body.requesterId } },
                    },
                });
                if (req.body.assignedId !== undefined) {
                    await PrismaClient.serviceRequest.update({
                        where: {
                            id: request.id,
                        },
                        data: {
                            assignedTo: { connect: { id: req.body.assignedId } },
                        },
                    });
                    sendNewAssignedEmail(req.body.assignedId, request.id);
                }
                await PrismaClient.transportationRequest.create({
                    data: {
                        serviceRequest: {
                            connect: { id: request.id },
                        },
                        destination: req.body.destination,
                        vehicle: req.body.vehicle,
                    },
                });
                res.status(200).send("OK" satisfies z.infer<typeof API.REQUESTS.CREATE.TRANSPORTATION.RES>);
            } catch (error) {
                console.error(error);
                res.status(400).send("Bad request");
            }
        }
    }
);

router.post(
    API.REQUESTS.UPDATE.TRANSPORTATION.ROUTE,
    authenticate(),
    authorize("employee"),
    sanitize(API.REQUESTS.UPDATE.TRANSPORTATION.REQ),
    async (req: SanitizedRequest<typeof API.REQUESTS.UPDATE.TRANSPORTATION.REQ>, res: Response) => {
        const requesterInfo = await PrismaClient.employee.findUnique({
            where: {
                id: req.body.requesterId,
            },
        });
        if (requesterInfo === null) {
            res.status(400).json("Bad request");
        } else {
            try {
                // create general service request record
                const request = await PrismaClient.serviceRequest.update({
                    where: {
                        id: req.body.requestId,
                    },
                    data: {
                        requester_name: `${requesterInfo.firstName} ${requesterInfo.lastName}`,
                        location: req.body.department,
                        note: req.body.note,
                        type: "TransportationRequest",
                        hospital: req.body.hospitalName,
                        urgency_level: req.body.urgency_level,
                        requestedBy: { connect: { id: req.body.requesterId } },
                    },
                });
                if (req.body.assignedId !== undefined) {
                    await PrismaClient.serviceRequest.update({
                        where: {
                            id: request.id,
                        },
                        data: {
                            assignedTo: { connect: { id: req.body.assignedId } },
                        },
                    });
                    sendUpdatedAssignedEmail(req.body.assignedId, request.id);
                }
                await PrismaClient.transportationRequest.deleteMany({
                    where: {
                        serviceRequest: {
                            id: request.id,
                        },
                    },
                });
                await PrismaClient.transportationRequest.create({
                    data: {
                        serviceRequest: {
                            connect: { id: request.id },
                        },
                        destination: req.body.destination,
                        vehicle: req.body.vehicle,
                    },
                });
                res.status(200).send("OK" satisfies z.infer<typeof API.REQUESTS.CREATE.TRANSPORTATION.RES>);
            } catch (error) {
                res.status(400).send("Bad request");
            }
        }
    }
);
