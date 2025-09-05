import express, { Request, Response, Router } from "express";
import PrismaClient from "../../../bin/prisma-client.ts";
import { API } from "common/src/api/endpoints";
import { authenticate, authorize } from "../../../lib/auth.ts";
import { validateArbitratyData } from "../../../lib/sanitization.ts";

export const router: Router = express.Router();

// /api/stats/summary
router.get(API.STATS.SUMMARY.ROUTE, authenticate(), authorize("admin"), async (req: Request, res: Response) => {
    try {
        const total = await PrismaClient.serviceRequest.count();
        const completed = await PrismaClient.serviceRequest.count({ where: { is_resolved: true } });

        const result = { total, completed };
        const data = validateArbitratyData(result, API.STATS.SUMMARY.TYPE.RES);
        if (data.err) {
            res.status(500).send("Internal server error");
        } else {
            res.status(200).json(data.val);
        }
    } catch (error) {
        console.error("Error in summary route:", error);
        res.status(500).send("Internal server error");
    }
});

// /api/stats/requestsByType
router.get(
    API.STATS.REQUESTS_BY_TYPE.ROUTE,
    authenticate(),
    authorize("admin"),
    async (req: Request, res: Response) => {
        try {
            const grouped = await PrismaClient.serviceRequest.groupBy({
                by: ["type"],
                _count: { _all: true },
            });

            const result = grouped.map((entry) => ({
                type: entry.type,
                _count: entry._count._all,
            }));

            const data = validateArbitratyData(result, API.STATS.REQUESTS_BY_TYPE.TYPE.RES);
            if (data.err) {
                res.status(500).send("Internal server error");
            } else {
                res.status(200).json(data.val);
            }
        } catch (error) {
            console.error("Error in requestsByType route:", error);
            res.status(500).send("Internal server error");
        }
    }
);

// /api/stats/createdPerDay
router.get(API.STATS.CREATED_PER_DAY.ROUTE, authenticate(), authorize("admin"), async (req: Request, res: Response) => {
    try {
        const all = await PrismaClient.serviceRequest.findMany({
            select: { request_time: true },
        });

        const counts: Record<string, number> = {};
        for (const r of all) {
            if (r.request_time) {
                const date = r.request_time.toISOString().split("T")[0];
                counts[date] = (counts[date] || 0) + 1;
            }
        }

        const result = Object.entries(counts).map(([date, count]) => ({ date, count }));
        const data = validateArbitratyData(result, API.STATS.CREATED_PER_DAY.TYPE.RES);
        if (data.err) {
            res.status(500).send("Internal server error");
        } else {
            res.status(200).json(data.val);
        }
    } catch (error) {
        console.error("Error in createdPerDay route:", error);
        res.status(500).send("Internal server error");
    }
});

// /api/stats/completedPerDay
router.get(
    API.STATS.COMPLETED_PER_DAY.ROUTE,
    authenticate(),
    authorize("admin"),
    async (req: Request, res: Response) => {
        try {
            const all = await PrismaClient.serviceRequest.findMany({
                where: { is_resolved: true },
                select: { completed_time: true },
            });

            const counts: Record<string, number> = {};
            for (const r of all) {
                if (r.completed_time) {
                    const date = r.completed_time.toISOString().split("T")[0];
                    counts[date] = (counts[date] || 0) + 1;
                }
            }

            const result = Object.entries(counts).map(([date, count]) => ({ date, count }));
            const data = validateArbitratyData(result, API.STATS.COMPLETED_PER_DAY.TYPE.RES);
            if (data.err) {
                res.status(500).send("Internal server error");
            } else {
                res.status(200).json(data.val);
            }
        } catch (error) {
            console.error("Error in completedPerDay route:", error);
            res.status(500).send("Internal server error");
        }
    }
);
