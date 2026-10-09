import type { SpaceDetails } from "@standin/contracts";
import {
    SPACE_AVAILABILITY_STATUS,
    type SpaceUnavailableReason,
} from "@/features/spaces/consts/availability";

// Either the space is there to be used, or there is a reason it is not.
// Nothing past the ready branch has to ask whether the space exists.
export type SpaceAvailability =
    | {
          status: typeof SPACE_AVAILABILITY_STATUS.READY;
          space: SpaceDetails;
      }
    | {
          status: typeof SPACE_AVAILABILITY_STATUS.UNAVAILABLE;
          reason: SpaceUnavailableReason;
      };
