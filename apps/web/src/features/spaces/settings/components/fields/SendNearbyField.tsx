import { Controller, type Control } from "react-hook-form";
import type { SpaceSettings, SpaceSettingsInput } from "@standin/contracts";
import { Switch } from "@/components/ui/switch";

type Props = {
    control: Control<SpaceSettingsInput, unknown, SpaceSettings>;
    disabled?: boolean;
};

export const SendNearbyField = ({ control, disabled }: Props) => (
    <Controller
        control={control}
        name="enableSendNearbyInMapView"
        render={({ field }) => (
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium">
                        Mensagem para quem está perto
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Permite enviar mensagens às pessoas próximas no mapa.
                    </p>
                </div>
                <Switch
                    checked={field.value}
                    disabled={disabled}
                    onCheckedChange={field.onChange}
                />
            </div>
        )}
    />
);
