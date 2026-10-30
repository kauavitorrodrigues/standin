// The reads of the file system a command needs, behind a seam.
export type CliFiles = {
    readText: (path: string) => Promise<string>;
};
