import {
    AVATAR,
    type AvatarAnimation,
    type PlayerDirection,
} from "@standin/contracts";
import { LAB_DEPTH } from "../../../consts/lab";
import { GhostSprite } from "../GhostSprite";
import { LabBox } from "./LabBox";
import { LabNameTag } from "./LabNameTag";

export type LabGuides = {
    frame: boolean;
    visible: boolean;
    body: boolean;
    anchor: boolean;
    nameTag: boolean;
};

type Props = {
    name: string;
    // Where the feet are, in px of the scene.
    x: number;
    feetY: number;
    direction?: PlayerDirection;
    animation?: AvatarAnimation;
    // Overrides the depth, which is the Y of the feet by default.
    zIndex?: number;
    guides: LabGuides;
};

const ANCHOR_DOT_PX = 3;

// The ghost with the measures of the grid drawn over it: the frame, the
// visible body, the collision body, the anchor and the name tag.
export const LabAvatar = ({
    name,
    x,
    feetY,
    direction,
    animation,
    zIndex = feetY,
    guides,
}: Props) => (
    <>
        <GhostSprite
            x={x}
            feetY={feetY}
            direction={direction}
            animation={animation}
            zIndex={zIndex}
        />
        <LabBox
            isVisible={guides.frame}
            left={x - AVATAR.anchor.x}
            top={feetY - AVATAR.anchor.y}
            width={AVATAR.frame.w}
            height={AVATAR.frame.h}
            zIndex={LAB_DEPTH.GUIDES}
            className="outline outline-1 -outline-offset-1 outline-dashed outline-sky-400"
        />
        <LabBox
            isVisible={guides.visible}
            left={x - AVATAR.visible.w / 2}
            top={feetY - AVATAR.visible.h}
            width={AVATAR.visible.w}
            height={AVATAR.visible.h}
            zIndex={LAB_DEPTH.GUIDES}
            className="outline outline-1 -outline-offset-1 outline-emerald-400"
        />
        <LabBox
            isVisible={guides.body}
            left={x - AVATAR.body.w / 2}
            top={feetY - AVATAR.body.h}
            width={AVATAR.body.w}
            height={AVATAR.body.h}
            zIndex={LAB_DEPTH.GUIDES}
            className="bg-red-500/30 outline outline-1 -outline-offset-1 outline-red-500"
        />
        <LabBox
            isVisible={guides.anchor}
            left={x - ANCHOR_DOT_PX / 2}
            top={feetY - ANCHOR_DOT_PX / 2}
            width={ANCHOR_DOT_PX}
            height={ANCHOR_DOT_PX}
            zIndex={LAB_DEPTH.GUIDES}
            className="rounded-full bg-yellow-300"
        />
        <LabNameTag
            isVisible={guides.nameTag}
            name={name}
            x={x}
            feetY={feetY}
        />
    </>
);
