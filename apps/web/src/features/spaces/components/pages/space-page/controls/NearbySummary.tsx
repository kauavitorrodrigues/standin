import type { StageTile } from "@/features/spaces/types/stage";
import { NEARBY_MAX_VISIBLE_AVATARS } from "@/features/spaces/consts/controls";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import { OrganizationsQueries } from "@/features/organizations/queries";

type Props = { people: StageTile[] };

// A small circle in place of the avatars that did not fit: "+7".
const OverflowAvatar = ({ hiddenCount }: { hiddenCount: number }) => {
    if (hiddenCount <= 0) return null;

    return (
        <span
            aria-label={`Mais ${hiddenCount} pessoas por perto`}
            className="flex size-5 items-center justify-center rounded-full bg-background text-[0.6rem] font-medium text-foreground ring-2 ring-background"
        >
            +{hiddenCount}
        </span>
    );
};

// The avatars of the people near you side by side, then how many they are.
export const NearbySummary = ({ people }: Props) => {
    const { members } = OrganizationsQueries.useMembers();
    const avatarByUserId = new Map(
        members.map((member) => [member.id, member.avatarUrl])
    );
    const visiblePeople = people.slice(0, NEARBY_MAX_VISIBLE_AVATARS);
    const hiddenCount = people.length - visiblePeople.length;

    return (
        <span className="flex items-center gap-2">
            <span className="flex -space-x-2">
                {visiblePeople.map((person) => (
                    <UserAvatar
                        key={person.id}
                        id={person.userId ?? person.id}
                        name={person.label}
                        avatar={avatarByUserId.get(person.userId ?? "")}
                        size="xs"
                        className="ring-2 ring-background"
                    />
                ))}
                <OverflowAvatar hiddenCount={hiddenCount} />
            </span>
        </span>
    );
};
