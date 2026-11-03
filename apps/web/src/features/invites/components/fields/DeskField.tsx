import type { FreeDesk } from "@standin/contracts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Props = {
    desks: FreeDesk[];
    value: string | null;
    isLoading: boolean;
    isDisabled: boolean;
    onChange: (mapAssetId: string) => void;
};

const describePlaceholder = (hasDesks: boolean, isLoading: boolean): string => {
    if (!hasDesks && !isLoading) return "Nenhuma mesa livre neste espaço";
    return "Escolha uma mesa";
};

export const DeskField = ({
    desks,
    value,
    isLoading,
    isDisabled,
    onChange,
}: Props) => (
    <Select
        value={value}
        onValueChange={(mapAssetId) => {
            if (mapAssetId) onChange(mapAssetId);
        }}
        disabled={isDisabled || isLoading || desks.length === 0}
    >
        <SelectTrigger aria-label="Mesa">
            <SelectValue
                placeholder={describePlaceholder(desks.length > 0, isLoading)}
            />
        </SelectTrigger>
        <SelectContent>
            {desks.map((desk) => (
                <SelectItem key={desk.mapAssetId} value={desk.mapAssetId}>
                    {desk.name} ({desk.tileX}, {desk.tileY})
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);
