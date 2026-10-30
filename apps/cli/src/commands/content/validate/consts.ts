export const CONTENT_VALIDATE_COMMAND: string = "validate";
// The name the JSON output uses.
export const CONTENT_VALIDATE_NAME: string = "content validate";

export const CONTENT_VALIDATE_DESCRIPTION: string =
    "Check a content folder on this machine: library.json, the PNGs it names and the template specs. Sends nothing and needs no URL or token.";

export const CONTENT_VALIDATE_HELP: string = `
The folder holds, both optional but at least one:
  library.json              the library, as \`standin seed library\` reads it
  <png files>               the files library.json names, by relative path
  templates/<name>.yaml     a spec of kind template (.yaml, .yml or .json);
                            the PNG templates/<name>.png beside it is its
                            thumbnail; the template is called as the "name"
                            of the spec, or <name> when it has none
A maps/ folder is not handled and is reported as ignored (a warning).

Checked here, with no network: library.json against its schema, that every
PNG it names exists, is a PNG and is at most 3 MB, the limits of the upload
(300 files, library.json 4 MB, 64 MB in all), and each spec against the spec
schema. What needs the instance (library keys that exist, whether the spec
fits the map) is not checked: \`content apply --dry-run\` asks the server.

Exit 0 when everything is valid, exit 3 with the issues listed
({file, path, message}) when not. All the issues are listed at once.
--dry-run and --yes are accepted and have no effect, nothing is written.

Examples:
  pnpm -s standin content validate ./content
  pnpm -s standin content validate ./content --json`;

export const CONTENT_VALIDATE_MESSAGES = {
    valid: (folder: string): string =>
        `✓ the content folder is valid: ${folder}`,
    library: (files: number, summary: string): string =>
        `  library.json: ${summary} and ${files} PNG files`,
    template: (file: string, name: string, tier: string): string =>
        `  ${file}: template "${name}", size tier ${tier}`,
    withThumbnail: "    thumbnail: yes",
    withoutThumbnail: "    thumbnail: no",
    localOnly:
        "  checked on this machine only: nothing was sent. `content apply --dry-run` asks the server too",
} as const;
