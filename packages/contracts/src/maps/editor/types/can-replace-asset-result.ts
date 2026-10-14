import type { LAYOUT_ISSUE_CODES } from "../../layout/issues";
import type { ReplaceIncompatibleDetail } from "./replace-incompatible-detail";

export type CanReplaceAssetResult =
    | { ok: true }
    | {
          ok: false;
          reason: typeof LAYOUT_ISSUE_CODES.REPLACE_INCOMPATIBLE;
          detail: ReplaceIncompatibleDetail;
      };
