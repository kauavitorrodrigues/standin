import { placeDesk } from "../../builders/placeDesk";
import type { Spec, SpecStep } from "../../types";
import { libraryRef } from "../compile/libraryRef";
import { toSpot } from "../compile/toSpot";

export const deskSteps = ({ desks = [] }: Spec): SpecStep[] =>
    desks.map((desk, index) => {
        const path = `desks[${index}]`;
        const items = desk.items ?? [];
        const chairs = desk.chairs ?? [];

        return {
            path,
            refs: [
                libraryRef("asset", desk.asset, `${path}.asset`),
                ...items.map((item, i) =>
                    libraryRef("asset", item.asset, `${path}.items[${i}].asset`)
                ),
                ...chairs.map((chair, i) =>
                    libraryRef(
                        "asset",
                        chair.asset,
                        `${path}.chairs[${i}].asset`
                    )
                ),
            ],
            build: (model) =>
                placeDesk(model, {
                    desk: desk.asset,
                    tileX: desk.x,
                    tileY: desk.y,
                    items: items.map(toSpot),
                    chairs: chairs.map(toSpot),
                }),
        };
    });
