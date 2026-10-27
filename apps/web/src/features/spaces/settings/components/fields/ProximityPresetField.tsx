import { Controller, type Control } from "react-hook-form";
import type { SpaceSettings, SpaceSettingsInput } from "@standin/contracts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Props = {
    control: Control<SpaceSettingsInput, unknown, SpaceSettings>;
    disabled?: boolean;
};

/**
 * How far voice and video reach in the space: Short for a close talk, Long
 * for a whole room.
 */
export const ProximityPresetField = ({ control, disabled }: Props) => (
    <Controller
        control={control}
        name="proximityPreset"
        render={({ field }) => (
            <div className="flex flex-col gap-2">
                <div>
                    <p className="text-sm font-medium">Alcance da voz e do vídeo</p>
                    <p className="text-xs text-muted-foreground">
                        Até onde as pessoas se ouvem e se veem no mapa.
                    </p>
                </div>
                <Select
                    value={field.value}
                    onValueChange={(next) => {
                        if (next !== null) field.onChange(next);
                    }}
                    disabled={disabled}
                >
                    <SelectTrigger id={field.name}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Short">
                            Curto: conversa próxima, cerca de 5 passos
                        </SelectItem>
                        <SelectItem value="Long">
                            Longo: uma sala inteira, cerca de 12 passos
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        )}
    />
);
