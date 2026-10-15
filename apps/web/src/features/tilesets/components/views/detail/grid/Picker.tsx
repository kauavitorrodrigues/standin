import type { ReactNode } from "react";
import {
    ChevronDownIcon,
    Grid3x3Icon,
    SlidersHorizontalIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import type { GridSuggestion } from "../../../../types/sheet";
import { getGridSuggestionDescription } from "../../../../utils/grid/getGridSuggestionDescription";
import { TilesetGridOption } from "./Option";

type Props = {
    // The ways the image divides into cells.
    suggestions: GridSuggestion[];
    // The margin and the spacing typed now, to say which division is in use.
    margin: number | undefined;
    spacing: number | undefined;
    disabled: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // The fields are open, to type the margin and the spacing.
    typing: boolean;
    onTypingChange: (typing: boolean) => void;
    onPick: (suggestion: GridSuggestion) => void;
    // The fields to type the margin and the spacing by hand, in the same
    // popover (under the option "Personalizado"), so they can be changed
    // without closing it. Left out when there is nowhere to type them.
    customFields?: ReactNode;
    // What the popover says about the grid typed, like why it does not fit, so
    // it is read without closing it.
    notice?: ReactNode;
    // What the grid reads as, shown on the button (and alone when there is
    // nothing to pick).
    children: ReactNode;
};

// The grid of the sheet as a button, as wide as the room it has, that opens
// the ways the image divides into cells, so the margin and the spacing do not
// have to be guessed: picking one fills them. "Personalizado" opens the
// margin and the spacing to be typed, in the same popover, with the notice
// about the grid under them.
export const TilesetGridPicker = ({
    suggestions,
    margin,
    spacing,
    disabled,
    open,
    onOpenChange,
    typing,
    onTypingChange,
    onPick,
    customFields,
    notice,
    children,
}: Props) => {
    if (suggestions.length === 0 && !customFields) return <>{children}</>;

    const fitsSuggestion = suggestions.some(
        (item) =>
            item.margin === (margin ?? 0) && item.spacing === (spacing ?? 0)
    );
    // The fields stay while the typed grid is none of the divisions. While they
    // are shown, it is "Personalizado" that is checked.
    const showFields = typing || !fitsSuggestion;

    const pick = (suggestion: GridSuggestion) => {
        onPick(suggestion);
        onTypingChange(false);
        onOpenChange(false);
    };

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger
                render={
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={disabled}
                        className="h-8 w-full justify-between gap-2 font-medium"
                    />
                }
            >
                <span className="truncate">{children}</span>
                <ChevronDownIcon />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 p-1">
                <ul className="flex flex-col">
                    {suggestions.map((item) => (
                        <li key={`${item.margin}-${item.spacing}`}>
                            <TilesetGridOption
                                icon={Grid3x3Icon}
                                title={`${item.columns} × ${item.rows}`}
                                description={getGridSuggestionDescription(item)}
                                active={
                                    !showFields &&
                                    item.margin === (margin ?? 0) &&
                                    item.spacing === (spacing ?? 0)
                                }
                                onClick={() => pick(item)}
                            />
                        </li>
                    ))}
                </ul>
                <CustomOption
                    show={customFields !== undefined}
                    active={showFields}
                    onClick={() => onTypingChange(true)}
                />
                <CustomFields show={showFields}>{customFields}</CustomFields>
                <Notice>{notice}</Notice>
            </PopoverContent>
        </Popover>
    );
};

// The option that opens the fields to type the margin and the spacing.
const CustomOption = ({
    show,
    active,
    onClick,
}: {
    show: boolean;
    active: boolean;
    onClick: () => void;
}) => {
    if (!show) return null;

    return (
        <div className="mt-1 border-t pt-1">
            <TilesetGridOption
                icon={SlidersHorizontalIcon}
                title="Personalizado"
                description="Digite a margem e o espaçamento"
                active={active}
                onClick={onClick}
            />
        </div>
    );
};

const CustomFields = ({
    show,
    children,
}: {
    show: boolean;
    children: ReactNode;
}) => {
    if (!show || !children) return null;

    return <div className="p-2 pt-3">{children}</div>;
};

const Notice = ({ children }: { children: ReactNode }) => {
    if (!children) return null;

    return <div className="p-2 pt-0">{children}</div>;
};
