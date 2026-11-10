import type { Control } from "react-hook-form";
import {
    MAX_SPOTIFY_CLIENT_ID_LENGTH,
    type SpotifyAppSave,
} from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";

type Props = {
    control: Control<SpotifyAppSave>;
    disabled: boolean;
};

export const SpotifyClientIdField = ({ control, disabled }: Props) => (
    <TextFormField
        control={control}
        name="clientId"
        label="Client ID"
        required
        disabled={disabled}
        maxLength={MAX_SPOTIFY_CLIENT_ID_LENGTH}
    />
);
