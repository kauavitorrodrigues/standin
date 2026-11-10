import type { SpotifyConnectionEntry } from "@standin/contracts";
import { ChevronDownIcon, UsersIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Props = {
    connections: SpotifyConnectionEntry[];
    maxConnections: number;
    // The person being removed, to lock their button.
    removingUserId: string | null;
    onRemove: (userId: string) => void;
};

// Who holds the places of the app, with a way to free one. The list folds.
export const SpotifyConnectionsView = ({
    connections,
    maxConnections,
    removingUserId,
    onRemove,
}: Props) => (
    <Collapsible defaultOpen className="rounded-lg border">
        <CollapsibleTrigger className="group flex w-full flex-col gap-2.5 p-3">
            <div className="flex w-full items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-semibold">
                    <UsersIcon className="size-4 text-muted-foreground" />
                    Pessoas conectadas
                </span>
                <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    {connections.length} de {maxConnections} vagas
                    <ChevronDownIcon className="size-4 transition-transform group-data-panel-open:rotate-180" />
                </span>
            </div>
            <div className="flex w-full gap-1" aria-hidden>
                {Array.from({ length: maxConnections }, (_, index) => (
                    <span
                        key={index}
                        className={cn(
                            "h-1 flex-1 rounded-full bg-foreground/10",
                            index < connections.length && "bg-primary"
                        )}
                    />
                ))}
            </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
            <div className="border-t p-2">
                {connections.length === 0 && (
                    <span className="block p-2 text-[13px] text-muted-foreground">
                        Ninguém conectou o Spotify ainda.
                    </span>
                )}
                <ul className="flex flex-col gap-1">
                    {connections.map((connection) => (
                        <li
                            key={connection.userId}
                            className="flex items-center justify-between gap-3 rounded-md p-2"
                        >
                            <div className="flex min-w-0 items-center gap-2.5">
                                <Avatar size="sm">
                                    {connection.imageUrl && (
                                        <AvatarImage
                                            src={connection.imageUrl}
                                            alt=""
                                        />
                                    )}
                                    <AvatarFallback>
                                        {connection.name.slice(0, 1)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="min-w-0 truncate text-sm">
                                    {connection.name}
                                </span>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={removingUserId === connection.userId}
                                onClick={() => onRemove(connection.userId)}
                            >
                                Remover
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
        </CollapsibleContent>
    </Collapsible>
);
