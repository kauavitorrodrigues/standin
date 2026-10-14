import type { AreaDetail } from "@standin/contracts";
import { findScopedArea } from "./utils/findArea";
import { toAreaDetail } from "./utils/toAreaSummary";

/** One area with its stamp, for the composer. */
export const getArea = async (
    id: string,
    organizationId: string | null
): Promise<AreaDetail> =>
    toAreaDetail(await findScopedArea(id, organizationId));
