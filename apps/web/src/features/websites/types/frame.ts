// Where the load of a frame is: waiting, done, or one of the two ways it ends
// without a page.
export type WebsiteFrameStatus = "loading" | "loaded" | "timeout" | "failed";
