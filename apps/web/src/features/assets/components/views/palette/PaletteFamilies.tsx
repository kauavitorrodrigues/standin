import type { AssetDefinition } from "@standin/contracts";
import { PaletteFamilyButton } from "./PaletteFamilyButton";

type Props = {
    families: AssetDefinition[];
    onPick: (asset: AssetDefinition) => void;
};

export const PaletteFamilies = ({ families, onPick }: Props) => (
    <div className="flex flex-wrap gap-1">
        {families.map((asset) => (
            <PaletteFamilyButton key={asset.id} asset={asset} onPick={onPick} />
        ))}
    </div>
);
