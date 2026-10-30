# Skills

Skills for AI coding agents (written for Claude Code, usable by others) that automate work on this project. Each folder holds one skill (`SKILL.md` plus anything it needs).

| Skill            | What it does                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `deploy`         | Installs Standin on a server over SSH, updates it later, verifies it and rolls back.                                                   |
| `author-content` | Authors the library (tilesets, assets, variants, bundles, areas, avatar parts) from a `library.json` folder and loads it with the CLI. |
| `author-map`     | Builds maps and map templates from a YAML spec with the CLI, from the service token to the published template.                         |

## Installing

Each skill is a folder with a `SKILL.md` (frontmatter with `name` and `description`, then plain instructions). That layout is shared by several agent harnesses, but every harness reads skills from its own folder, so this folder is the versioned source and installing means linking or copying it there:

| Command                              | What it does                                                  |
| ------------------------------------ | ------------------------------------------------------------- |
| `./skills/install.sh`                | Claude Code: symlink into `~/.claude/skills` (recommended)    |
| `./skills/install.sh --target codex` | Codex: symlink into `~/.codex/skills`                         |
| `./skills/install.sh --dest DIR`     | Any other harness that reads skills from a folder             |
| `./skills/install.sh --copy`         | Copy instead of linking                                       |
| `./skills/install.sh --project`      | Project folder (`<repo>/.claude/skills`) instead of your home |
| `./skills/install.sh --force`        | Replace a skill that is already installed                     |

Options combine, for example `./skills/install.sh --target codex --copy`.

The `claude` and `codex` folders are presets. Harnesses change where they look, so if one does not pick the skill up, check its documentation and pass the right folder with `--dest`.

With the symlink, a `git pull` updates the skills. With `--copy`, run the script again to update. Restart the agent if it was already open, then check that the skill is listed.

The script never overwrites an existing skill unless you pass `--force`.

### A harness without skills

The repository has an [`AGENTS.md`](../AGENTS.md) at its root that maps the code, lists the commands and rules, and points at these skills; `CLAUDE.md` imports it. A tool that reads an instructions file (`AGENTS.md`, `GEMINI.md`, rules files and so on) and has no skills feature can add a line pointing at the skill, for example "to deploy, follow `skills/deploy/SKILL.md`". The file is plain Markdown and works as a runbook.

## Using `deploy`

Create `deploy.local.env` at the repository root (it is ignored by git):

```ini
DEPLOY_SSH=deploy@203.0.113.10   # anything ssh accepts, including an alias from ~/.ssh/config
DEPLOY_PATH=/opt/standin
DEPLOY_BRANCH=main
DEPLOY_REPO_URL=https://github.com/kauavitorrodrigues/standin.git   # first install only

# only to provision a fresh server
DEPLOY_ADMIN_SSH=root@203.0.113.10
DEPLOY_USER=deploy
DEPLOY_SSH_PUBKEY=~/.ssh/id_ed25519.pub
```

Then ask the agent, from this repository, for example: "deploy to the server" or "update the app on the server".

The skill has three modes and picks the one the server needs:

- **provision** (fresh Debian or Ubuntu): creates the deploy user with your SSH key, installs Docker and git, sets up the firewall, fail2ban, automatic updates and swap, and hardens SSH. It needs `DEPLOY_ADMIN_SSH` (root or a sudo user) in `deploy.local.env`. The firewall and SSH steps ask for their own confirmation and are tested from a second connection before they replace the first way in.
- **first install**: clones the repo, creates the `.env` on the server (secrets generated there, never shown), starts the compose stack and seeds the library.
- **update**: pull, rebuild and verify, with a backup first when there are new migrations.

What it cannot do, and asks you to do: create the server, point the DNS at it, and open the ports in the provider's own firewall panel.

Changes that touch the database get a backup first, and a deploy that fails verification can be rolled back to the previous commit. Each deploy restarts the API and drops every connection, so prefer times when nobody is in a call.

## Using `author-content` and `author-map`

Both drive the `standin` CLI ([apps/cli/README.md](../apps/cli/README.md)) and need nothing in `deploy.local.env`. Ask the agent, from this repository, for example "add a wall style and a sofa to the library from these PNGs" (`author-content`) or "build an open office template from this description" (`author-map`). Remote commands need the address of the instance and a service token; the skill `author-map` shows how to create one and keep it out of the output. A complete folder to start from is [examples/authoring](../examples/authoring).

The deploy skill ends at a running instance with its first admin and the default library; these two start there.

## Adding a skill

1. Create `skills/<name>/SKILL.md` with a `name` and a `description` in the frontmatter. The description decides when the agent uses it, so say what it does and when to reach for it.
2. Keep it free of anything personal (hosts, IPs, secrets). Put those in a git-ignored file the skill reads.
3. Run `./skills/install.sh` to link it.
