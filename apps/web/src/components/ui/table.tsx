import * as React from "react";

import { cn } from "@/lib/utils";

type TableProps = React.ComponentProps<"table"> & {
    // Classes of the box around the table, which scrolls sideways when the
    // table is wider than the screen.
    containerClassName?: string;
};

function Table({ className, containerClassName, ...props }: TableProps) {
    return (
        <div
            data-slot="table-container"
            className={cn(
                "relative w-full overflow-x-auto rounded-lg border",
                containerClassName
            )}
        >
            <table
                data-slot="table"
                className={cn("w-full border-collapse text-sm", className)}
                {...props}
            />
        </div>
    );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
    return (
        <thead
            data-slot="table-header"
            className={cn(
                "bg-muted/50 text-xs text-muted-foreground",
                className
            )}
            {...props}
        />
    );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
    return <tbody data-slot="table-body" className={className} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
    return (
        <tr
            data-slot="table-row"
            className={cn(
                "border-t transition-colors first:border-t-0 hover:bg-muted/30",
                className
            )}
            {...props}
        />
    );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
    return (
        <th
            data-slot="table-head"
            className={cn(
                "px-3 py-2 text-left align-middle font-medium whitespace-nowrap",
                className
            )}
            {...props}
        />
    );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
    return (
        <td
            data-slot="table-cell"
            className={cn("px-3 py-2.5 align-middle", className)}
            {...props}
        />
    );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
