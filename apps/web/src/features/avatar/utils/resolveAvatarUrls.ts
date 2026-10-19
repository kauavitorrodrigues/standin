import type {
    AvatarBase,
    AvatarCategory,
    AvatarCategoryPartsPage,
    AvatarEditor,
    AvatarPart,
    AvatarPartList,
    AvatarPartRow,
} from "@standin/contracts";
import { API_BASE_URL } from "@/lib/api/url";
import { resolveFileUrl } from "@/lib/api/assetUrl";

// The urls of the avatar API are paths (`/files/:id`). They are put behind its
// address once, here, so the browser can fetch them. Every hook of this
// feature already returns them resolved, so nothing else may resolve them
// again.
const resolveUrl = (url: string): string => resolveFileUrl(url, API_BASE_URL);

const resolveNullableUrl = (url: string | null): string | null => {
    if (url === null) return null;
    return resolveUrl(url);
};

export const resolveEditorUrls = (editor: AvatarEditor): AvatarEditor => ({
    categories: editor.categories.map((category) => ({
        ...category,
        previewUrl: resolveNullableUrl(category.previewUrl),
    })),
    bases: editor.bases.map((base) => ({
        ...base,
        url: resolveUrl(base.url),
        previewUrl: resolveNullableUrl(base.previewUrl),
    })),
    current: {
        ...editor.current,
        parts: editor.current.parts.map((part) => ({
            ...part,
            url: resolveUrl(part.url),
        })),
    },
});

export const resolveCategoryPartsPageUrls = (
    page: AvatarCategoryPartsPage
): AvatarCategoryPartsPage => ({
    ...page,
    items: page.items.map((item) => ({
        ...item,
        previewUrl: resolveUrl(item.previewUrl),
        variations: item.variations.map((variation) => ({
            ...variation,
            url: resolveUrl(variation.url),
            previewUrl: resolveUrl(variation.previewUrl),
        })),
    })),
});

export const resolvePartRowUrls = (row: AvatarPartRow): AvatarPartRow => ({
    ...row,
    url: resolveUrl(row.url),
    previewUrl: resolveUrl(row.previewUrl),
});

export const resolvePartUrls = (part: AvatarPart): AvatarPart => ({
    ...resolvePartRowUrls(part),
    variations: part.variations.map(resolvePartRowUrls),
});

export const resolvePartListUrls = (list: AvatarPartList): AvatarPartList => ({
    slots: list.slots.map((group) => ({
        ...group,
        parts: group.parts.map(resolvePartUrls),
    })),
});

export const resolveBaseUrls = (base: AvatarBase): AvatarBase => ({
    ...base,
    url: resolveUrl(base.url),
    previewUrl: resolveNullableUrl(base.previewUrl),
});

export const resolveCategoryUrls = (
    category: AvatarCategory
): AvatarCategory => ({
    ...category,
    previewUrl: resolveNullableUrl(category.previewUrl),
});
