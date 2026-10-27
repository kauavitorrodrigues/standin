import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

type CarouselButtonProps = {
    direction: "previous" | "next";
    isEnabled: boolean;
    onClick: () => void;
};

export const CarouselButton = ({
    direction,
    isEnabled,
    onClick,
}: CarouselButtonProps) => (
    <button
        type="button"
        aria-label={getLabel(direction)}
        disabled={!isEnabled}
        onClick={onClick}
        className="pointer-events-auto flex h-24 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-neutral-800 text-white shadow-lg ring-1 ring-white/10 disabled:cursor-default disabled:opacity-40"
    >
        <CarouselIcon direction={direction} />
    </button>
);

const getLabel = (direction: CarouselButtonProps["direction"]): string => {
    switch (direction) {
        case "next":
            return "Próxima página";
        case "previous":
            return "Página anterior";
    }
};

const CarouselIcon = ({ direction }: Pick<CarouselButtonProps, "direction">) => {
    switch (direction) {
        case "next":
            return <ChevronRightIcon className="size-4" />;
        case "previous":
            return <ChevronLeftIcon className="size-4" />;
    }
};
