export class Node {
    private readonly _id: number;
    private readonly _neighbors: Set<number>;
    private readonly _floor: number;

    constructor(
        id: number,
        lat: number,
        lng: number,
        floor: number,
        neighbors: Set<number> = new Set(),
        name: string | null = null
    ) {
        this._id = id;
        this._lat = lat;
        this._lng = lng;
        this._floor = floor;
        this._neighbors = new Set(neighbors);
        this._name = name;
    }

    private _name: string | null;

    get name(): string | null {
        return this._name;
    }

    set name(name: string | null) {
        this._name = name;
    }

    private _lat: number;

    get lat(): number {
        return this._lat;
    }

    set lat(lat: number) {
        this._lat = lat;
    }

    private _lng: number;

    get lng(): number {
        return this._lng;
    }

    set lng(lng: number) {
        this._lng = lng;
    }

    get id(): number {
        return this._id;
    }

    get neighbors(): Set<number> {
        return this._neighbors;
    }

    get floor(): number {
        return this._floor;
    }

    // adds neighboring nodes to this node
    public addNeighbor(neighborId: number) {
        this._neighbors.add(neighborId);
    }

    public clone(): Node {
        return new Node(this._id, this._lat, this._lng, this._floor, new Set(this._neighbors), this._name);
    }

    // used for converting the node class to JSON for passing to frontend
    public toJSON() {
        return {
            id: this._id,
            lat: this._lat,
            lng: this._lng,
            neighbors: Array.from(this._neighbors),
            floor: this._floor,
            name: this._name,
        };
    }
}
