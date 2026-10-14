import { Controller, useFormContext } from "react-hook-form";
import { MapPinIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { AreaComposerFormValues } from "../../types/areaComposerForm";

// Whether placing the area also creates a zone of the area, named after it.
export const AreaZoneBox = () => {
    const { control } = useFormContext<AreaComposerFormValues>();

    return (
        <div className="bg-card flex flex-col gap-4 rounded-xl border p-4">
            <div className="flex items-start gap-3">
                <span className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <MapPinIcon className="size-4" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <label
                        htmlFor="createZone"
                        className="text-sm leading-snug font-medium"
                    >
                        Criar uma zona ao colocar
                    </label>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                        Ao colocar a área num mapa, ela vira uma zona com o nome
                        da área, que aparece no editor e para quem estiver no
                        espaço.
                    </p>
                </div>
                <Controller
                    control={control}
                    name="createZone"
                    render={({ field }) => (
                        <Switch
                            id="createZone"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    )}
                />
            </div>
        </div>
    );
};
