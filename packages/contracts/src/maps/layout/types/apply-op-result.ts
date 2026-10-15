import type { MapLayout } from "../../schemas/layout.schema";
import type { LayoutIssue } from "../issues";

export type ApplyOpResult = {
    layout: MapLayout;
    errors: LayoutIssue[];
};
