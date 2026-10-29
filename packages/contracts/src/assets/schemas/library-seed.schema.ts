import { z } from "zod/v4";
import { AreaBodySchema } from "../../areas/schemas/area-body.schema";
import {
    AvatarPartFieldsSchema,
    CreateAvatarVariationDataSchema,
    hasCompleteColorPair,
} from "../../avatar/schemas/avatar-part.schema";
import { CreateAvatarBaseDataSchema } from "../../avatar/schemas/avatar-base.schema";
import { AvatarErrorMessages } from "../../avatar/schemas/consts/error-messages";
import { StampSchema } from "../../maps/editor/schemas/stamp.schema";
import { MAX_LIBRARY_KEY_LENGTH } from "../consts/library";
import { findRepeatedIndexes } from "../utils/findRepeatedIndexes";
import { LibrarySeedFileErrorMessages as Messages } from "./consts/error-messages";
import {
    CreateAssetDataSchema,
    CreateTilesetDataSchema,
    CreateVariantDataSchema,
    SetAssetPartsSchema,
} from "./library-data.schema";

const file = z.string().min(1);

// A reference to a tileset or an asset by its `key`.
const keyRef = z.string().min(1).max(MAX_LIBRARY_KEY_LENGTH);

// `library.json`: the `data` of each creation endpoint plus the PNG path
// (relative to the folder of the file).
const tilesetEntry = CreateTilesetDataSchema.omit({
    organizationId: true,
    key: true,
}).extend({ key: z.string().min(1), file });

const variantEntry = CreateVariantDataSchema.extend({ file });

const assetEntry = CreateAssetDataSchema.omit({
    organizationId: true,
    key: true,
}).extend({
    key: z.string().min(1),
    file,
    variants: z.array(variantEntry).optional(),
});

// The parts of an asset (a bundle). Root and parts are assets of the file or
// of the library, by key.
// The same part at the same offset twice is refused here, before anything is
// written, instead of by the unique index of the table.
const bundleEntry = z
    .object({
        asset: keyRef,
        parts: SetAssetPartsSchema.shape.parts.element
            .omit({ partAssetId: true })
            .extend({ partAsset: keyRef })
            .array(),
    })
    .superRefine((bundle, ctx) => {
        const places = bundle.parts.map(
            ({ partAsset, offsetX, offsetY }) =>
                `${partAsset}@${offsetX},${offsetY}`
        );
        for (const index of findRepeatedIndexes(places)) {
            const { partAsset, offsetX, offsetY } = bundle.parts[index]!;
            ctx.addIssue({
                code: "custom",
                path: ["parts", index],
                message: Messages.repeatedBundlePart(
                    bundle.asset,
                    partAsset,
                    offsetX,
                    offsetY
                ),
            });
        }
    });

// The stamp of an area as the editor stores it, except that tilesets and
// assets are named by key. The rules that need the library run on the stamp
// after the keys became ids.
const stampEntry = z.object({
    ...StampSchema.shape,
    palette: StampSchema.shape.palette.element
        .omit({ tilesetId: true })
        .extend({ tilesetKey: keyRef })
        .array(),
    objects: StampSchema.shape.objects.element
        .omit({ assetId: true })
        .extend({ assetKey: keyRef })
        .array(),
});

const areaEntry = AreaBodySchema.omit({ stamp: true }).extend({
    key: keyRef,
    stamp: stampEntry,
    file,
});

// A color variation is found by its color name inside the part, and its key
// is derived from the key of the part like the endpoint does.
const avatarVariationEntry = CreateAvatarVariationDataSchema.extend({
    file,
    preview: file,
});

const avatarPartEntry = AvatarPartFieldsSchema.omit({ key: true })
    .extend({
        key: keyRef,
        file,
        preview: file,
        variations: z.array(avatarVariationEntry).optional(),
    })
    .refine(hasCompleteColorPair, {
        error: AvatarErrorMessages.color.pair.invalid,
    })
    .refine(
        (part) =>
            !part.variations?.length ||
            (part.colorKey !== undefined && part.colorHex !== undefined),
        {
            error: AvatarErrorMessages.color.family.invalid,
            path: ["colorKey"],
        }
    )
    .superRefine((part, ctx) => {
        const variations = part.variations ?? [];
        const colors = variations.map(({ colorKey }) => colorKey);
        for (const index of findRepeatedIndexes(colors)) {
            ctx.addIssue({
                code: "custom",
                path: ["variations", index, "colorKey"],
                message: Messages.repeatedColor(part.key, colors[index]!),
            });
        }
    });

// `kind` and `isDefault` stay optional here: a field the entry leaves out is
// not compared with the library.
const avatarBaseEntry = CreateAvatarBaseDataSchema.omit({
    key: true,
    kind: true,
    isDefault: true,
}).extend({
    key: keyRef,
    kind: CreateAvatarBaseDataSchema.shape.kind.removeDefault().optional(),
    isDefault: CreateAvatarBaseDataSchema.shape.isDefault
        .removeDefault()
        .optional(),
    file,
    preview: file.optional(),
});

// A key written twice would turn into a create and an update of the same
// row, so the sections added with bundles, areas and avatars refuse it. The
// tilesets and the assets keep their old behavior on purpose: files written
// before these sections existed must keep seeding exactly as they did.
export const LibrarySeedFileSchema = z
    .object({
        tilesets: z.array(tilesetEntry).default([]),
        assets: z.array(assetEntry).default([]),
        bundles: z.array(bundleEntry).default([]),
        areas: z.array(areaEntry).default([]),
        avatarBases: z.array(avatarBaseEntry).default([]),
        avatarParts: z.array(avatarPartEntry).default([]),
    })
    .superRefine((file, ctx) => {
        const sections = [
            ["areas", "key", file.areas.map(({ key }) => key)],
            ["avatarBases", "key", file.avatarBases.map(({ key }) => key)],
            ["avatarParts", "key", file.avatarParts.map(({ key }) => key)],
            ["bundles", "asset", file.bundles.map(({ asset }) => asset)],
        ] as const;
        for (const [section, field, keys] of sections) {
            for (const index of findRepeatedIndexes(keys)) {
                ctx.addIssue({
                    code: "custom",
                    path: [section, index, field],
                    message: Messages.repeatedKey(section, keys[index]!),
                });
            }
        }
    });

export type LibrarySeedFile = z.infer<typeof LibrarySeedFileSchema>;
