import { AVATAR_BASE_KINDS } from "@standin/contracts";
import type { AvatarBase, AvatarBaseKind } from "@standin/contracts";
import { AVATAR_BASE_KIND_META } from "../../consts/admin/baseKindMeta";
import type { AvatarBaseFacets } from "../../types/admin/baseFilters";

const countKind = (bases: AvatarBase[], kind: AvatarBaseKind) =>
    bases.filter((base) => base.kind === kind).length;

const countPreview = (bases: AvatarBase[], hasPreview: boolean) =>
    bases.filter((base) => (base.previewUrl !== null) === hasPreview).length;

// How many bases exist per kind and per presence of a list image, over the
// whole list, regardless of the filters currently in use.
export const getBaseFacets = (bases: AvatarBase[]): AvatarBaseFacets => ({
    kind: [
        {
            value: AVATAR_BASE_KINDS.BODY,
            label: AVATAR_BASE_KIND_META[AVATAR_BASE_KINDS.BODY].label,
            count: countKind(bases, AVATAR_BASE_KINDS.BODY),
        },
        {
            value: AVATAR_BASE_KINDS.MANNEQUIN,
            label: AVATAR_BASE_KIND_META[AVATAR_BASE_KINDS.MANNEQUIN].label,
            count: countKind(bases, AVATAR_BASE_KINDS.MANNEQUIN),
        },
    ],
    preview: [
        {
            value: "true",
            label: "Com imagem",
            count: countPreview(bases, true),
        },
        {
            value: "false",
            label: "Sem imagem",
            count: countPreview(bases, false),
        },
    ],
});
