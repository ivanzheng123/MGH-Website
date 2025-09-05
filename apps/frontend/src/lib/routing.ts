import {
    ActionFunctionArgs,
    DataStrategyFunction,
    LoaderFunctionArgs,
    RouteObject,
    ShouldRevalidateFunction,
} from "react-router";
import { deepmerge } from "deepmerge-ts";
import { ComponentType, FC } from "react";
import { unrestrictedobject } from "common/src/unrestrictedobject.ts";
import { FieldValues } from "react-hook-form";
import { Auth0ContextInterface } from "@auth0/auth0-react";
import { verbose } from "@/lib/debug.ts";

/**
 * The {@link Filesystem} represents the *directory hierarchy* containing at least one {@link Route} relative to the entrypoint of the application. To use the filesystem router, make sure your propect satisfies this type.
 */
export type Filesystem = {
    src: {
        routes: Route;
        [key: string | number | symbol]: unknown;
    };
};

/**
 * A {@link Route} represents a specific directory in your {@link Filesystem}. There are three distinct types of routes:
 * 1. Static routes
 *    - Routes which have a static, known-at-compile-time path.
 * 2. Dynamic routes
 *    - Routes which have a path pattern matched from arbitrary paths at runtime.
 * 3. Layout routes
 *    - Routes which have no path
 *
 * Route types are not defined by this type system, because they are functionally the same from the perspective of the Router. In practice, they are specified by the directory path. Directories prepended with <kbd>?</kbd> contain dynamic routes and directories prepended with <kbd>!</kbd> contain layouts. Directories starting with any other character contain static routes.
 *
 * Routes contain up to three {@link Module}s, the files which export components that make up a route. The `route.tsx` module exports the route's main components. The `default.tsx` file exports the route's *default* components, which are displayed inside `route.tsx`'s {@link Module.Route} component's `<Outlet/>` when the browser navigates to a path which is fully satisfied by this route. The `404.tsx` file exports the route's *splat* components, which are displayed inside `route.tsx`'s {@link Module.Route} component's `<Outlet/>` when the browser navigates to a path which is only partially satisfied by this route, and no direct descendants of this route exist which at least partially satisfy the path. Note that the requirements for the `404.tsx` components to display cascade, so if there exists no `404.tsx` at the route which meets this requirement, the router will bubble up to the closest one.
 */
type Route = {
    "route.tsx": Module;
    "default.tsx"?: Module;
    "404.tsx"?: Module;
} & {
    [key: `!${string}` | `?${string}` | string]: Route;
};

/**
 * A {@link Module} represents a ES6 module which exports at least one component and at most three components and three functions. These components map directly to React Router's Data Router types, except the `action` function, which wraps a React Router action. It provides a compatibility layer for {@link useSubmitter()()}, providing the data submitted via the function directly as arguments. It hides the request and params of the action.
 */
export type Module = {
    Route: FC;
    Pending?: FC;
    Error?: FC;
    loader?: RouteLoader;
    action?: RouteAction<FieldValues>;
    shouldRevalidate?: RevalidationChecker;
};

type Sourcemap = {
    Component: ComponentType;
    ErrorBoundary: undefined | ComponentType;
    HydrateFallback: undefined | ComponentType;
    action: undefined | RouteAction;
    loader: undefined | RouteLoader;
    shouldRevalidate: undefined | ShouldRevalidateFunction;
};

type RecursiveSourcemap = {
    [key: string | "src" | "index" | "splat"]: Sourcemap | RecursiveSourcemap;
};

export type RendererContext = {
    auth: Auth0ContextInterface;
};

export type RouteLoader = (args: LoaderFunctionArgs, context: RendererContext) => unknown | Promise<unknown>;
export type RouteAction<T extends FieldValues = FieldValues> = (
    data: T,
    args: ActionFunctionArgs,
    context: RendererContext
) => unknown | Promise<unknown>;
export type RevalidationChecker = ShouldRevalidateFunction;

/**
 * This generates filesystem routes based on a predefined, hardcoded configuration in its body. The code in this function is the single source of truth for the route schema, however, the {@link Filesystem} type provides a human-readable schema that defines how routes should be written.
 * @see generateRenderer
 */
export const generateRoutes = (): RouteObject => {
    const debug = verbose();

    // the route generation process follows 4 steps, roughly resembling the logic found in octobox.thomasricci.dev
    // (my metaframework, btw, you should check it out it's super cool)
    // anyway, the steps are:
    // 1. import all the routes, including index routes, slugs, and splats
    // 2. convert them to paths (by paths i mean worst-case unbalanced trees)
    // 3. merge the paths to form a tree of routes
    // 4. trivally map the tree to a RouteObject to pass to react router

    // step 1
    // NOTE: this basename MUST be changed if we change the glob pattern. we CANNOT reference this in
    // the glob pattern, because it requires a string literal, for some reason.
    const basename = "/src/routes/";
    const routes = import.meta.glob("/src/routes/**/{route,default,404}.tsx", {
        eager: true,
    });

    if (debug) console.log("Routes:", routes);

    // step 2
    // this is just a route tree with one branch
    const nestedRoutes: { route: RecursiveSourcemap }[] = [];
    for (const route in routes) {
        // first of all, split the route path up into its components backwards so we can build the "tree"
        let segments = route.replace(basename, "").split("/");
        segments = segments.reverse();
        const file = segments.shift();

        // resolve srcmap from module
        // note that we don't do typechecking here, because we can't easily check them at runtime (and we don't know
        // them during compile time). if there's an error, the runtime will handle it
        const module = routes[route] as unrestrictedobject;
        const defaultModule = (module as unrestrictedobject).Route;
        // all we want to check for is if we have no Route export. if we don't, then we have no route
        if (defaultModule === undefined) {
            continue;
        }

        // build the leaf of the tree
        // this will always have a src object defining all the exports for the route
        const obj: RecursiveSourcemap = {};
        let objPtr = obj;

        // here we're defining what we expect from routes. this is VERY IMPORTANT, and changing it WILL break things.
        // each module should be exporting at least a default function, and optionally the other named functions shown
        // here. refer to this code as the source of truth for what route modules should export.
        // also we're setting up index and splat routes, too. they can't be trivally ported to the route config yet,
        // we'll do that in a later pass.
        switch (file) {
            case "default.tsx": {
                objPtr["index"] = {
                    Component: defaultModule,
                    ErrorBoundary: module.Error,
                    HydrateFallback: module.Pending,
                    action: module.action,
                    loader: module.loader,
                    shouldRevalidate: module.shouldRevalidate,
                };
                break;
            }
            case "404.tsx": {
                objPtr["splat"] = {
                    Component: defaultModule,
                    ErrorBoundary: module.Error,
                    HydrateFallback: module.Pending,
                    action: module.action,
                    loader: module.loader,
                    shouldRevalidate: module.shouldRevalidate,
                };
                break;
            }
            default: {
                objPtr["src"] = {
                    Component: defaultModule,
                    ErrorBoundary: module.Error,
                    HydrateFallback: module.Pending,
                    action: module.action,
                    loader: module.loader,
                    shouldRevalidate: module.shouldRevalidate,
                };
                break;
            }
        }

        // dynamic programming 😈
        for (const segment of segments) {
            const segObj: RecursiveSourcemap = {};
            segObj[segment] = objPtr;
            objPtr = segObj;
        }

        nestedRoutes.push({ route: objPtr });
    }

    /*
     * Example route tree:
     *
     * index
     * about/
     *   index
     *   skull/
     *     index
     * posts/
     *   index
     *
     * {
     *   page: index
     *   about: {
     *     page: index
     *     skull: {
     *       index
     *     }
     *   }
     *   posts: {
     *     page: index
     *   }
     * }
     */

    // step 3
    const routeTree: {
        route: RecursiveSourcemap;
    } = deepmerge(...nestedRoutes) as {
        route: RecursiveSourcemap;
    };

    if (debug) console.log("Route tree:", routeTree);

    /**
     * Sets common object properties for a given sourcemap.
     */
    const buildObj = (e: Sourcemap): RouteObject => {
        // these two should be set for everything
        const obj: RouteObject = {
            caseSensitive: false,
            Component: e.Component,
        };

        // and these are all the optional things for this route
        if (e.ErrorBoundary !== undefined) {
            obj.ErrorBoundary = e.ErrorBoundary;
        }
        if (e.HydrateFallback !== undefined) {
            obj.HydrateFallback = e.HydrateFallback;
        }
        if (e.loader !== undefined) {
            obj.loader = async (args, handlerCtx) => {
                return (e.loader as RouteLoader)(args, handlerCtx as RendererContext);
            };
        }
        if (e.action !== undefined) {
            obj.action = async (args, handlerCtx) => {
                // as long as we only call with useSubmitter()(), we should always be using json
                const data = await args.request.json();
                return await (e.action as RouteAction<FieldValues>)(data, args, handlerCtx as RendererContext);
            };
        }
        if (e.shouldRevalidate !== undefined) {
            obj.shouldRevalidate = e.shouldRevalidate;
        }

        return obj;
    };

    /**
     * Format all slugs and layouts from the $ syntax to :
     */
    const formatSlug = (slug: string) => {
        if (slug.startsWith("$")) {
            return slug.replace("$", ":");
        }
        return slug;
    };

    /**
     * Recursively maps a route tree to a RouteObject.
     */
    const map = (route: RecursiveSourcemap, path: string): RouteObject => {
        // we might end up with routes that don't have elements, so we need to check for that first.
        if (route["src"] !== undefined) {
            // stupid weird typing that doesn't work
            const elem = route["src"] as Sourcemap;
            const srcObj = buildObj(elem);
            // support layout routes
            if (!path.startsWith("!")) {
                srcObj.path = path;
            }

            const children: RouteObject[] = [];

            // handle index
            if (route["index"] !== undefined) {
                const indexElem = route["index"] as Sourcemap;
                const indexObj = buildObj(indexElem);
                // an index route has no path, just an index property
                indexObj.index = true;
                children.push(indexObj);
            }

            // handle wildcard
            if (route["splat"] !== undefined) {
                const splatElem = route["splat"] as Sourcemap;
                const splatObj = buildObj(splatElem);
                splatObj.path = `*`;
                children.push(splatObj);
            }

            // finally, handle all children
            for (const key in route) {
                // ignore special keys
                if (key === "src" || key === "index" || key === "splat") {
                    continue;
                }
                // again, dumb type issue
                children.push(map(route[key] as RecursiveSourcemap, formatSlug(key)));
            }

            srcObj.children = children;
            return srcObj;
        }
        // if we don't have a route here, we make a prefix route that just has children
        const children: RouteObject[] = [];
        for (const key in route) {
            // ignore special keys
            if (key === "src" || key === "index" || key === "splat") {
                continue;
            }
            // again, dumb type issue
            children.push(map(route[key] as RecursiveSourcemap, formatSlug(key)));
        }
        return {
            path: formatSlug(path),
            children,
        };
    };

    // step 4
    const dataRouteObject = map(routeTree.route, "/");

    // we'll store the routes in here. this is what we return.
    if (debug) console.log("Route Object:", dataRouteObject);

    return dataRouteObject;
};

/**
 * Generates the data renderer strategy for the router. This is used to pass global data to loaders and actions. Edit {@link RendererContext} to change the shape of the context.
 * @param context
 * @see generateRoutes
 */
export const generateRenderer = (context: RendererContext): DataStrategyFunction => {
    return async ({ matches }) => {
        // find loaders/actions to run in parallel with the context
        const matchesToLoad = matches.filter((m) => m.shouldLoad);

        const results = await Promise.all(
            matchesToLoad.map((match) =>
                match.resolve((handler) => {
                    // whatever passed to handler will be passed as the context for loaders/actions
                    return handler(context);
                })
            )
        );

        return results.reduce(
            (acc, result, i) =>
                Object.assign(acc, {
                    [matchesToLoad[i].route.id]: result,
                }),
            {}
        );
    };
};
