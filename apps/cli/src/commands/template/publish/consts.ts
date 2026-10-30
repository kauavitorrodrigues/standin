export const TEMPLATE_PUBLISH_COMMAND: string = "publish";
// The name the JSON output uses.
export const TEMPLATE_PUBLISH_NAME: string = "template publish";

export const TEMPLATE_PUBLISH_DESCRIPTION: string =
    "Publish a draft template so organizations can start spaces from it. Needs a token with templates:write (and templates:read with --dry-run).";

export const TEMPLATE_PUBLISH_HELP: string = `
The server publishes a draft that has a thumbnail, a valid layout and only
global assets; it refuses anything else (a template that is already published
or retired, no thumbnail, private assets).
--dry-run reads the template (templates:read) and says whether it is a draft
that can be published; it publishes nothing.
--yes is accepted and has no effect, this command never asks to confirm.

Examples:
  pnpm -s standin template publish <template-id> --dry-run
  pnpm -s standin template publish <template-id>`;
