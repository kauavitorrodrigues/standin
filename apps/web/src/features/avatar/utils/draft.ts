import { AVATAR_SLOT_VALUES, AVATAR_SLOTS } from "@standin/contracts";
import type { AvatarConfig, AvatarSlot } from "@standin/contracts";
import type {
    AvatarDraft,
    AvatarEditorFormValues,
    DraftPartChoice,
    DraftPartsBySlot,
} from "../types/draft";
import type {
    AvatarCategoryPartItem,
    AvatarCategoryPartVariation,
    AvatarEditor,
    AvatarEditorBase,
} from "../types/editor";

export const createEmptyParts = (): DraftPartsBySlot =>
    Object.fromEntries(
        AVATAR_SLOT_VALUES.map((slot) => [slot, null])
    ) as DraftPartsBySlot;

// The form starts with the avatar the person has now. A part that was deleted
// stays in the draft, so it keeps being drawn until the person removes it.
export const buildFormValues = (
    editor: AvatarEditor
): AvatarEditorFormValues => {
    const parts = createEmptyParts();

    for (const part of editor.current.parts) {
        parts[part.slot] = {
            partId: part.partId,
            familyId: part.familyId,
            colorKey: null,
            url: part.url,
        };
    }

    return {
        activeSlot: editor.categories[0]?.slot ?? AVATAR_SLOTS.SKIN,
        baseId: editor.current.baseId,
        parts,
    };
};

// The body of `PUT /users/me/avatar`: only the slots that have a part.
export const buildConfig = (draft: AvatarDraft): AvatarConfig => ({
    baseId: draft.baseId,
    parts: AVATAR_SLOT_VALUES.flatMap((slot) => {
        const part = draft.parts[slot];
        if (!part) return [];
        return [{ slot, partId: part.partId }];
    }),
});

export const toDraftChoice = (
    item: AvatarCategoryPartItem,
    variation: AvatarCategoryPartVariation
): DraftPartChoice => ({
    partId: variation.id,
    familyId: item.id,
    colorKey: variation.colorKey,
    url: variation.url,
});

// The color that a part just chosen takes: the one the slot already had when
// the family offers it, or else the base row of the family.
export const pickVariation = (
    item: AvatarCategoryPartItem,
    preferredColorKey: string | null
): AvatarCategoryPartVariation | undefined => {
    const matchesPreferred = (variation: AvatarCategoryPartVariation) =>
        variation.colorKey === preferredColorKey;
    const preferred =
        preferredColorKey === null
            ? undefined
            : item.variations.find(matchesPreferred);
    return preferred ?? item.variations[0];
};

// The family of the part chosen in the slot, when it is in the loaded pages.
export const findChosenFamily = (
    items: readonly AvatarCategoryPartItem[],
    choice: DraftPartChoice | null
): AvatarCategoryPartItem | undefined => {
    if (!choice) return undefined;
    return items.find((item) => item.id === choice.familyId);
};

// The colors a family offers. A family of a single color shows no swatch.
export const getSwatchVariations = (
    family: AvatarCategoryPartItem | undefined
): AvatarCategoryPartVariation[] => {
    if (!family) return [];
    const colored = family.variations.filter(
        (variation) => variation.colorHex !== null
    );
    return colored.length > 1 ? colored : [];
};

// The part of the slot is chosen but no longer in the list, which means it
// was deleted. It is only known once the whole list has been loaded.
export const isChoiceDeleted = (
    items: readonly AvatarCategoryPartItem[],
    choice: DraftPartChoice | null,
    isListComplete: boolean
): boolean => {
    if (!choice || !isListComplete) return false;
    return findChosenFamily(items, choice) === undefined;
};

// The base the draft uses: the chosen one, else the default, else the first.
export const resolveDraftBase = (
    bases: readonly AvatarEditorBase[],
    baseId: string | null
): AvatarEditorBase | undefined =>
    bases.find((base) => base.id === baseId) ??
    bases.find((base) => base.isDefault) ??
    bases[0];

// Whether the draft holds at least one part.
export const hasAnyPart = (draft: AvatarDraft): boolean =>
    AVATAR_SLOT_VALUES.some((slot: AvatarSlot) => draft.parts[slot] !== null);
