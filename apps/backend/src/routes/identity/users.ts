import { Request, Response, Router } from "express";
import { API } from "common/src/api/endpoints.ts";
import { authenticate, authorize } from "../../lib/auth.ts";
import PrismaClient from "../../bin/prisma-client.ts";
import { sanitize, SanitizedRequest, validateArbitratyData } from "../../lib/sanitization.ts";
import { z } from "zod";
import { Maybe } from "common/src/maybe.ts";

export const router: Router = Router();
const db = PrismaClient;

router.get(API.USERS.ROUTE, authenticate(), authorize("guest"), async (req: Request, res: Response) => {
    // ! is fine here, we will never reach this point if auth fails
    const { sub } = req.auth!.payload;
    // get the data from the db. this may fail, because not all users are in the db. so we need to account for that.
    const raw = await db.employee.findUnique({
        where: {
            uuid: sub,
        },
    });
    // ensure the user's record exists and contains valid information
    const data = validateArbitratyData(raw, API.USERS.RES.strip());
    // NOTE: NEVER NEVER NEVER NEVER NEVER return data.val when data.err is true. that causes potential data exfiltration which is security no no.
    if (data.err) {
        res.status(400).send("Bad request");
    } else {
        res.status(200).json(data.val);
    }
});

router.get(API.USERS.VERBOSE.ROUTE, authenticate(), authorize("employee"), async (req: Request, res: Response) => {
    const { sub } = req.auth!.payload;
    // unlike the top, this will NOT fail! since all employees and admins are in the db.
    const raw = await db.employee.findUnique({
        where: {
            uuid: sub,
        },
    });
    const data = validateArbitratyData(raw, API.USERS.VERBOSE.RES.strip());
    if (data.err) {
        res.status(400).send("Bad request");
    } else {
        res.status(200).json(data.val);
    }
});

const userWithUuid = z.object({
    uuid: z.string(),
});
type UpdateableUser = z.infer<typeof API.USERS.UPDATE.REQ> & z.infer<typeof userWithUuid>;

/**
 * Here, we're using some kinda bad and unclear wording about the concept of "updating" a user. I'm doing this because it doesn't matter. Anyway, "updating" a user also supports creating a user. We upsert a user based on its ID to do this. Since we have no control over IDs, if we don't have one, we use -1 so the database doesn't find any user with that ID (the lowest ID is 0).
 * @param user The user to either update or create. If the ID is null, the database will create it, otherwise the database will update the corresponding record.
 */
const updateUser = async (user: UpdateableUser) => {
    try {
        await db.employee.upsert({
            where: {
                id: user.id ?? -1,
            },
            create: {
                firstName: user.firstName,
                lastName: user.lastName,
                userName: user.userName,
                password: "COLUMN DEPRECATED",
                email: user.email,
                phoneNumber: user.phoneNumber,
                position: user.position,
                department: user.department,
                uuid: user.uuid,
            },
            update: {
                firstName: user.firstName,
                lastName: user.lastName,
                userName: user.userName,
                password: "COLUMN DEPRECATED",
                email: user.email,
                phoneNumber: user.phoneNumber,
                position: user.position,
                department: user.department,
                uuid: user.uuid,
            },
        });
        return {
            err: false,
            val: null,
        } satisfies Maybe<null, any>;
    } catch (e) {
        return {
            err: true,
            val: e,
        } satisfies Maybe<null, any>;
    }
};

router.post(
    API.USERS.UPDATE.ROUTE,
    authenticate(),
    authorize("admin"),
    sanitize(API.USERS.UPDATE.REQ),
    async (req: SanitizedRequest<typeof API.USERS.UPDATE.REQ>, res: Response) => {
        // ! is fine here, we will never reach this point if auth fails
        const { sub } = req.auth!.payload;
        const dbResult = await updateUser({
            ...req.body,
            uuid: sub as string,
        });
        if (dbResult.err) {
            res.status(500).send("Internal server error");
        } else {
            res.status(200).send("OK" satisfies z.infer<typeof API.USERS.UPDATE.RES>);
        }
    }
);

router.post(
    API.USERS.UPDATE.ME.ROUTE,
    authenticate(),
    authorize("employee"),
    sanitize(API.USERS.UPDATE.ME.REQ),
    async (req: SanitizedRequest<typeof API.USERS.UPDATE.ME.REQ>, res: Response) => {
        // ! is fine here, we will never reach this point if auth fails
        const { sub } = req.auth!.payload;
        // get the data from the db. this may fail, because not all users are in the db. so we need to account for that.
        const raw = await db.employee.findUnique({
            where: {
                uuid: sub,
            },
        });
        // ensure the user's record exists and contains valid information
        const data = validateArbitratyData(raw, API.USERS.VERBOSE.RES.strip());
        if (data.err) {
            console.log(data.val);
            res.status(400).send("Bad request");
        } else {
            const dbResult = await updateUser({
                ...data.val,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                phoneNumber: req.body.phoneNumber,
            });
            if (dbResult.err) {
                res.status(500).send("Internal server error");
            } else {
                res.status(200).send("OK" satisfies z.infer<typeof API.USERS.UPDATE.ME.RES>);
            }
        }
    }
);
