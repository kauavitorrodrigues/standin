import type {
    SoundboardClip,
    SoundboardClipFormValues,
} from "@standin/contracts";

export const clipToFormValues = ({
    name,
    icon,
    volume,
}: Pick<
    SoundboardClip,
    "name" | "icon" | "volume"
>): SoundboardClipFormValues => ({
    name,
    icon: icon ?? "",
    volume,
});
