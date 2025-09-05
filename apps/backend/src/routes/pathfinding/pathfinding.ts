import express, { Request, Response, Router } from "express";
import { Node } from "common/src/node.ts";
import { API } from "common/src/api/endpoints.ts";
import { ICompare, PriorityQueue } from "@datastructures-js/priority-queue";
import { sanitize, SanitizedRequest } from "../../lib/sanitization.ts";
import PrismaClient from "../../bin/prisma-client.ts";
import { z } from "zod";
import { authenticate, authorize } from "../../lib/auth.ts";

export const router: Router = express.Router();

class Pathfinding {
    constructor() {
        this._nodeMap = new Map<number, Node>();
        this.buildMap();
    }

    private _nodeMap: Map<number, Node>;

    get nodeMap(): Map<number, Node> {
        return this._nodeMap;
    }

    set nodeMap(value: Map<number, Node>) {
        this._nodeMap = value;
    }

    public bfs(start: number, end: number): number[] | null {
        const visited: Set<number> = new Set();
        const queue: number[] = [start];
        // store parent nodes for tracking path to end node
        const parentMap: Map<number, number | null> = new Map();
        parentMap.set(start, null); // Starting node has no parent

        // loops until all nodes in queue visited
        while (queue.length > 0) {
            const currentNode = queue.shift()!;
            visited.add(currentNode);

            // if end node reached, reconstruct path
            if (currentNode === end) {
                const path: number[] = [];
                let node: number | null = end;

                // backtrack to start node
                while (node !== null) {
                    path.unshift(node);
                    node = parentMap.get(node) ?? null;
                }

                // restore reconstructed path
                return path;
            }

            // explore neighbors
            const neighbors = this.nodeMap.get(currentNode) ?? null;
            if (neighbors !== null) {
                neighbors.neighbors.forEach((neighbor) => {
                    if (!visited.has(neighbor)) {
                        queue.push(neighbor); // Add neighbor to queue for future exploration
                        parentMap.set(neighbor, currentNode); // Record parent of neighbor
                    }
                });
            }
        }

        return null; // Return null if no path is found
    }

    public dfs(start: number, end: number, visited: Set<number> = new Set<number>()): number[] | null {
        const currentNode = this.nodeMap.get(start);

        // adds current node to list of visited nodes
        visited.add(currentNode!.id);

        // returns an array with just the end node if it finds it
        if (currentNode!.id === end) {
            return [end];
        }

        // looks through each child of the current node
        for (const neighbor of currentNode!.neighbors) {
            // skips any nodes that have already been visited
            if (visited.has(neighbor)) {
                continue;
            }

            // gets the end result of going down this path (null if end isn't there)
            const returnVal = this.dfs(neighbor, end, visited);

            // if a path is gotten, it adds the current node to the path and returns that
            if (returnVal) {
                returnVal.push(currentNode!.id);
                return returnVal;
            }
        }

        return null;
    }

    public aStar(start: number, end: number): number[] | null {
        // list of already visited nodes
        const visited: Set<number> = new Set();
        const parentMap: Map<number, number | null> = new Map();
        parentMap.set(start, null);

        const gScore = new Map<number, number>();
        gScore.set(start, 0);

        // pair of node and distance to target, stored in priority queue
        interface Pair {
            node: Node;
            // distance of parent node to this + distance of this node to target node
            weight: number;
        }

        // comparison used for queue entries
        const compareNodes: ICompare<Pair> = (a: Pair, b: Pair) => a.weight - b.weight;

        // queue of the nodes to be visited, prioritizes based on total distance to end
        const queue: PriorityQueue<Pair> = new PriorityQueue(compareNodes);

        const startNode = this.nodeMap.get(start)!;
        const targetNode = this.nodeMap.get(end)!;

        // adds starting node to the queue
        queue.push({ node: startNode, weight: this.calcDist(startNode, targetNode) });

        // loops until every item in the queue is hit
        while (!queue.isEmpty()) {
            // pops top node off of stack and adds it to list of visited nodes
            const currentNode: Node = queue.pop()!.node;
            const currentID = currentNode.id;
            visited.add(currentID);

            // checks if this is node is the target node
            if (currentID === end) {
                const path: number[] = [currentID];
                let parent = parentMap.get(currentID)!;
                while (parent !== null) {
                    path.push(parent);
                    parent = parentMap.get(parent)!;
                }

                return path.reverse();
            }

            // loops through each of current node's neighbors
            for (const neighbor of currentNode.neighbors) {
                // skips any nodes it's already visited
                if (visited.has(neighbor)) continue;

                const neighborNode = this.nodeMap.get(neighbor)!;
                const tentativeGScore = gScore.get(currentID)! + this.calcDist(currentNode, neighborNode);

                if (!gScore.has(neighbor) || tentativeGScore < gScore.get(neighbor)!) {
                    parentMap.set(neighbor, currentID);
                    gScore.set(neighbor, tentativeGScore);

                    const fScore = tentativeGScore + this.calcDist(neighborNode, targetNode);
                    // adds neighbor to queue
                    queue.push({ node: neighborNode, weight: fScore });
                }
            }
        }

        // no path found
        return null;
    }

    public djikstra(start: number, end: number): number[] | null {
        const shortestDistances = new Map<number, number>();
        for (const node of this._nodeMap.values()) {
            shortestDistances.set(node.id, Infinity);
        }
        shortestDistances.set(start, 0);

        const previousNode = new Map<number, number>();

        const visited = new Set<number>();
        const queue = new PriorityQueue<number>((a, b) => shortestDistances.get(a)! - shortestDistances.get(b)!);
        queue.push(start);

        while (!queue.isEmpty()) {
            const currentNode = queue.pop()!;
            if (visited.has(currentNode)) continue;
            visited.add(currentNode);

            for (const neighbor of this._nodeMap.get(currentNode)!.neighbors) {
                if (visited.has(neighbor)) continue;
                const newDistance =
                    shortestDistances.get(currentNode)! +
                    this.calcDist(this._nodeMap.get(currentNode)!, this._nodeMap.get(neighbor)!);
                if (newDistance < shortestDistances.get(neighbor)!) {
                    shortestDistances.set(neighbor, newDistance);
                    queue.push(neighbor);

                    previousNode.set(neighbor, currentNode);
                }
            }
        }

        const path: number[] = [];
        let currentNode: number | null = end;
        while (currentNode !== start && currentNode !== null) {
            path.push(currentNode);
            currentNode = previousNode.get(currentNode) ?? null;
        }
        if (currentNode === null) return null;

        path.push(start);
        path.reverse();

        return path;
    }

    public async saveMap() {
        // clear database
        await PrismaClient.pathfinding.deleteMany({});

        // adds all nodes in the graph to the database
        for (const value of this._nodeMap.values()) {
            await PrismaClient.pathfinding.upsert({
                where: {
                    id: value.id,
                },
                update: {
                    latitude: value.lat,
                    longitude: value.lng,
                    neighbors: Array.from(value.neighbors),
                    floor: value.floor,
                    name: value.name,
                },
                create: {
                    id: value.id,
                    latitude: value.lat,
                    longitude: value.lng,
                    neighbors: Array.from(value.neighbors),
                    floor: value.floor,
                    name: value.name,
                },
            });
        }
    }

    private calcDist(node1: Node, node2: Node): number {
        const xDist = node1.lat - node2.lat;
        const yDist = node1.lng - node2.lng;
        return Math.sqrt(xDist * xDist + yDist * yDist);
    }

    private async buildMap() {
        // fetches all the nodes from the database
        const result = await PrismaClient.pathfinding.findMany();

        const graph: Map<number, Node> = new Map<number, Node>();

        // recreates graph from query results
        for (const node of result) {
            graph.set(
                node.id,
                new Node(node.id, node.latitude, node.longitude, node.floor, new Set<number>(node.neighbors), node.name)
            );
        }

        // updates the graph
        this._nodeMap = graph;
    }
}

const pathfinder = new Pathfinding();

// returns path from passed start to end node
router.post(
    API.PATHFIND.ROUTE,
    sanitize(API.PATHFIND.REQ),
    async (req: SanitizedRequest<typeof API.PATHFIND.REQ>, res: Response) => {
        const { start, end } = req.body;

        // checks that passed nodes are valid
        if (isNaN(start) || isNaN(end)) {
            res.status(400).send("Invalid node passed");
        }

        // finds path through algorithm set by database
        const algoSetting = await PrismaClient.algorithmSetting.findFirst();
        const { preferredAlgorithm } = algoSetting!;

        let path: number[] | null = [];
        const startTime = performance.now();
        switch (preferredAlgorithm) {
            case "BFS":
                path = pathfinder.bfs(start, end);
                break;
            case "DFS":
                path = pathfinder.dfs(start, end);
                path = path ? path.reverse() : null;
                break;
            case "A*":
                path = pathfinder.aStar(start, end);
                break;
            case "Djikstra":
                path = pathfinder.djikstra(start, end);
                break;
            default:
                res.status(400).send("Invalid algorithm");
                return;
        }
        const elapsedTime = (performance.now() - startTime) * 1000;

        // saves the measured time to the database
        await PrismaClient.algoTimes.create({
            data: {
                algorithm: preferredAlgorithm,
                executionTime: elapsedTime,
            },
        });

        if (!pathfinder.nodeMap.has(start) || !pathfinder.nodeMap.has(end)) {
            res.status(400).send("Invalid node passed");
        }

        // returns path if found, otherwise 404
        if (path) {
            res.json({
                path,
                graph: Array.from(pathfinder.nodeMap.entries()),
            } satisfies z.infer<typeof API.PATHFIND.RES>);
        } else {
            res.status(404).send("No path found");
        }
    }
);

// receives updated node map
router.post(
    API.PATHFIND.UPDATEGRAPH.ROUTE,
    authenticate(),
    authorize("admin"),
    sanitize(API.PATHFIND.UPDATEGRAPH.REQ),
    async (req: SanitizedRequest<typeof API.PATHFIND.UPDATEGRAPH.REQ>, res: Response) => {
        const newGraph = new Map<number, Node>();

        // rebuilds node graph from data
        for (const [key, value] of req.body.graph) {
            newGraph.set(
                key,
                new Node(value.id, value.lat, value.lng, value.floor, new Set<number>(value.neighbors), value.name)
            );
        }

        // sets pathfinder node map to new one
        pathfinder.nodeMap = newGraph;
        pathfinder.saveMap().then(() => res.status(200).send("OK"));

        // res.status(200).send("OK");
    }
);

router.post(
    API.PATHFIND.SETALGO.ROUTE,
    authenticate(),
    authorize("admin"),
    sanitize(API.PATHFIND.SETALGO.REQ),
    async (req: SanitizedRequest<typeof API.PATHFIND.SETALGO.REQ>, res: Response) => {
        const algo = req.body.algo;

        // ensures passed algorithm is valid
        if (algo !== "A*" && algo !== "BFS" && algo !== "DFS" && algo !== "Djikstra") {
            res.status(400).send("Invalid algorithm");
        } else {
            await PrismaClient.algorithmSetting.upsert({
                where: {
                    id: 1,
                },
                update: {
                    preferredAlgorithm: algo,
                },
                create: {
                    id: 1,
                    preferredAlgorithm: algo,
                },
            });

            res.status(200).send("OK");
        }
    }
);

// sends the entire node map
router.get(API.PATHFIND.GETGRAPH.ROUTE, async (req: Request, res: Response) => {
    res.json({
        graph: Array.from(pathfinder.nodeMap.entries()),
    } satisfies z.infer<typeof API.PATHFIND.GETGRAPH.RES>);
});

// sends the currently used algorithm
router.get(API.PATHFIND.GETALGO.ROUTE, async (req: Request, res: Response) => {
    const algoSetting = await PrismaClient.algorithmSetting.findFirst();
    res.json({
        algorithm: algoSetting!.preferredAlgorithm,
    } satisfies z.infer<typeof API.PATHFIND.GETALGO.RES>);
});

router.get(API.PATHFIND.GETALGOTIMES.ROUTE, async (req: Request, res: Response) => {
    function calculateAverage(times: { executionTime: number }[]): number {
        if (times.length === 0) return 0;
        const total = times.reduce((sum, run) => sum + run.executionTime, 0);
        return total / times.length;
    }

    const aStar = await PrismaClient.algoTimes.findMany({
        where: {
            algorithm: "A*",
        },
    });
    const bfs = await PrismaClient.algoTimes.findMany({
        where: {
            algorithm: "BFS",
        },
    });
    const dfs = await PrismaClient.algoTimes.findMany({
        where: {
            algorithm: "DFS",
        },
    });
    const djikstra = await PrismaClient.algoTimes.findMany({
        where: {
            algorithm: "Djikstra",
        },
    });

    const aStarAvg = calculateAverage(aStar);
    const bfsAvg = calculateAverage(bfs);
    const dfsAvg = calculateAverage(dfs);
    const djikstraAvg = calculateAverage(djikstra);

    res.json({
        aStar: aStarAvg,
        bfs: bfsAvg,
        dfs: dfsAvg,
        djikstra: djikstraAvg,
    } satisfies z.infer<typeof API.PATHFIND.GETALGOTIMES.RES>);
});
