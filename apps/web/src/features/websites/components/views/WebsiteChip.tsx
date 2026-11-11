import {
    CopyIcon,
    EyeOffIcon,
    ExternalLinkIcon,
    GlobeIcon,
    Maximize2Icon,
    Minimize2Icon,
    UsersIcon,
    XIcon,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { FloatingWidget } from "@/components/FloatingWidget";
import { AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import { WEBSITE_CHIP_AVATARS_SHOWN } from "../../consts/chip";
import type { WebsiteViewerPerson } from "../../types/viewers";

type WebsiteChipProps = {
    title: string;
    host: string;
    faviconUrl: string | null;
    viewers: readonly WebsiteViewerPerson[];
    isMinimized: boolean;
    // Guests look at the site but do not decide for the others.
    canCloseForViewers: boolean;
    onMenuOpenChange: (isOpen: boolean) => void;
    onCopyLink: () => void;
    onToggleMinimized: () => void;
    onOpenInTab: () => void;
    onCloseForViewers: () => void;
    onClose: () => void;
};

// Roomier than the default item, with the icon in a muted tone so the label
// leads.
const itemClass =
    "gap-2.5 rounded-lg px-2.5 py-2 text-sm [&_svg]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4";

// The pill at the top right of the stage while a website is open: what it is,
// who is looking at it, and the way out. A click on it opens the menu.
export const WebsiteChip = ({
    title,
    host,
    faviconUrl,
    viewers,
    isMinimized,
    canCloseForViewers,
    onMenuOpenChange,
    onCopyLink,
    onToggleMinimized,
    onOpenInTab,
    onCloseForViewers,
    onClose,
}: WebsiteChipProps) => {
    const shown = viewers.slice(0, WEBSITE_CHIP_AVATARS_SHOWN);
    const hiddenCount = viewers.length - shown.length;

    return (
        <FloatingWidget className="h-8 max-w-full items-stretch gap-0 overflow-hidden p-0 text-foreground">
            <DropdownMenu onOpenChange={onMenuOpenChange}>
                <DropdownMenuTrigger
                    aria-label="Opções do site"
                    className="flex h-full min-w-0 items-center gap-2 px-2.5 outline-none hover:bg-foreground/10 focus-visible:bg-foreground/10"
                >
                    {faviconUrl ? (
                        <img
                            src={faviconUrl}
                            alt=""
                            className="size-4 shrink-0 rounded-sm"
                        />
                    ) : (
                        <GlobeIcon className="size-4 shrink-0 text-foreground/80" />
                    )}
                    <span className="max-w-48 truncate text-sm font-semibold">
                        {title}
                    </span>
                    {viewers.length > 0 && (
                        <AvatarGroup className="-space-x-1.5">
                            {shown.map((person) => (
                                <UserAvatar
                                    key={person.userId}
                                    id={person.userId}
                                    name={person.name}
                                    avatar={person.avatar}
                                    size="xs"
                                />
                            ))}
                            {hiddenCount > 0 && (
                                <AvatarGroupCount className="size-5 text-[0.6rem] font-semibold text-foreground">
                                    +{Math.min(hiddenCount, 99)}
                                </AvatarGroupCount>
                            )}
                        </AvatarGroup>
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-72 rounded-2xl p-1.5 shadow-xl"
                >
                    <div className="flex items-center gap-2.5 px-2.5 pt-2 pb-2.5">
                        {faviconUrl ? (
                            <img
                                src={faviconUrl}
                                alt=""
                                className="size-5 shrink-0 rounded"
                            />
                        ) : (
                            <GlobeIcon className="size-5 shrink-0 text-muted-foreground" />
                        )}
                        <div className="flex min-w-0 flex-col">
                            <span className="truncate text-sm leading-tight font-semibold">
                                {title}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                                {host}
                            </span>
                        </div>
                    </div>
                    <DropdownMenuSeparator className="mx-1 my-1" />
                    <DropdownMenuItem
                        className={itemClass}
                        onClick={onCopyLink}
                    >
                        <CopyIcon />
                        Copiar link
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className={itemClass}
                        onClick={onToggleMinimized}
                    >
                        {isMinimized ? <Maximize2Icon /> : <Minimize2Icon />}
                        {isMinimized ? "Expandir" : "Minimizar"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className={itemClass}
                        onClick={onOpenInTab}
                    >
                        <ExternalLinkIcon />
                        Abrir em nova aba
                    </DropdownMenuItem>
                    {canCloseForViewers && (
                        <DropdownMenuItem
                            variant="destructive"
                            className={cn(
                                itemClass,
                                "[&_svg]:text-destructive"
                            )}
                            onClick={onCloseForViewers}
                        >
                            <EyeOffIcon />
                            Fechar para quem está vendo
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="mx-1 my-1" />
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="flex items-center gap-2 px-2.5 pt-1.5 pb-1 text-xs tracking-wide uppercase">
                            <UsersIcon className="size-3.5" />
                            Visualizando agora
                            <span className="ml-auto flex h-5.5 min-w-5.5 items-center justify-center rounded-full bg-foreground/15 px-1.5 text-xs leading-none font-semibold text-foreground normal-case tabular-nums">
                                {viewers.length}
                            </span>
                        </DropdownMenuLabel>
                        <ul className="flex max-h-44 flex-col overflow-y-auto overscroll-contain pb-0.5 [scrollbar-color:var(--color-muted-foreground)_transparent] [scrollbar-width:thin]">
                            {viewers.map((person) => (
                                <li
                                    key={person.userId}
                                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm"
                                >
                                    <UserAvatar
                                        id={person.userId}
                                        name={person.name}
                                        avatar={person.avatar}
                                        size="sm"
                                    />
                                    <span className="min-w-0 truncate">
                                        {person.name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <span aria-hidden className="w-px self-stretch bg-foreground/15" />
            <button
                type="button"
                aria-label="Fechar"
                onClick={onClose}
                className="flex w-8 shrink-0 items-center justify-center text-muted-foreground outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:bg-foreground/10"
            >
                <XIcon className="size-4" />
            </button>
        </FloatingWidget>
    );
};
