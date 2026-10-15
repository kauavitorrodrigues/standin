import type { MAP_OWNER_KINDS } from "../consts/owner";

export type MapOwner =
    | {
          kind: typeof MAP_OWNER_KINDS.SPACE;
          spaceId: string;
          organizationId: string;
      }
    | {
          kind: typeof MAP_OWNER_KINDS.TEMPLATE;
          templateId: string;
          organizationId: string | null;
      };
