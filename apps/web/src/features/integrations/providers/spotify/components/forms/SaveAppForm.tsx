import { useEffect, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SpotifyAppSaveSchema, type SpotifyAppSave } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { SpotifyMessages } from "../../consts/messages";
import { SPOTIFY_SAVE_FORM_ID } from "../../consts/setupSteps";
import { SpotifyMutations } from "../../mutations";
import { getSaveErrorMessage } from "../../utils/getSaveErrorMessage";
import { SpotifyAppFormFields } from "../fields/AppFormFields";

type Props = {
    organizationId: string;
    // The client ID already saved, when there is one.
    savedClientId: string | null;
    // Runs after the app is saved, to go on to the next step.
    onSaved?: () => void;
    // Tells whether there is something to save, so the step can lock Next.
    onReadyChange?: (isReady: boolean) => void;
};

// The Client ID and Secret of the Spotify app. The secret is never sent back,
// so its field starts empty even when one is saved.
export const SaveSpotifyAppForm = ({
    organizationId,
    savedClientId,
    onSaved,
    onReadyChange,
}: Props) => {
    const save = SpotifyMutations.saveApp(organizationId);
    const form = useForm<SpotifyAppSave>({
        resolver: zodResolver(SpotifyAppSaveSchema),
        defaultValues: { clientId: savedClientId ?? "", clientSecret: "" },
    });

    const onSubmit = async (data: SpotifyAppSave) => {
        try {
            await save.mutateAsync(data);
            form.reset({ clientId: data.clientId, clientSecret: "" });
            toast.add({ title: SpotifyMessages.saved, type: "success" });
            onSaved?.();
        } catch (error) {
            toast.add({ title: getSaveErrorMessage(error), type: "error" });
        }
    };

    const { isDirty, isSubmitting } = form.formState;
    const isSaved = savedClientId !== null;

    const [clientId, clientSecret] = form.watch(["clientId", "clientSecret"]);
    const isFilled = clientId.trim() !== "" && clientSecret.trim() !== "";
    const isReady = (isSaved && !isDirty) || isFilled;

    useEffect(() => {
        onReadyChange?.(isReady);
    }, [isReady, onReadyChange]);

    // A saved app that was not touched has nothing to save: going on is enough.
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        if (isSaved && !isDirty) {
            event.preventDefault();
            onSaved?.();
            return;
        }

        return form.handleSubmit(onSubmit)(event);
    };

    return (
        <form
            id={SPOTIFY_SAVE_FORM_ID}
            onSubmit={handleSubmit}
            className="flex flex-col gap-3"
        >
            <SpotifyAppFormFields
                form={form}
                disabled={isSubmitting}
                isSecretSaved={isSaved}
            />
        </form>
    );
};
