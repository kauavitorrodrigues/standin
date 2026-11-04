import { Controller, type Control } from "react-hook-form";
import type { SpaceSettings, SpaceSettingsInput } from "@standin/contracts";
import { Switch } from "@/components/ui/switch";

type Props = {
    control: Control<SpaceSettingsInput, unknown, SpaceSettings>;
    disabled?: boolean;
};

export const MembersCanInviteField = ({ control, disabled }: Props) => (
    <Controller
        control={control}
        name="membersCanInvite"
        render={({ field }) => (
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium">
                        Membros podem convidar
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Qualquer membro da organização pode copiar o link de
                        convidados. Só vale com convidados aceitos.
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
