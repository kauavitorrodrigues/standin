import type { AREA_STATUS_KIND } from "../consts/areaStatus";

export type AreaStatus =
    (typeof AREA_STATUS_KIND)[keyof typeof AREA_STATUS_KIND];
