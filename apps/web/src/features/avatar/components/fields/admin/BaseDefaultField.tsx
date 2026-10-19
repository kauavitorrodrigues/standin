import type { Control } from "react-hook-form";
import { StarIcon } from "lucide-react";
import { AVATAR_BASE_KINDS } from "@standin/contracts";
import type { AvatarBaseKind } from "@standin/contracts";
import { SwitchCardField } from "@/components/fields/SwitchCardField";
import type { CreateBaseFormValues } from "../../../types/parts";

type Props = {
    control: Control<CreateBaseFormValues>;
    kind: AvatarBaseKind;
    disabled?: boolean;
    // The first base of a kind becomes the default by itself (the server
    // enforces this), so the switch only shows from the second on.
    isFirstOfKind: boolean;
};

export const BaseDefaultField = ({
    control,
    kind,
    disabled,
    isFirstOfKind,
}: Props) => {
    if (isFirstOfKind) return null;

    switch (kind) {
        case AVATAR_BASE_KINDS.BODY:
            return (
                <SwitchCardField
                    control={control}
                    name="isDefault"
                    icon={StarIcon}
                    title="Base padrão"
                    description="Quem não escolheu uma base usa a padrão."
                    disabled={disabled}
                />
            );
        case AVATAR_BASE_KINDS.MANNEQUIN:
            return (
                <SwitchCardField
                    control={control}
                    name="isDefault"
                    icon={StarIcon}
                    title="Usar na prévia"
                    description="O manequim em uso é o que recebe as peças na prévia."
                    disabled={disabled}
                />
            );
    }
};
