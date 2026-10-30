import type { SoundboardClipScope } from "@standin/contracts";

// Which library a screen lists and manages. The organization sees its own
// clips and the default ones, the platform admin only the default ones, on
// their own routes of the API.
export type SoundboardLibraryKind = "organization" | "admin";

export type SoundboardLibrary = {
    kind: SoundboardLibraryKind;
    // The groups the list shows, in order.
    scopes: readonly SoundboardClipScope[];
    // Where a clip that is uploaded here goes.
    uploadScope: SoundboardClipScope;
    // Whether each group has a header, which can fold it. The panel and the
    // dialog have it. A page lists one scope only, so its list is rows alone.
    showGroupHeaders: boolean;
};

// What a request needs to find the clips: the library, and the organization
// when it is the one of an organization.
export type ClipListSource = {
    kind: SoundboardLibraryKind;
    organizationId: string;
};
