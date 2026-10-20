import type { Control } from "react-hook-form";
import { AVATAR_BASE_KINDS } from "@standin/contracts";
import type { AvatarBaseKind } from "@standin/contracts";
import type { CreateBaseFormValues } from "../../../types/parts";
import { SheetFormField } from "./SheetFormField";

type Props = {
    control: Control<CreateBaseFormValues>;
    kind: AvatarBaseKind;
    disabled?: boolean;
};

// The sprite sheet of a new base or mannequin. Both follow the grid of the
// avatar, what changes is what the figure is for.
export const BaseSheetField = ({ control, kind, disabled }: Props) => {
    switch (kind) {
        case AVATAR_BASE_KINDS.BODY:
            return (
                <SheetFormField
                    control={control}
                    name="image"
                    id="create-base-image"
                    label="PNG do sprite"
                    hint="O corpo vazio, na grade do avatar e com fundo transparente. As peças são desenhadas em volta dele."
                    required
                    disabled={disabled}
                    hideDropzoneWhenFilled
                />
            );
        case AVATAR_BASE_KINDS.MANNEQUIN:
            return (
                <SheetFormField
                    control={control}
                    name="image"
                    id="create-base-image"
                    label="PNG do sprite"
                    hint="O boneco sem roupa que recebe as peças na prévia, na grade do avatar e com fundo transparente."
                    required
                    disabled={disabled}
                    hideDropzoneWhenFilled
                />
            );
    }
};
