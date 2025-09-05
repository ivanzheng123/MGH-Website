/* eslint @typescript-eslint/no-explicit-any: 0*/
import { NextFunction, Request, Response } from "express";
import { fromError, ValidationError } from "zod-validation-error";
import { z, ZodType } from "zod";
import { Maybe } from "common/src/maybe.ts";

/**
 * This function allows one to sanitize any arbitrary data according to a Zod schema.
 */
export const validateArbitratyData = <T extends ZodType>(data: any, schema: T): Maybe<z.infer<T>, ValidationError> => {
    const result = schema.safeParse(data);
    if (!result.success) {
        return {
            val: fromError(result.error),
            err: true,
        };
    }
    return {
        val: result.data,
        err: false,
    };
};

/**
 * This generates a handler that sanitizes a function according to some schema. You should call it before any implementation handlers. It will respond early with 400 if the sanitization fails.
 */
export const sanitize = <T extends ZodType>(schema: T) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // we only care about the body for now. in the future we might do more though
        const result = schema.safeParse(req.body);
        if (!result.success) {
            // http status 400 is what we want to return since the client messed up. see https://httpstatuses.io/400
            res.status(400).json({
                error: "Bad request",
                // fromError writes an error message for us, so we can just return it
                message: fromError(result.error).toString(),
            });
            next("route");
            return;
        }
        // zod may transform sanitized data, so we gotta update it before calling logic handlers
        // this also protects against non-strict types, because it will strip members not defined in the schema :)
        req.body = result.data;
        next();
    };
};

export type SanitizedRequest<T extends ZodType> = Omit<Request, "body"> & {
    body: z.infer<T>;
};
