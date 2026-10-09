import type { SpaceUnavailableReason } from "@/features/spaces/consts/availability";
import { SpacePageRoot } from "@/features/spaces/components/pages/space-page/Root";
import { SpacePageLayout as LayoutPrimitive } from "@/features/spaces/components/pages/space-page/layout";
import { RailFrame } from "@/features/spaces/components/pages/space-page/sidebar/Rail";
import { SpaceMenu } from "@/features/spaces/components/pages/space-page/sidebar/SpaceMenu";
import { UNAVAILABLE_STATE_BY_REASON } from "@/features/spaces/components/pages/space-page/unavailableStates";

type Props = { reason: SpaceUnavailableReason };

// The page shell for a space that cannot be used. Only the menu stays in the
// rail, so there is still a way out.
export const SpaceUnavailable = ({ reason }: Props) => {
    const State = UNAVAILABLE_STATE_BY_REASON[reason];

    return (
        <SpacePageRoot>
            <LayoutPrimitive.Body>
                <RailFrame>
                    <SpaceMenu />
                </RailFrame>
                <LayoutPrimitive.Content>
                    <State />
                </LayoutPrimitive.Content>
            </LayoutPrimitive.Body>
        </SpacePageRoot>
    );
};
