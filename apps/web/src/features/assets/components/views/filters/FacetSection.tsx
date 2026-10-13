import type { LibraryFacetOption } from "@standin/contracts";
import type { MetaItem } from "@/types/meta";
import { FacetOption } from "./FacetOption";

type Props = {
    title: string;
    options: LibraryFacetOption[];
    // Label and icon by option value. Options without an entry show the
    // label of the server and no icon.
    meta?: Record<string, MetaItem>;
    selected: string | null;
    onSelect: (value: string | null) => void;
};

// One group of the sidebar. Options with no family stay listed with a zero
// and disabled, and clicking the chosen one clears it.
export const FacetSection = ({
    title,
    options,
    meta,
    selected,
    onSelect,
}: Props) => (
    <section className="flex flex-col gap-0.5">
        <h4 className="text-muted-foreground px-3 pb-1 text-[11px] font-medium tracking-wider uppercase">
            {title}
        </h4>
        {options.map((option) => (
            <FacetOption
                key={option.value}
                option={option}
                item={meta?.[option.value]}
                active={option.value === selected}
                onSelect={onSelect}
            />
        ))}
    </section>
);
