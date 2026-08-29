import { cn } from "@/lib/utils";
import { useParams } from "@tanstack/react-router";
import { SpacesQueries } from "@/features/spaces/queries";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import { Actions } from "@/features/spaces/components/pages/space-page/layout/Actions";
import { ClipboardCopyButton } from "@/components/layout/ClipboardCopyDisplay";

type Props = { className?: string };
export const Header = ({ className }: Props) => {
    const { spaceId } = useParams({ strict: false });
    const { organization } = useOrganization();
    const { space } = SpacesQueries.useDetails(
        organization?.id ?? "",
        spaceId ?? ""
    );

    if (!organization || !spaceId || !space) return null;

    return (
        <div
            className={cn(
                "grid h-14 w-full shrink-0 grid-cols-3 items-center border-b border-border px-4",
                className
            )}
        >
            <div className="flex items-center gap-1">
                <ClipboardCopyButton
                    text={window.location.href}
                    copyLabel="Copiar URL"
                    copiedLabel="URL copiada!"
                />
            </div>
            <span className="truncate text-center text-sm font-medium">
                {space.name}
            </span>
            <div className="flex items-center justify-end">
                <Actions space={space} />
            </div>
        </div>
    );
};
