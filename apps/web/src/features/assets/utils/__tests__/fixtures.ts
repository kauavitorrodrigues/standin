import type {
    AssetDefinition,
    LibraryFamilyDetail,
    LibraryFamilyVariant,
} from "@standin/contracts";
import { CREATE_ASSET_DEFAULT_VALUES } from "../../consts/createForm";
import type { CreateAssetFormValues } from "../../types/createForm";

export const png = (name = "mug.png") => new File(["x"], name);

export const createValues = (
    overrides: Partial<CreateAssetFormValues> = {}
): CreateAssetFormValues => ({
    ...CREATE_ASSET_DEFAULT_VALUES,
    image: [png()],
    name: "Caneca",
    category: "FOOD_DRINK",
    ...overrides,
});

export const definition = (
    overrides: Partial<AssetDefinition> = {}
): AssetDefinition => ({
    id: "a1",
    key: "mug",
    name: "Caneca",
    type: "DECORATION",
    category: "FOOD_DRINK",
    baseAssetId: null,
    rotation: null,
    colorKey: "red",
    colorHex: "#D64545",
    url: "/files/f1",
    sprite: { w: 32, h: 32 },
    footprint: { w: 1, h: 1, offsetX: 0 },
    placement: "SURFACE",
    surfaceHeightPx: 0,
    solid: false,
    action: null,
    actionParams: null,
    promptText: null,
    animation: null,
    ...overrides,
});

const variant = (
    overrides: Partial<AssetDefinition>
): LibraryFamilyVariant => ({
    ...definition(overrides),
    inUse: false,
    parts: [],
    thumbnail: { url: "/files/f1", sprite: { w: 32, h: 32 }, frameCount: 1 },
});

export const family = (
    rotations: AssetDefinition["rotation"][] = [null],
    action: AssetDefinition["action"] = null
): Pick<LibraryFamilyDetail, "variants" | "colors"> => ({
    colors: [{ key: "red", hex: "#D64545" }],
    variants: rotations.map((rotation, index) =>
        variant({
            id: `v${index}`,
            baseAssetId: index === 0 ? null : "v0",
            rotation,
            action,
        })
    ),
});
