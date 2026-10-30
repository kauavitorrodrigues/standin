export const TEMPLATE_CREATE_COMMAND: string = "create";
// The name the JSON output uses.
export const TEMPLATE_CREATE_NAME: string = "template create";

export const TEMPLATE_CREATE_DESCRIPTION: string =
    "Create a map template, and optionally fill its map from a spec, give it a thumbnail and publish it. Needs a token with templates:write, plus maps:read and maps:write with --spec.";

export const TEMPLATE_CREATE_HELP: string = `
The template is created as a draft (POST /templates). Then, in this order and
only when asked: --spec builds a spec of kind "template" on the map of the
template (read, compiled and applied like \`map apply\`), --thumbnail uploads a
PNG, --publish publishes it. A template is never published by default, and
--publish needs --thumbnail (the server refuses to publish without one).

--size-tier is XS, S, M, L or XL. With --spec it can be left out and is taken
from the spec; when both are given they must be the same.
The thumbnail is checked to be a PNG of at most 3 MB before any request.

Not transactional: if a step fails, the steps already done stay on the
instance. The error lists them in details.completed, and the fix says what to
do with the template that was left half made.

--dry-run checks the local input only (the PNG, and that the spec parses and
has the kind template) and prints the plan. It sends nothing, not even a read:
the spec cannot be compiled before the template exists, since it is built on
the map of the template, so a spec that does not fit the library shows only
on a real run.
--yes is accepted and has no effect, this command never asks to confirm.

Examples:
  pnpm -s standin template create "Open office" --size-tier S
  pnpm -s standin template create "Open office" --spec ./open-office.yaml --thumbnail ./open-office.png --dry-run
  pnpm -s standin template create "Open office" --size-tier S --description "Two rooms and a lounge" --spec ./open-office.yaml --thumbnail ./open-office.png --publish --json`;

export const TEMPLATE_CREATE_MESSAGES = {
    valid: (name: string, tier: string): string =>
        `✓ the input is valid: template "${name}", size tier ${tier}`,
    planCreate: "  a real run creates the template as a draft",
    planSpec: (file: string): string =>
        `  then builds ${file} on its map; the spec is only parsed here, it is compiled against the library of the instance on a real run`,
    planThumbnail: (file: string): string =>
        `  then uploads the thumbnail ${file}`,
    planPublish: "  then publishes it",
} as const;

// The steps a dry run says a real run would take.
export const TEMPLATE_CREATE_STEPS = {
    CREATE: "create",
    SPEC: "apply the spec",
    THUMBNAIL: "upload the thumbnail",
    PUBLISH: "publish",
} as const;
