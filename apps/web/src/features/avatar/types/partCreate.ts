import type {
    AvatarPart,
    AvatarSlot,
    CreateAvatarPartData,
    CreateAvatarVariationData,
} from "@standin/contracts";

type CreatePartInput = {
    mode: "part";
    image: File;
    preview: File;
    data: CreateAvatarPartData;
};

type CreateColorInput = {
    mode: "color";
    // The id of the base part of the family that gets the color.
    baseId: string;
    image: File;
    preview: File;
    data: CreateAvatarVariationData;
};

// What the pages send to create a part or a color of a part: the sprite and
// the preview, both required, in the same request.
export type CreatePartWithPreviewInput = CreatePartInput | CreateColorInput;

export type CreatePartWithPreviewResult = {
    // The whole family, as the API answers.
    part: AvatarPart;
};

// The fields both pages share: the sheet, the preview and the color of the
// new row. The color name and the hex are both filled or both empty.
export type CreateSheetFormValues = {
    colorKey: string;
    colorHex: string;
    image: File[];
    preview: File[];
};

// The page of a new part. The name starts from the file name and follows it
// until the person edits it. The key is derived by the server from the name.
export type CreatePartPageValues = CreateSheetFormValues & {
    slot: AvatarSlot;
    name: string;
};
