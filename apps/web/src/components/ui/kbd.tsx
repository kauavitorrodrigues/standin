import { cn } from "@/lib/utils";

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
    return (
        <kbd
            data-slot="kbd"
            className={cn(
                "pointer-events-none inline-flex h-5 min-w-5 items-center justify-center rounded-sm bg-white/15 px-1 font-sans text-[0.7rem] font-medium text-white select-none",
                className
            )}
            {...props}
        />
    );
}

export { Kbd };
