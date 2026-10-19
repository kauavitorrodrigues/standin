import { useMemo } from "react";
import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApplyingColor } from "../../hooks/useApplyingColor";
import { useSheetPixels } from "../../queries/useSheetPixels";
import type { AvatarCategoryPartVariation } from "../../types/editor";

type ColorSwatchProps = {
    variation: AvatarCategoryPartVariation;
    isSelected: boolean;
    onSelect: (variation: AvatarCategoryPartVariation) => void;
};

const Spinner = () => (
    <Loader2Icon className="absolute inset-0 m-auto size-4 animate-spin text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]" />
);

type FetchingMarkProps = { url: string };

// The spinner while the sheet of the chosen color is still being fetched and
// decoded. The preview waits for the same query.
const FetchingMark = ({ url }: FetchingMarkProps) => {
    const urls = useMemo(() => [url], [url]);
    const { isLoading } = useSheetPixels(urls);
    if (!isLoading) return null;

    return <Spinner />;
};

type LoadingMarkProps = {
    isApplying: boolean;
    isSelected: boolean;
    url: string;
};

// What sits over the dot: the spinner while the pick is being applied, or
// while the sheet of the chosen color is still arriving.
const LoadingMark = ({ isApplying, isSelected, url }: LoadingMarkProps) => {
    if (isApplying) return <Spinner />;
    if (!isSelected) return null;

    return <FetchingMark url={url} />;
};

// One color of the chosen part. The dot is the hex the admin registered with
// the variation, it is not applied to the sheet.
export const ColorSwatch = ({
    variation,
    isSelected,
    onSelect,
}: ColorSwatchProps) => {
    const { isApplying, select } = useApplyingColor(isSelected, () =>
        onSelect(variation)
    );

    return (
        <button
            type="button"
            title={variation.colorKey ?? undefined}
            aria-label={variation.colorKey ?? variation.id}
            aria-pressed={isSelected}
            aria-busy={isApplying}
            onClick={select}
            style={{ backgroundColor: variation.colorHex ?? undefined }}
            className={cn(
                "relative size-7 rounded-full border border-black/10 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring/50",
                {
                    "ring-2 ring-blue-500 ring-offset-2 ring-offset-background":
                        isSelected,
                }
            )}
        >
            <LoadingMark
                isApplying={isApplying}
                isSelected={isSelected}
                url={variation.url}
            />
        </button>
    );
};
