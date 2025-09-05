import type { Row } from "./types";

// export const rows: Row[] = [
//     {
//         type: "forest",
//         trees: [
//             { tileIndex: -3, height: 50 },
//             { tileIndex: 2, height: 30 },
//             { tileIndex: 5, height: 50 },
//         ]
//     }
// ]

// export const rows: Row[] = [
//     {
//         type: "car",
//         direction: false,
//         speed: 1,
//         vehicles: [{ initialTileIndex: 2, color: 0xfff000 }],
//     }
// ]

export const rows: Row[] = [
    {
        type: "truck",
        direction: true,
        speed: 50,
        vehicles: [{ initialTileIndex: -4, color: 0xfff000 }],
    }
]
