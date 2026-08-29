import { cn } from "@/lib/utils";

export const Logo = (props: React.ComponentProps<"span">) => {
    return (
        <span
            className={cn("text-lg font-semibold", props.className)}
            {...props}
        >
            STAND!N
        </span>
    );
};
