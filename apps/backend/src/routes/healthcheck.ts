import express, { Request, Response, Router } from "express";
import { API } from "common/src/api/endpoints.ts";

export const router: Router = express.Router();

router.get(API.HEALTHCHECK.ROUTE, (req: Request, res: Response) => {
    res.sendStatus(200).send("OK"); // Send an HTTP 200 Code (OK)
});
