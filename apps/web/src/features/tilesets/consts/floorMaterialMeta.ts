import { FLOOR_MATERIALS, type FloorMaterial } from "@standin/contracts";

// The label of each floor material, in the order the panel lists them.
export const FLOOR_MATERIAL_OPTIONS: {
    value: FloorMaterial;
    label: string;
}[] = [
    { value: FLOOR_MATERIALS.WOOD, label: "Madeira" },
    { value: FLOOR_MATERIALS.CARPET, label: "Carpete" },
    { value: FLOOR_MATERIALS.STONE, label: "Pedra" },
    { value: FLOOR_MATERIALS.GRASS, label: "Grama" },
];
