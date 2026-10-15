import type { LibraryFacetOption } from "@standin/contracts";
import type { MetaItem } from "@/types/meta";
import { getFacetLabel } from "../../../utils/getFacetLabel";
import { FacetIcon } from "./FacetIcon";

type Props = {
    option: LibraryFacetOption;
    // Label and icon of the option, when the page knows them. Otherwise the
    // label is the one of the server and there is no icon.
    item: MetaItem | undefined;
    active: boolean;
    onSelect: (value: string | null) => void;
};

// One option of a group: its name, how many families have it, and a click to
// pick it or, when it is the chosen one, to clear it.
export const FacetOption = ({ option, item, active, onSelect }: Props) => {
    const { value, label, count } = option;

    const handleClick = () => {
        if (active) return onSelect(null);
        onSelect(value);
    };

    return (
        <button
            type="button"
            disabled={count === 0 && !active}
            onClick={handleClick}
            data-active={active}
            className="hover:bg-muted data-[active=true]:bg-muted flex items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm disabled:pointer-events-none disabled:opacity-40 data-[active=true]:font-medium"
        >
            <FacetIcon icon={item?.icon} />
            <span className="flex-1 truncate">
                {getFacetLabel(item, label)}
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">
                {count}
            </span>
        </button>
    );
};
