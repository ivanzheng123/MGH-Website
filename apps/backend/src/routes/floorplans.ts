import express from "express";
import path from "path";
import { API } from "common/src/api/endpoints.ts";

export const router = express.Router();
const floorplanPath = path.resolve(__dirname, "../../public/floorplans");

console.log("Deploying all files in the following directory as public, static files:", floorplanPath);
router.use(API.SETTINGS.HOSPITALDATA.FLOORPLANS.ROUTE, express.static(floorplanPath));
