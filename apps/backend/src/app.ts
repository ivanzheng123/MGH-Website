import { HttpError } from "http-errors";
import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import PrismaClient from "./bin/prisma-client.ts";
import * as process from "node:process";
import { findRouters } from "./lib/routing.ts";
import employeeSeedData, { EmployeeSeed } from "./SeedData/employee-data.ts";
import pathfindingNodes from "./SeedData/pathfinding-data.ts";

const app: Express = express(); // Setup the backend

const db = PrismaClient;

type EmployeeReturn = {
    id: number;
    uuid: string | null;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    position: string;
    department: string | null;
};

export type RequestType =
    | "MaintenanceRequest"
    | "LanguageRequest"
    | "DeviceRequest"
    | "FoodServiceRequest"
    | "AudioVisualRequest"
    | "TransportationRequest";

export interface ServiceRequest {
    id: number;
    requester_name: string;
    location?: string | null;
    request_time: Date;
    status: string;
    note: string;
    is_resolved: boolean;
    type: RequestType;
    completed_time?: Date | null;
    hospital: string;
    urgency_level: string;

    requestedById?: number | null;
    assignedToId?: number | null;

    maintenanceRequest?: MaintenanceRequest | null;
    foodServiceRequest?: FoodServiceRequest | null;
    deviceRequest?: DeviceRequest | null;
    languageRequest?: LanguageRequest | null;
    audiovisualRequest?: AudioVisualRequest | null;
}

export interface AudioVisualRequest {
    id: number;
    AudioOrVisualNeeded: string;
    serviceRequestId: number;
    serviceRequest: ServiceRequest;
}

export interface MaintenanceRequest {
    id: number;
    facility: string;
    serviceRequestId: number;
    serviceRequest: ServiceRequest;
}

export interface DeviceRequest {
    id: number;
    device_needed: string;
    serviceRequestId: number;
    serviceRequest: ServiceRequest;
}

export interface FoodServiceRequest {
    id: number;
    patientName: string;
    meal: string;
    drink: string;
    allergies: string;
    serviceRequestId: number;
    serviceRequest: ServiceRequest;
}

export interface LanguageRequest {
    id: number;
    serviceRequestId: number;
    serviceRequest: ServiceRequest;
    language: string;
    age: number;
}

const main = async () => {
    console.log("Seeding process started...");

    await clearDatabase(db, [
        "maintenanceRequest",
        "serviceRequest",
        "forumReply",
        "forumPost",
        "employee",
        "pathfinding",
        "algoTimes",
        "algorithmSetting",
        "floorPlan",
        "department",
        "building",
        "hospital",
        "calendarEvent"
    ]);

    try {
        console.log("Starting employee seeding...");
        const employees: EmployeeReturn[] = await createEmployeeSeedData(db, employeeSeedData);
        console.log(`Seeded ${employees.length} employees.`);

        console.log("Seeding pathfinding nodes...");
        await PrismaClient.pathfinding.createMany({
            data: pathfindingNodes,
        });
        console.log(`Seeded ${pathfindingNodes.length} pathfinding nodes.`);

        console.log("Creating hospital...");
        const hospital = await PrismaClient.hospital.create({
            data: {
                name: "Brigham and Women's Hospital",
                address: "55 Fruit Street, Boston, MA",
                identifier: "MGH001",
            },
        });
        console.log(`Created hospital with ID: ${hospital.id}`);

        console.log("Creating building...");
        const building = await PrismaClient.building.create({
            data: {
                name: "Main Building A",
                hospitalId: hospital.id,
            },
        });
        console.log(`Created building with ID: ${building.id}`);

        console.log("Creating algorithm settings...");
        await PrismaClient.algorithmSetting.create({
            data: {
                id: 1,
                preferredAlgorithm: "A*",
            },
        });
        console.log("Algorithm settings created.");

        console.log("Creating floor plans...");
        await PrismaClient.floorPlan.createMany({
            data: [
                {
                    floor: 1,
                    imageUrl: "/api/floorplans/FirstFloorPP.png",
                    buildingId: building.id,
                },
                { floor: 3, imageUrl: "/api/floorplans/ThirdFloorPP.png", buildingId: building.id },
                { floor: 4, imageUrl: "/api/floorplans/FourthFloorPP.png", buildingId: building.id },
            ],
        });
        console.log("Floor plans seeded.");

        console.log("Creating departments...");
        await PrismaClient.department.createMany({
            data: [
                { name: "Cardiology", floor: 1, buildingId: building.id },
                { name: "Neurology", floor: 2, buildingId: building.id },
                { name: "Oncology", floor: 3, buildingId: building.id },
            ],
        });
        console.log("Departments seeded.");

        const NUM_REQUESTS = employeeSeedData.length * 100;

        console.log("Seeding service requests...");

        const rooms: [string, string][] = [
            // 20 Patriot Place (Floor 1)
            ["Arthroplasty", "Patriot Place"],
            ["ENT", "Patriot Place"],
            ["Pain Medicine", "Patriot Place"],

            // 22 Patriot Place (Floors 3 & 4)
            ["Gastroenterology", "Patriot Place"],
            ["Pulmonology", "Patriot Place"],
            ["Primary Care", "Patriot Place"],

            // Chestnut Hill
            ["Crohn’s and Colitis Center", "Chestnut Hill"],
            ["Laboratory", "Chestnut Hill"],
            ["Radiology, MRI/CT scan", "Chestnut Hill"],

            // Faulkner
            ["Emergency Department", "Faulkner"],
            ["Food Services", "Faulkner"],
            ["Cardiology", "Faulkner"],

            // Main Campus
            ["Endoscopy", "Main Campus"],
            ["Gynecologic Oncology", "Main Campus"],
            ["Infectious Disease", "Main Campus"],
            ["Dana-Farber Cancer Center Inpatient Hospital", "Main Campus"],
        ];

        const status: string[] = [
            "Pending",
            "In Progress",
            "Awaiting Approval",
            "Approved",
            "Assigned",
            "Scheduled",
            "On Hold",
            "Completed",
            "Rejected",
            "Cancelled",
            "Escalated",
            "Awaiting Parts",
            "Closed",
        ];

        const patientNames = [
            "Emily Thompson",
            "James Carter",
            "Sophia Nguyen",
            "Liam Anderson",
            "Olivia Patel",
            "Noah Rodriguez",
            "Ava Kim",
            "William Johnson",
            "Isabella Martinez",
            "Benjamin Lee",
            "Mia Robinson",
            "Lucas Walker",
            "Charlotte Lewis",
            "Henry Scott",
            "Amelia Adams",
            "Ethan Evans",
            "Harper Hall",
            "Alexander Wright",
            "Ella Turner",
            "Daniel Green",
        ];

        const now = new Date();
        const pastYear = new Date();
        pastYear.setDate(now.getDate() - 365);

        const serviceRequests: ServiceRequest[] = [];
        const requestTypes = [
            "MaintenanceRequest",
            "LanguageRequest",
            "DeviceRequest",
            "FoodServiceRequest",
            "AudioVisualRequest",
            "TransportationRequest",
        ] as const;

        type RequestType = (typeof requestTypes)[number];

        for (let i = 0; i < NUM_REQUESTS; i++) {
            const requester = employees[i % employees.length];
            const type = randomFromArray(requestTypes);
            const room = randomFromArray(rooms);

            const assignSomeone = Math.random() < 0.5;
            const is_resolved = Math.random() < 0.5;
            let assignedToId: number | undefined = undefined;

            if (assignSomeone) {
                const otherEmployees = employees.filter((e) => e.id !== requester.id);
                const assignee = randomFromArray(otherEmployees);
                assignedToId = assignee.id;
            }
            const randomDate = new Date(pastYear.getTime() + Math.random() * (now.getTime() - pastYear.getTime()));
            const randomCompleteDate = new Date(
                randomDate.getTime() + Math.random() * (now.getTime() - randomDate.getTime())
            );
            const baseData = {
                requester_name: `${requester.firstName} ${requester.lastName}`,
                location: room[0],
                request_time: randomDate,
                status: randomFromArray(status),
                note: "Auto-seeded",
                type,
                is_resolved: is_resolved,
                ...(is_resolved && {
                    completed_time: randomCompleteDate,
                }),
                hospital: room[1],
                requestedBy: {
                    connect: { id: requester.id },
                },
                ...(assignedToId && {
                    assignedTo: {
                        connect: { id: assignedToId },
                    },
                }),
                urgency_level: randomFromArray(["Low", "Medium", "High"]),
            };

            const request = await db.serviceRequest.create({
                data: baseData,
            });

            switch (type) {
                case "MaintenanceRequest":
                    await db.maintenanceRequest.create({
                        data: {
                            facility: randomFromArray(["HVAC", "Lighting", "Plumbing"]),
                            serviceRequestId: request.id,
                            typeOfRequest: randomFromArray(["Plumbing", "Electrical", "Cleaning", "General"]),
                        },
                    });
                    break;

                case "LanguageRequest":
                    await db.languageRequest.create({
                        data: {
                            language: randomFromArray(["Spanish", "French", "Mandarin", "ASL"]),
                            age: Math.floor(Math.random() * 80) + 10,
                            serviceRequestId: request.id,
                        },
                    });
                    break;

                case "DeviceRequest":
                    await db.deviceRequest.create({
                        data: {
                            device_needed: randomFromArray(["Wheelchair", "IV Pump", "Monitor"]),
                            serviceRequestId: request.id,
                        },
                    });
                    break;

                case "FoodServiceRequest":
                    await db.foodServiceRequest.create({
                        data: {
                            patientName: randomFromArray(patientNames),
                            meal: randomFromArray([
                                "Chicken Noodle Soup",
                                "Spaghetti and Meatballs",
                                "Yogurt Parfait",
                                "Caesar Salad",
                                "Mac and Cheese",
                                "Flint and Meal",
                            ]),
                            drink: randomFromArray(["Milk", "Chocolate Milk", "Apple Juice", "Orange Juice", "Water", "Gatorade", "McDonald's Sprite"]),
                            allergies: randomFromArray(["", "None", "Peanuts", "Gluten"]),
                            serviceRequestId: request.id,
                        },
                    });
                    break;

                case "AudioVisualRequest":
                    await db.audioVisualRequest.create({
                        data: {
                            AudioOrVisualNeeded: randomFromArray(["Projector", "Speakers", "Microphone"]),
                            serviceRequestId: request.id,
                        },
                    });
                    break;

                case "TransportationRequest":
                    const destination = randomFromArray(rooms);
                    await db.transportationRequest.create({
                        data:{
                            destination: destination[0],
                            vehicle: randomFromArray(["Car","Hospital Bed"]),
                            serviceRequestId: request.id,
                        }
                    })
            }

            serviceRequests.push(request);
        }

        console.log(`Seeded ${serviceRequests.length} service requests.`);

        const NUM_FORUM_POSTS = 20;
        const MAX_REPLIES_PER_POST = 5;

        const forumPosts = [];
        const forumReplies = [];

        const sampleTitles = [
            "Need help with device setup",
            "Issue in break room plumbing",
            "Request for shift swap",
            "New employee onboarding tips?",
            "Policy update on service requests",
        ];

        const sampleContents = [
            "Anyone encountered this before?",
            "Please advise ASAP.",
            "This has been a recurring problem.",
            "Appreciate your input!",
            "Let me know what you think.",
        ];

        console.log("Seeding forum posts...");

        for (let i = 0; i < NUM_FORUM_POSTS; i++) {
            const author = randomFromArray(employees);

            const post = await db.forumPost.create({
                data: {
                    title: randomFromArray(sampleTitles),
                    content: randomFromArray(sampleContents),
                    authorId: author.id,
                    date: new Date(pastYear.getTime() + Math.random() * (now.getTime() - pastYear.getTime())),
                },
            });

            forumPosts.push(post);

            const numReplies = Math.floor(Math.random() * (MAX_REPLIES_PER_POST + 1));

            for (let j = 0; j < numReplies; j++) {
                const replier = randomFromArray(employees);

                const reply = await db.forumReply.create({
                    data: {
                        postId: post.id,
                        content: randomFromArray(sampleContents),
                        authorId: replier.id,
                        date: new Date(pastYear.getTime() + Math.random() * (now.getTime() - pastYear.getTime())),
                    },
                });

                forumReplies.push(reply);
            }
        }

        console.log(`Done seeding ${forumPosts.length} forum posts with ${forumReplies.length} total replies.`);
        const hospitalEvents = [
            {
                title: "Cardiology Surgery - OR 3",
                description: "Heart bypass surgery for patient MRN #84932",
            },
            {
                title: "Nurse Staff Meeting",
                description: "Monthly nurse coordination meeting in Conference Room B.",
            },
            {
                title: "Pediatric Checkups",
                description: "Routine pediatric wellness checks in Clinic Room 12.",
            },
            {
                title: "MRI Maintenance",
                description: "Scheduled service and calibration for MRI machine #2.",
            },
            {
                title: "EMT Training Session",
                description: "Emergency response simulation training in lot A.",
            },
            {
                title: "Orthopedic Consultation",
                description: "Pre-op evaluation for joint replacement in Exam Room 4.",
            },
            {
                title: "Oncology Lab Review",
                description: "Tumor board meeting for reviewing recent biopsy results.",
            },
            {
                title: "Blood Drive",
                description: "Red Cross community blood donation in Auditorium A.",
            },
            {
                title: "Radiology Staff Briefing",
                description: "Safety protocol update for imaging staff in Room 302.",
            },
            {
                title: "Mental Health Group Therapy",
                description: "Weekly support group session in Behavioral Wing Room 1.",
            },
            {
                title: "IT Infrastructure Upgrade",
                description: "Network maintenance scheduled for overnight in Data Center.",
            },
            {
                title: "Pharmacy Inventory Audit",
                description: "Quarterly drug stock verification in Main Pharmacy.",
            },
            {
                title: "Maternity Ward Tour",
                description: "Guided tour for expecting families starting in Lobby.",
            },
            {
                title: "Surgical Equipment Training",
                description: "Hands-on workshop with new laparoscopic tools, OR Wing.",
            },
            {
                title: "COVID-19 Booster Clinic",
                description: "Walk-in vaccinations available in Clinic Hall A.",
            },
            {
                title: "Cardiology Rounds",
                description: "Daily rounds led by Dr. Smith in Cardiology Unit.",
            },
            {
                title: "Patient Discharge Planning",
                description: "Care coordination meeting for upcoming discharges.",
            },
            {
                title: "ICU Case Review",
                description: "Weekly ICU patient care evaluation session.",
            },
            {
                title: "Hospital Board Meeting",
                description: "Quarterly meeting of hospital board members.",
            },
            {
                title: "Diabetes Education Seminar",
                description: "Informational session for newly diagnosed patients.",
            },
            {
                title: "Sleep Study Analysis",
                description: "Polysomnography review in Sleep Medicine Room 5.",
            },
            {
                title: "Ultrasound Machine Demo",
                description: "Vendor presentation for new diagnostic equipment.",
            },
            {
                title: "Clinical Research Ethics Training",
                description: "Mandatory seminar on patient consent and study design.",
            },
            {
                title: "Facilities Safety Inspection",
                description: "Scheduled building compliance walkthrough.",
            },
            {
                title: "Stroke Awareness Workshop",
                description: "Public outreach event in Main Lobby.",
            },
            {
                title: "Wound Care Consultation",
                description: "Assessment and treatment planning in Wound Clinic.",
            },
            {
                title: "Respiratory Therapy Workshop",
                description: "Hands-on training in Respiratory Lab Room 7.",
            },
            {
                title: "Cafeteria Menu Review",
                description: "Nutrition team meeting on new patient meal options.",
            },
            {
                title: "Intern Orientation",
                description: "First-day welcome session for new medical interns.",
            },
            {
                title: "Hospital Volunteer Recognition",
                description: "Annual appreciation event in Dining Hall.",
            }
        ];


        const eventsWithDates = hospitalEvents.map((event) => ({
            ...event,
            date: getRandomDateWithinMonthRange(-1,3),
        }));

        const result = await db.calendarEvent.createMany({
            data: eventsWithDates,
        });

        console.log(`Seeded ${result.count} calendar events.`);

        console.log("Seeding Done.");
    } catch (error) {
        console.error("Failed during seeding process:", error);
    } finally {
        await db.$disconnect();
        console.log("Prisma disconnected.");
    }

    // Setup generic middleware
    app.use(
        logger("dev", {
            stream: {
                // This is a "hack" that gets the output to appear in the remote debugger :)
                write: (msg) => console.info(msg),
            },
        })
    ); // This records all HTTP requests

    app.use(express.json()); // This processes requests as JSON
    app.use(express.urlencoded({ extended: false })); // URL parser
    app.use(cookieParser()); // Cookie parser

    // Setup routers. ALL ROUTERS MUST use /api as a start point, or they
    // won't be reached by the default proxy and prod setup
    const routers = await findRouters();
    for (const router of routers) {
        app.use("/", router);
    }
    console.log("Now using all found routers as middleware.");

    // /**
    //  * Catch all 404 errors, and forward them to the error handler
    //  */
    // app.use((req: Request, res: Response, next: NextFunction) => {
    //     // Have the next (generic error handler) process a 404 error
    //     next(createError(404));
    // });

    /**
     * Generic error handler
     */
    app.use((err: HttpError, req: Request, res: Response) => {
        // Provide the error message
        res.statusMessage = err.message;

        res.locals.error = req.app.get("env") === "development" ? err : {};

        // Reply with the error
        res.status(err.status || 500);
    });

    // let the user know we're online :)
    console.log("Server running...");
};

main()
    .then(async () => {
        await db.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await db.$disconnect();
        process.exit(1);
    });

function randomFromArray<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function createEmployeeSeedData(
    db: typeof PrismaClient,
    employeeSeedData: EmployeeSeed[]
): Promise<EmployeeReturn[]> {
    const employees: EmployeeReturn[] = [];

    for (const data of employeeSeedData) {
        const employee = await db.employee.create({ data });
        employees.push(employee);
    }

    return employees;
}

async function clearDatabase(db: typeof PrismaClient, tablesToDelete: string[]) {
    for (const tableName of tablesToDelete) {
        try {
            // @ts-ignore - index access on db works here
            await db[tableName].deleteMany({});
            console.log(`Deleted '${tableName}' Table.`);
        } catch (err) {
            console.warn(` Failed to delete '${tableName}':`, err);
        }
    }

    console.log("Cleared Entire Database");
}

function getRandomDateWithinMonthRange(startMonthsFromNow: number, endMonthsFromNow: number): Date {
    const now = new Date();
    const startDate = new Date(now.getTime() + startMonthsFromNow * 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(now.getTime() + endMonthsFromNow * 30 * 24 * 60 * 60 * 1000);
    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    return new Date(randomTime);
}


// Export the backend, so that www.ts can start it
export default app;
