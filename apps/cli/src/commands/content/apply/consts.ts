export const CONTENT_APPLY_COMMAND: string = "apply";
// The name the JSON output uses.
export const CONTENT_APPLY_NAME: string = "content apply";

export const CONTENT_APPLY_DESCRIPTION: string =
    "Apply a content folder to the instance: seed the library, then create its templates. Needs library:write for library.json; templates:read, templates:write, maps:read and maps:write for templates.";

export const CONTENT_APPLY_HELP: string = `
Runs the same local checks as \`content validate\` (the layout of the folder is
described there), then, in this order:
  1. library.json and its PNGs go to POST /library/seed. The seed is
     idempotent by key: a second run reports "unchanged".
  2. each template of templates/ is found by its name (GET /templates):
       - no template has the name: it is created, its spec is built on its
         map, its thumbnail (templates/<name>.png) is uploaded, and it is
         published only with --publish;
       - it exists: it is NOT touched and is reported as "exists". The spec is
         not applied again, since applying ops twice would put the content
         twice. To change a template edit it in the editor, or delete it on
         the admin screen and run the command again;
       - it exists as a draft and --publish is given: it is published, but
         only when the draft is complete, which is the case when an earlier
         run failed at the publish step itself (its content and its
         thumbnail were already there). A draft with no thumbnail on the
         instance is refused before anything is written (exit 3): finish it
         in the editor, or delete it on the admin screen and run again. A
         template already published is "unchanged".
     --publish needs the thumbnail (templates/<name>.png) of every template
     that is going to be created; one that exists needs no local file.

Not transactional: the first failure stops the run and nothing is rolled
back. The error (exit code of the failure, also with --json, as one document)
lists in details.completed what was already done and in details.pending what
was not ({target, name}); a template left half made is in details.unfinished.
When the connection fails while a write is on its way, details.uncertain names
it: it may have happened, so check \`template list\` or \`library list\` before
running again. The seed has 5 minutes to answer, other writes 1 to 2.

--dry-run runs the checks of the server and writes nothing: library.json goes
to POST /library/seed?dryRun=true (the server checks the file and that every
PNG came with it; it does not decode the images nor resolve the keys), and the
templates are looked up by name to say what would be created. It needs the
URL and a token, with library:write and templates:read for the parts the
folder has. It does not compile the specs: that needs the template to exist.
--yes is accepted and has no effect, this command never asks to confirm.

Examples:
  pnpm -s standin content apply ./content --dry-run
  pnpm -s standin content apply ./content
  pnpm -s standin content apply ./content --publish --json`;

// What the seed says it did with an entry.
export const SEED_ACTIONS = {
    CREATE: "create",
    UPDATE: "update",
    UNCHANGED: "unchanged",
} as const;

export const CONTENT_APPLY_MESSAGES = {
    libraryDryRun: (files: number, summary: string): string =>
        `✓ library: the server accepts library.json and its ${files} PNG files (${summary})`,
    libraryDryRunNote:
        "  the server did not decode the images nor resolve the keys: that happens on a real run",
    librarySeeded: "✓ library seeded",
    libraryGroup: (
        group: string,
        created: number,
        updated: number,
        unchanged: number
    ): string =>
        `  ${group}: ${created} created, ${updated} updated, ${unchanged} unchanged`,
    templateCreated: (name: string, id: string, status: string): string =>
        `✓ template "${name}" created (${id}, ${status})`,
    templateOps: (opCount: number): string =>
        `    applied ${opCount} ops to its map`,
    templateThumbnail: "    thumbnail uploaded",
    templatePublished: (name: string, id: string): string =>
        `✓ template "${name}" published (${id})`,
    templateExists: (name: string, id: string, status: string): string =>
        `= template "${name}" already exists (${id}, ${status}): left as it is`,
    templateUnchanged: (name: string, id: string): string =>
        `= template "${name}" is already published (${id})`,
    wouldCreate: (name: string): string =>
        `✓ template "${name}" would be created`,
    wouldPublish: (name: string, id: string): string =>
        `✓ template "${name}" (${id}) is a draft and would be published`,
    existsHint:
        "  to change a template that exists, edit it in the editor, or delete it on the admin screen and run the command again",
    dryRun: "  dry run: nothing was written",
} as const;
