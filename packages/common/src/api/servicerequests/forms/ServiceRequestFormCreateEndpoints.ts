import { z } from "zod";

export const ServiceRequestFormCreateEndpoints = {
    LANGUAGE: {
        ROUTE: "/api/language/create",
        REQ: z.object({
            requesterId: z.number(),
            assignedId: z.number().optional(),
            hospitalName: z.string().min(2),
            department: z.string().min(2),
            urgency_level: z.enum(["Low", "Medium", "High", "Emergency"]),
            note: z.string(),

            age: z.number(),
            language: z.string().min(2),
        }),
        RES: z.literal("OK"),
    },
    PATIENTMEAL: {
        ROUTE: "/api/foodrequests/create",
        REQ: z.object({
            requesterId: z.number(),
            assignedId: z.number().optional(),
            hospitalName: z.string().min(2),
            department: z.string().min(2),
            urgency_level: z.enum(["Low", "Medium", "High", "Emergency"]),
            note: z.string(),

            patientName: z.string().min(2, { message: "Please enter your full name" }),
            mealOptions: z.string().min(2),
            drinkOptions: z.string(),
            allergies: z.string().min(0),
        }),
        RES: z.literal("OK"),
    },
    MAINTENANCE: {
        ROUTE: "/api/servicereqs/create",
        REQ: z.object({
            requesterId: z.number(),
            assignedId: z.number().optional(),
            hospitalName: z.string().min(2),
            department: z.string().min(2),
            urgency_level: z.enum(["Low", "Medium", "High", "Emergency"]),
            note: z.string(),

            typeOfRequest: z.string(),
            facility: z.string().min(1),
        }),
        RES: z.literal("OK"),
    },
    AUDIOVISUAL: {
        ROUTE: "/api/audiorequests/create",
        REQ: z.object({
            requesterId: z.number(),
            assignedId: z.number().optional(),
            hospitalName: z.string().min(2),
            department: z.string().min(2),
            urgency_level: z.enum(["Low", "Medium", "High", "Emergency"]),
            note: z.string(),

            AudioOrVisualNeeded: z.enum(["Audio", "Visual"]),
        }),
        RES: z.literal("OK"),
    },
    MEDICALDEVICE: {
        ROUTE: "/api/devicerequest/create",
        REQ: z.object({
            requesterId: z.number(),
            assignedId: z.number().optional(),
            hospitalName: z.string().min(2),
            department: z.string().min(2),
            urgency_level: z.enum(["Low", "Medium", "High", "Emergency"]),
            note: z.string(),

            deviceNeeded: z.string().min(1),
        }),
        RES: z.literal("OK"),
    },
    TRANSPORTATION: {
        ROUTE: "/api/transportationrequest/create",
        REQ: z.object({
            requesterId: z.number(),
            assignedId: z.number().optional(),
            hospitalName: z.string().min(2),
            department: z.string().min(2),
            urgency_level: z.enum(["Low", "Medium", "High", "Emergency"]),
            note: z.string(),

            destination: z.string(),
            vehicle: z.string(),
        }),
        RES: z.literal("OK"),
    },
} as const;

export const ServiceRequestFormUpdateEndpoints = {
    LANGUAGE: {
        ROUTE: "/api/language/update",
        REQ: z.object({
            requestId: z.number(),
            requesterId: z.number(),
            assignedId: z.number().optional(),
            hospitalName: z.string().min(2),
            department: z.string().min(2),
            urgency_level: z.enum(["Low", "Medium", "High", "Emergency"]),
            note: z.string(),

            age: z.number(),
            language: z.string().min(2),
        }),
        RES: z.literal("OK"),
    },
    PATIENTMEAL: {
        ROUTE: "/api/foodrequests/update",
        REQ: z.object({
            requestId: z.number(),
            requesterId: z.number(),
            assignedId: z.number().optional(),
            hospitalName: z.string().min(2),
            department: z.string().min(2),
            urgency_level: z.enum(["Low", "Medium", "High", "Emergency"]),
            note: z.string(),

            patientName: z.string().min(2, { message: "Please enter your full name" }),
            mealOptions: z.string().min(2),
            drinkOptions: z.string(),
            allergies: z.string().min(0),
        }),
        RES: z.literal("OK"),
    },
    MAINTENANCE: {
        ROUTE: "/api/servicereqs/update",
        REQ: z.object({
            requestId: z.number(),
            requesterId: z.number(),
            assignedId: z.number().optional(),
            hospitalName: z.string().min(2),
            department: z.string().min(2),
            urgency_level: z.enum(["Low", "Medium", "High", "Emergency"]),
            note: z.string(),

            typeOfRequest: z.string(),
            facility: z.string().min(1),
        }),
        RES: z.literal("OK"),
    },
    AUDIOVISUAL: {
        ROUTE: "/api/audiorequests/update",
        REQ: z.object({
            requestId: z.number(),
            requesterId: z.number(),
            assignedId: z.number().optional(),
            hospitalName: z.string().min(2),
            department: z.string().min(2),
            urgency_level: z.enum(["Low", "Medium", "High", "Emergency"]),
            note: z.string(),

            AudioOrVisualNeeded: z.enum(["Audio", "Visual"]),
        }),
        RES: z.literal("OK"),
    },
    MEDICALDEVICE: {
        ROUTE: "/api/devicerequest/update",
        REQ: z.object({
            requestId: z.number(),
            requesterId: z.number(),
            assignedId: z.number().optional(),
            hospitalName: z.string().min(2),
            department: z.string().min(2),
            urgency_level: z.enum(["Low", "Medium", "High", "Emergency"]),
            note: z.string(),

            deviceNeeded: z.string().min(1),
        }),
        RES: z.literal("OK"),
    },
    TRANSPORTATION: {
        ROUTE: "/api/transportationrequest/update",
        REQ: z.object({
            requestId: z.number(),
            requesterId: z.number(),
            assignedId: z.number().optional(),
            hospitalName: z.string().min(2),
            department: z.string().min(2),
            urgency_level: z.enum(["Low", "Medium", "High", "Emergency"]),
            note: z.string(),

            destination: z.string(),
            vehicle: z.string(),
        }),
        RES: z.literal("OK"),
    },
} as const;
