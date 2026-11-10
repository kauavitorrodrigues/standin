import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { AppStatus } from "@/features/integrations/types/app";
import { AppIcon } from "./AppIcon";
import { AppStatusBadge } from "./StatusBadge";
import { AppTags } from "./AppTags";

type Props = {
    icon: ReactNode;
    name: string;
    provider: string;
    status: AppStatus;
    description: string;
    tags: string[];
    onOpen: () => void;
};

// One app of the organization: logo, who makes it, whether it is connected, a
// short description and the way into its details.
export const AppCard = ({
    icon,
    name,
    provider,
    status,
    description,
    tags,
    onOpen,
}: Props) => (
    <Card>
        <CardContent className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <AppIcon>{icon}</AppIcon>
                    <div className="flex min-w-0 flex-col">
                        <span className="truncate text-[15px] font-semibold">
                            {name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                            Por {provider}
                        </span>
                    </div>
                </div>
                <AppStatusBadge status={status} />
            </div>
            <p className="text-[13px] text-muted-foreground">{description}</p>
            <AppTags tags={tags} />
        </CardContent>
        <CardFooter className="border-t p-0">
            <Button
                type="button"
                variant="ghost"
                className="h-10 w-full justify-end rounded-none px-4"
                onClick={onOpen}
            >
                Ver detalhes
            </Button>
        </CardFooter>
    </Card>
);
