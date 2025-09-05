import { z } from "zod";

const serviceRequest = z.object({
    id: z.number(),
    requester_name: z.string(),
    location: z.string().nullable().optional(),
    request_time: z.date(),
    status: z.string(),
    note: z.string(),
    is_resolved: z.boolean(),
    type: z.enum([
        "MaintenanceRequest",
        "LanguageRequest",
        "DeviceRequest",
        "FoodServiceRequest",
        "AudioVisualRequest",
        "TransportationRequest",
    ]),
    completed_time: z.date().nullable().optional(),
    hospital: z.string(),
    urgency_level: z.string(),
    requestedById: z.number().nullable().optional(),
    assignedToId: z.number().optional().nullable(),
    assignedTo: z
        .object({
            firstName: z.string(),
            lastName: z.string(),
        })
        .optional(),

    maintenanceRequest: z
        .object({
            id: z.number(),
            facility: z.string(),
            typeOfRequest: z.string(),
            serviceRequestId: z.number(),
        })
        .nullable(),

    foodServiceRequest: z
        .object({
            id: z.number(),
            patientName: z.string(),
            meal: z.string(),
            drink: z.string(),
            allergies: z.string(),
            serviceRequestId: z.number(),
        })
        .nullable(),

    deviceRequest: z
        .object({
            id: z.number(),
            device_needed: z.string(),
            serviceRequestId: z.number(),
        })
        .nullable(),

    languageRequest: z
        .object({
            id: z.number(),
            language: z.string(),
            age: z.number(),
            serviceRequestId: z.number(),
        })
        .nullable(),

    audiovisualRequest: z
        .object({
            id: z.number(),
            AudioOrVisualNeeded: z.string(),
            serviceRequestId: z.number(),
        })
        .nullable(),

    transportationRequest: z
        .object({
            id: z.number(),
            destination: z.string(),
            vehicle: z.string(),
            serviceRequestId: z.number(),
        })
        .nullable(),
});

export const SERVICEREQUEST_RESPONSE_SCHEMA_WITH_ASSIGNED = z.array(
    serviceRequest
        .extend({
            assignedTo: z.object({ firstName: z.string(), lastName: z.string() }).nullable(),
        })
        .optional()
);

export const SERVICEREQUEST_RESPONSE_SCHEMA = z.array(serviceRequest);
