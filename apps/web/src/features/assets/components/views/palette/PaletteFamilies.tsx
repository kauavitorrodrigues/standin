import type { AssetDefinition } from "@standin/contracts";
import { cn } from "@/lib/utils";
import { PaletteFamilyButton } from "./PaletteFamilyButton";

type Props = {
    families: AssetDefinition[];
    onPick: (asset: AssetDefinition) => void;
    // The family to show as picked.
    selectedId?: string | null;
    showNames?: boolean;
    // Why a family cannot be picked, or null when it can.
    getDisabledReason?: (asset: AssetDefinition) => string | null;
};

export const PaletteFamilies = ({
    families,
    onPick,
    selectedId,
    showNames = true,
    getDisabledReason,
}: Props) => (
    <div className={cn("grid grid-cols-3 gap-2", { "gap-0": !showNames })}>
        {families.map((asset) => (
            <PaletteFamilyButton
                key={asset.id}
                asset={asset}
                onPick={onPick}
                selected={asset.id === selectedId}
                showName={showNames}
                disabledReason={getDisabledReason?.(asset) ?? null}
            />
        ))}
    </div>
);
