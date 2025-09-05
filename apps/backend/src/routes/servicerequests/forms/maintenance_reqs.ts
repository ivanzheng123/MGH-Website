import express, { Response, Router } from "express";
import PrismaClient from "../../../bin/prisma-client.ts";
import { API } from "common/src/api/endpoints.ts";
import { sanitize, SanitizedRequest } from "../../../lib/sanitization.ts";
import { authenticate, authorize } from "../../../lib/auth.ts";
import { sendNewAssignedEmail, sendUpdatedAssignedEmail } from "../../../lib/email.ts";

export const router: Router = express.Router();

router.post(
    API.REQUESTS.CREATE.MAINTENANCE.ROUTE,
    authenticate(),
    authorize("employee"),
    sanitize(API.REQUESTS.CREATE.MAINTENANCE.REQ),
    async (req: SanitizedRequest<typeof API.REQUESTS.CREATE.MAINTENANCE.REQ>, res: Response) => {
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
                        type: "MaintenanceRequest",
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
                await PrismaClient.maintenanceRequest.create({
                    data: {
                        serviceRequest: {
                            connect: { id: +request.id },
                        },
                        facility: req.body.facility,
                        typeOfRequest: req.body.typeOfRequest,
                    },
                });
                res.status(200).send("OK");
            } catch (error) {
                console.log(error);
                res.status(500).send("ERROR");
            }
        }
    }
);

router.post(
    API.REQUESTS.UPDATE.MAINTENANCE.ROUTE,
    authenticate(),
    authorize("employee"),
    sanitize(API.REQUESTS.UPDATE.MAINTENANCE.REQ),
    async (req: SanitizedRequest<typeof API.REQUESTS.UPDATE.MAINTENANCE.REQ>, res: Response) => {
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
                        type: "MaintenanceRequest",
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
                await PrismaClient.maintenanceRequest.deleteMany({
                    where: {
                        serviceRequest: {
                            id: request.id,
                        },
                    },
                });
                await PrismaClient.maintenanceRequest.create({
                    data: {
                        serviceRequest: {
                            connect: { id: request.id },
                        },
                        facility: req.body.facility,
                        typeOfRequest: req.body.typeOfRequest,
                    },
                });

                res.status(200).send("OK");
            } catch (error) {
                res.status(500).send("ERORR");
            }
        }
    }
);
