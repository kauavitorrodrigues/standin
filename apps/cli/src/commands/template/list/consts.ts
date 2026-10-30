export const TEMPLATE_LIST_COMMAND: string = "list";
// The name the JSON output uses.
export const TEMPLATE_LIST_NAME: string = "template list";

export const TEMPLATE_LIST_DESCRIPTION: string =
    "List the templates of the instance, drafts and published. Needs a token with the templates:read scope.";

export const TEMPLATE_LIST_HELP: string = `
Each line is the id, the status (DRAFT, PUBLISHED or RETIRED), the size tier
and the name. --size-tier keeps one tier.
--dry-run and --yes are accepted and have no effect, nothing is written.

Examples:
  pnpm -s standin template list
  pnpm -s standin template list --size-tier S --json`;
