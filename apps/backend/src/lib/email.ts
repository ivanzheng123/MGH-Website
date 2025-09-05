import Mailgun from "mailgun.js";
import formData from "form-data";
import PrismaClient from "../bin/prisma-client.ts";

//initializes the mailgun client and inserts the api key
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY as string,
});

//a function to create and send a brand new email
export async function email(subject: string, text: string, to: string, from: string = "noreply@massgeneralbrigham.co") {
    await mg.messages.create(process.env.MAILGUN_DOMAIN as string, {
        from: `Mass General Brigham <${from}>`,
        to,
        subject,
        text,
    });
}
//gets the employee based on id (only for use inside these other functions)
export const INTERNAL_getEmployeeFromId = async (id: number) => {
    return await PrismaClient.employee.findUnique({
        where: {
            id,
        },
    });
};

//sends email to specific employee when a new service request has been assigned
export const sendNewAssignedEmail = async (employeeId: number, requestId: number) => {
    const emp = await INTERNAL_getEmployeeFromId(employeeId);
    if (emp !== null) {
        const to = emp.email;
        await email(
            "You've been assigned!",
            `You have been assigned to service request ${requestId}. Please visit https://massgeneralbrigham.co/view/assignedservicereqs to view it.`,
            to
        );
    }
};

//sends an email to the employee when the service request is updated
export const sendUpdatedAssignedEmail = async (employeeId: number, requestId: number) => {
    const emp = await INTERNAL_getEmployeeFromId(employeeId);
    if (emp !== null) {
        const to = emp.email;
        await email(
            `Update on request #${requestId}`,
            `Service request #${requestId} has just been updated, and you have either been assigned to it or were just assigned to it. Please visit https://massgeneralbrigham.co/view/assignedservicereqs to view it.`,
            to
        );
    }
};

//sends an email to the employee when the service request they are
export const sendCompletedCreatedEmail = async (employeeId: number, requestId: number) => {
    const emp = await INTERNAL_getEmployeeFromId(employeeId);
    if (emp !== null) {
        const to = emp.email;
        await email(`Request #${requestId} Resolved`, `Your service request (#${requestId}) has been resolved.`, to);
    }
};
