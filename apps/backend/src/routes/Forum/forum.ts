import express, { Router } from "express";
import PrismaClient from "../../bin/prisma-client.ts";
import { API } from "common/src/api/endpoints.ts";
import { authenticate, authorize } from "../../lib/auth.ts";
import { sanitize, SanitizedRequest } from "../../lib/sanitization.ts";

export const router: Router = express.Router();

router.get(API.FORUM.ROUTE, authenticate(), authorize("employee"), async function (req, res) {
    const allForumPosts = await PrismaClient.forumPost.findMany({
        select: {
            id: true,
            authorId: true,
            title: true,
            date: true,
            content: true,
            _count: {
                select: { replies: true },
            },
            writtenBy: {
                select: {
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });

    res.json(allForumPosts);
});

router.post(
    API.FORUM.REPLIES.ROUTE,
    authenticate(),
    authorize("employee"),
    sanitize(API.FORUM.REPLIES.REQ),
    async function (req, res) {
        try {
            const data = req.body;
            console.log(data);
            const allForumPosts = await PrismaClient.forumPost.findUnique({
                where: {
                    id: parseInt(data.id),
                },
                select: {
                    id: true,
                    authorId: true,
                    title: true,
                    date: true,
                    content: true,
                    replies: {
                        select: {
                            id: true,
                            content: true,
                            date: true,
                            postId: true,
                            writtenBy: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                    writtenBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });

            res.json(allForumPosts);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error", details: error });
        }
    }
);

router.post(
    API.FORUM.REPLIES.CREATE.ROUTE,
    authenticate(),
    authorize("employee"),
    sanitize(API.FORUM.REPLIES.CREATE.REQ),
    async function (req: SanitizedRequest<typeof API.FORUM.REPLIES.CREATE.REQ>, res) {
        try {
            console.log(req.body);
            const { content, originalid } = req.body;
            const ForumReply = await PrismaClient.forumReply.create({
                data: {
                    authorId: req.body.employeeId,
                    date: new Date(),
                    content: content,
                    postId: parseInt(`${originalid}`),
                },
            });
            res.status(200).json(ForumReply);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error", details: error });
        }
    }
);

router.post(
    API.FORUM.CREATE.ROUTE,
    authenticate(),
    authorize("employee"),
    sanitize(API.FORUM.CREATE.REQ),
    async function (req: SanitizedRequest<typeof API.FORUM.CREATE.REQ>, res) {
        try {
            console.log(req.body);
            const { title, content } = req.body;
            const ForumPost = await PrismaClient.forumPost.create({
                data: {
                    authorId: req.body.employeeId,
                    date: new Date(),
                    content: content,
                    title: title,
                },
            });
            res.status(200).json(ForumPost);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error", details: error });
        }
    }
);
