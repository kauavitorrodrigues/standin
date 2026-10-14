import type { AssetDefinition } from "@standin/contracts";
import { resolveFileUrl } from "@/lib/api/assetUrl";
import { API_BASE_URL } from "@/lib/api/url";

// The address of the image of an asset, the same one the scene loads its
// texture from, so the browser cache serves both with one request.
export const getAssetImageUrl = (asset: Pick<AssetDefinition, "url">): string =>
    resolveFileUrl(asset.url, API_BASE_URL);
