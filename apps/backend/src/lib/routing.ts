import { glob } from "glob";
import { Router } from "express";
import path from "path";
import { verbose } from "./debug.ts";

/**
 * This function finds available routers in the application. Routers must be exported with the named `router` export of type {@link Router}.
 */
export const findRouters = async () => {
    const debug = verbose();
    const pattern = "**/*.ts";
    const cwd = path.resolve(__dirname, "../");
    const ignore = ["app.ts", "bin/*", "lib/*"];
    console.log("Finding files which match:", pattern);
    if (debug) {
        console.log("Finding files using glob with CWD:", cwd);
        console.log("Ignoring files matching the following patterns:", ignore);
    }
    const paths = await glob(pattern, { ignore, cwd });
    if (debug) {
        console.log("Fetched module paths:", paths, "\n\n", "(", paths.length, " paths)");
    } else {
        console.log("Fetched module paths: ...", paths.length, "omitted ...");
    }
    const routers: Router[] = [];
    for (const path of paths) {
        const element = `../${path}`;
        if (debug) {
            console.log("Attempting to fetch", element);
        }
        const module = await import(element);
        if (debug) {
            console.log("Attempted to fetch module from path:", element, "Contents:", module);
        }
        if (module.router !== undefined) {
            if (debug) {
                console.log("Found router in module at path:", element, "Contents:", module.router);
            }
            routers.push(module.router);
        }
    }
    if (debug) {
        console.log("\n\n\n");
        console.log("Using the following routers:", routers, "\n\n", "(", routers.length, " routers)");
    } else {
        console.log("Using the following routers: ...", routers.length, "omitted ...");
    }
    return routers;
};
