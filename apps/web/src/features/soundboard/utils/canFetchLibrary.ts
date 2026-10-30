import type { ClipListSource } from "../types/library";

/** An organization's library waits for its organization, the admin's has none. */
export const canFetchLibrary = ({
    kind,
    organizationId,
}: ClipListSource): boolean => kind === "admin" || organizationId !== "";
