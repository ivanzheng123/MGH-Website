import express, { Response } from "express";
import PrismaClient from "../../bin/prisma-client.ts";
import { API } from "common/src/api/endpoints.ts";
import { sanitize, SanitizedRequest } from "../../lib/sanitization.ts";
import { authenticate, authorize } from "../../lib/auth.ts";
import { z } from "zod";

export const router = express.Router();
const db = PrismaClient;

router.post(
    API.SETTINGS.HOSPITALDATA.IMPORT.DIRECTORY.ROUTE,
    authenticate(),
    authorize("admin"),
    sanitize(API.SETTINGS.HOSPITALDATA.IMPORT.DIRECTORY.REQ),
    async (req: SanitizedRequest<typeof API.SETTINGS.HOSPITALDATA.IMPORT.DIRECTORY.REQ>, res: Response) => {
        try {
            for (const hospital of req.body) {
                const createdHospital = await db.hospital.upsert({
                    where: {
                        identifier: hospital.identifier,
                    },
                    update: {
                        name: hospital.name,
                        address: hospital.address,
                    },
                    create: {
                        name: hospital.name,
                        address: hospital.address,
                        identifier: hospital.identifier,
                    },
                });
                for (const building of hospital.buildings) {
                    const createdBuilding = await db.building.create({
                        data: {
                            name: building.name,
                            hospital: {
                                connect: {
                                    id: createdHospital.id,
                                },
                            },
                        },
                    });
                    for (const department of building.departments) {
                        await db.department.create({
                            data: {
                                name: department.name,
                                floor: department.floor,
                                building: {
                                    connect: {
                                        id: createdBuilding.id,
                                    },
                                },
                            },
                        });
                    }
                    for (const floorplan of building.floorPlans) {
                        await db.floorPlan.create({
                            data: {
                                floor: floorplan.floor,
                                imageUrl: floorplan.imageUrl,
                                building: {
                                    connect: {
                                        id: createdBuilding.id,
                                    },
                                },
                            },
                        });
                    }
                }
            }
            res.status(200).send("OK" satisfies z.infer<typeof API.SETTINGS.HOSPITALDATA.IMPORT.DIRECTORY.RES>);
        } catch (error) {
            res.status(400).json("Bad request");
        }
    }
);
