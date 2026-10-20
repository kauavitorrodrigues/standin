import { RotateCwIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PART_GRID_GAP, PART_GRID_ROW_HEIGHT } from "../../consts/editor/grid";
import { getGridTemplate } from "../../utils/gridColumns";

type NextPageRowProps = {
    offset: number;
    columns: number;
    isError: boolean;
    onRetry: () => void;
};

type RowShellProps = {
    offset: number;
    columns: number;
    children: ReactNode;
};

const RowShell = ({ offset, columns, children }: RowShellProps) => (
    <div
        className="absolute top-0 left-0 grid w-full"
        style={{
            height: PART_GRID_ROW_HEIGHT - PART_GRID_GAP,
            transform: `translateY(${offset}px)`,
            gridTemplateColumns: getGridTemplate(columns),
            justifyContent: "space-between",
            gap: PART_GRID_GAP,
        }}
    >
        {children}
    </div>
);

type NextPageErrorProps = {
    offset: number;
    columns: number;
    onRetry: () => void;
};

const NextPageError = ({ offset, columns, onRetry }: NextPageErrorProps) => (
    <RowShell offset={offset} columns={columns}>
        <div className="col-span-full flex items-center justify-center gap-3 text-sm text-muted-foreground">
            Não foi possível carregar mais peças.
            <Button
                type="button"
                size="sm"
                variant="outline"
                icon={RotateCwIcon}
                onClick={onRetry}
            >
                Tentar de novo
            </Button>
        </div>
    </RowShell>
);

type NextPageLoadingProps = { offset: number; columns: number };

const NextPageLoading = ({ offset, columns }: NextPageLoadingProps) => (
    <RowShell offset={offset} columns={columns}>
        {Array.from({ length: columns }, (_, index) => (
            <Skeleton key={index} className="size-full rounded-xl" />
        ))}
    </RowShell>
);

// The row after the last tile, while there are more pages. It shows
// placeholders while the next page loads, or a retry when it failed.
export const NextPageRow = ({
    offset,
    columns,
    isError,
    onRetry,
}: NextPageRowProps) => {
    if (isError) {
        return (
            <NextPageError
                offset={offset}
                columns={columns}
                onRetry={onRetry}
            />
        );
    }

    return <NextPageLoading offset={offset} columns={columns} />;
};
