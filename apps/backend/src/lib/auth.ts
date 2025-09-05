import { auth } from "express-oauth2-jwt-bearer";
import { EndpointScope } from "common/src/api/endpoints.ts";
import { NextFunction, Request, Response } from "express";
import PrismaClient from "../bin/prisma-client.ts";
import { validateArbitratyData } from "./sanitization.ts";
import { z } from "zod";

/**
 * Authenticates a request using Auth0. Responds with 401 on failure.
 */
export const authenticate = () => {
    return auth({
        audience: "https://massgeneralbrigham.co/api",
        issuerBaseURL: "https://auth.massgeneralbrigham.co",
    });
};

/**
 * Authorizes a request by comparing the authenticated account's scope to the required scope. Responds with 403 on failure.
 * @param scope The scope required to access this resource
 */
export const authorize = (scope: EndpointScope) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // ! is fine here, we will never reach this point if auth fails
        const { sub } = req.auth!.payload;
        // get the data from the db. this may fail, because not all users are in the db. so we need to account for that.
        // (not all of them are in the db because guests are only in the auth0 db, while employees and admins are in this one too)
        const raw = await PrismaClient.employee.findUnique({
            where: {
                uuid: sub,
            },
        });
        // validate db data against the required position attribute. this is how we deal with users not being in the db
        const data = validateArbitratyData(
            raw,
            z.object({
                position: z.string(),
            })
        );
        // NOTE: NEVER NEVER NEVER NEVER NEVER return data.val when data.err is true. that causes potential data exfiltration which is security no no.
        if (data.err) {
            res.status(403).send("Unauthorized");
            next("route");
        } else {
            let scopes: string[];
            switch (scope) {
                case "admin": {
                    scopes = ["admin"];
                    break;
                }
                case "employee": {
                    scopes = ["admin", "employee"];
                    break;
                }
                default: {
                    scopes = [];
                }
            }
            if (scopes.length === 0 || new Set(scopes).has(scope)) {
                next();
            } else {
                res.status(403).send("Unauthorized");
                next("route");
            }
        }
    };
};
