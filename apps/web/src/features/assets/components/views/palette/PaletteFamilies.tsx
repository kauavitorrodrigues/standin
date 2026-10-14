import type { AssetDefinition } from "@standin/contracts";
import { PaletteFamilyButton } from "./PaletteFamilyButton";

type Props = {
    families: AssetDefinition[];
    onPick: (asset: AssetDefinition) => void;
    // The family to show as picked.
    selectedId?: string | null;
};

export const PaletteFamilies = ({ families, onPick, selectedId }: Props) => (
    <div className="grid grid-cols-3 gap-2">
        {families.map((asset) => (
            <PaletteFamilyButton
                key={asset.id}
                asset={asset}
                onPick={onPick}
                selected={asset.id === selectedId}
            />
        ))}
    </div>
);
