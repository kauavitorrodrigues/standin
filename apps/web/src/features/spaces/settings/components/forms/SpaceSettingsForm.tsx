import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    SpaceSettingsSchema,
    type SpaceSettings,
    type SpaceSettingsInput,
} from "@standin/contracts";
import { FormDialogControls } from "@/components/FormDialogControls";
import { toast } from "@/components/ui/toast";
import { SpaceSettingsMessages } from "../../consts/messages";
import { SpaceSettingsMutations } from "../../mutations";
import { SendNearbyField } from "../fields/SendNearbyField";
import { ProximityPresetField } from "../fields/ProximityPresetField";

type Props = {
    spaceId: string;
    settings: SpaceSettings;
    onClose: () => void;
};

export const SpaceSettingsForm = ({ spaceId, settings, onClose }: Props) => {
    const updateMutation = SpaceSettingsMutations.update(spaceId);

    const form = useForm<SpaceSettingsInput, unknown, SpaceSettings>({
        resolver: zodResolver(SpaceSettingsSchema),
        defaultValues: settings,
    });

    const onSubmit = async (data: SpaceSettings) => {
        try {
            await updateMutation.mutateAsync(data);
            onClose();
        } catch {
            toast.add({
                title: SpaceSettingsMessages.saveFailed,
                type: "error",
            });
        }
    };

    const { isSubmitting } = form.formState;

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
        >
            <SendNearbyField control={form.control} disabled={isSubmitting} />
            <ProximityPresetField
                control={form.control}
                disabled={isSubmitting}
            />
            <FormDialogControls
                onClose={onClose}
                submitLabel="Salvar"
                isSubmitting={isSubmitting}
            />
        </form>
    );
};
