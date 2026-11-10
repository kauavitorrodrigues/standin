import type { UseFormReturn } from "react-hook-form";
import type { SpotifyAppSave } from "@standin/contracts";
import { SpotifyClientIdField } from "./ClientIdField";
import { SpotifyClientSecretField } from "./ClientSecretField";

type Props = {
    form: UseFormReturn<SpotifyAppSave>;
    disabled: boolean;
    isSecretSaved: boolean;
};

export const SpotifyAppFormFields = ({
    form,
    disabled,
    isSecretSaved,
}: Props) => (
    <>
        <SpotifyClientIdField control={form.control} disabled={disabled} />
        <SpotifyClientSecretField
            control={form.control}
            disabled={disabled}
            isSaved={isSecretSaved}
        />
    </>
);
