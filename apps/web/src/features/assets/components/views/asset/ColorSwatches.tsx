import type { AssetDefinition } from "@standin/contracts";

type Props = {
    siblings: AssetDefinition[];
    currentId: string;
    disabled?: boolean;
    onSelect: (asset: AssetDefinition) => void;
};

// One circle per color variant, from `colorHex`. Hidden when there is nothing
// to choose.
export function ColorSwatches({
    siblings,
    currentId,
    disabled = false,
    onSelect,
}: Props) {
    if (siblings.length < 2) return null;

    return (
        <div
            className="flex items-center gap-1.5"
            role="group"
            aria-label="Cor"
        >
            {siblings.map((asset) => {
                const isCurrent = asset.id === currentId;
                return (
                    <button
                        key={asset.id}
                        type="button"
                        title={asset.colorKey ?? undefined}
                        aria-label={asset.colorKey ?? asset.name}
                        aria-pressed={isCurrent}
                        disabled={disabled || isCurrent}
                        onClick={() => onSelect(asset)}
                        style={{ backgroundColor: asset.colorHex ?? undefined }}
                        className="size-5 rounded-full border border-border ring-offset-2 ring-offset-background transition-shadow aria-pressed:ring-2 aria-pressed:ring-ring disabled:cursor-default"
                    />
                );
            })}
        </div>
    );
}
