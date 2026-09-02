import type { ReactNode } from "react";
import { Inbox, type LucideIcon } from "lucide-react";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

type Variant = "error" | "empty";

type Props = {
    className?: string;
    message?: string;
    title?: string;
    icon?: LucideIcon;
    variant?: Variant;
    children?: ReactNode;
    titleClassName?: string;
    descriptionClassName?: string;
    iconClassName?: string;
};

function Title({
    title,
    className,
}: {
    title: string | undefined;
    className?: string;
}) {
    if (!title) return null;

    return <EmptyTitle className={cn(className)}>{title}</EmptyTitle>;
}

export function ListResponseState({
    className,
    title,
    titleClassName,
    iconClassName,
    descriptionClassName,
    message = "Nenhum resultado encontrado",
    icon: Icon = Inbox,
    variant = "error",
    children,
}: Props) {
    const mediaVariant = variant === "error" ? "icon" : "default";
    const mediaClassName =
        variant === "error" ? "rounded-full bg-destructive p-4" : undefined;
    const iconColorClassName = variant === "error" ? "text-white" : undefined;
    const descriptionVariantClassName =
        variant === "error" ? "text-sm/relaxed text-destructive" : undefined;

    return (
        <Empty className={cn("h-full flex-1", className)}>
            <EmptyHeader>
                <EmptyMedia
                    variant={mediaVariant}
                    className={cn(mediaClassName)}
                >
                    <Icon
                        className={cn(
                            "text-muted-foreground",
                            iconColorClassName,
                            iconClassName
                        )}
                        size={20}
                    />
                </EmptyMedia>
                <Title title={title} className={titleClassName} />
                <EmptyDescription
                    className={cn(
                        descriptionClassName,
                        descriptionVariantClassName
                    )}
                >
                    {message}
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>{children}</EmptyContent>
        </Empty>
    );
}
