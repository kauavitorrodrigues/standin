import { Link } from "@tanstack/react-router";
import type { Space } from "@standin/contracts";
import { getSpaceGradient } from "@/features/spaces/utils/gradient";
import { SpaceActions } from "@/features/spaces/components/SpaceActions";

export function SpaceCard({ space }: { space: Space }) {
    return (
        <div className="group flex flex-col gap-2">
            <Link
                to="/spaces/$spaceId"
                params={{ spaceId: space.id }}
                className="relative aspect-video w-full cursor-pointer rounded-xl transition-opacity hover:opacity-90"
                style={{ backgroundImage: getSpaceGradient(space.id) }}
            >
                <div
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <SpaceActions space={space} />
                </div>
            </Link>
            <span className="px-1 text-sm font-medium">{space.name}</span>
        </div>
    );
}
