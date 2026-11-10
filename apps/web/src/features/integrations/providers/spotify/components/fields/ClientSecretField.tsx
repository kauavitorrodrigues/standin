import type { Control } from "react-hook-form";
import {
    MAX_SPOTIFY_CLIENT_SECRET_LENGTH,
    type SpotifyAppSave,
} from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import { getSecretPlaceholder } from "../../utils/labels";

type Props = {
    control: Control<SpotifyAppSave>;
    disabled: boolean;
    // A saved secret is never shown again, so the empty field says it is kept.
    isSaved: boolean;
};

export const SpotifyClientSecretField = ({
    control,
    disabled,
    isSaved,
}: Props) => (
    <TextFormField
        control={control}
        name="clientSecret"
        type="password"
        label="Client Secret"
        required
        placeholder={getSecretPlaceholder(isSaved)}
        disabled={disabled}
        maxLength={MAX_SPOTIFY_CLIENT_SECRET_LENGTH}
    />
);
