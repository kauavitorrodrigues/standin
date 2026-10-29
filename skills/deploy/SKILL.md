---
name: deploy
description: Deploy Standin to a server over SSH. Use when the user asks to deploy, publish, update, ship or put the app on a server/VPS, to prepare a fresh server for it (deploy user, Docker, firewall, SSH hardening), or to check or roll back a deployment. Three modes - provision a fresh server, first install (clone, .env, docker compose up), and update (pull, rebuild, verify).
---

# Deploy Standin over SSH

Takes a server from "just created" to Standin running, and updates it later. The source of truth for how the system runs is `docs/deployment.md` and `compose.yml` in this repository: read them before acting and follow them over anything remembered here.

## Modes

| Mode              | When                                                       | Section               |
| ----------------- | ---------------------------------------------------------- | --------------------- |
| **provision**     | The server is fresh, or lacks the deploy user, Docker, git | "Mode: provision"     |
| **first install** | The server is ready but Standin is not on it yet           | "Mode: first install" |
| **update**        | Standin is already on the server                           | "Mode: update"        |

The mode follows from what the server is missing (see "Step 0"). A fresh server runs all three in order. The user can also ask for just one.

## Scope

- Provisioning supports **Debian and Ubuntu** only. On anything else, stop and tell the user to prepare Docker, git and a deploy user themselves, then continue from "first install".
- Never done by this skill: creating the server, DNS records, the provider's own firewall (a panel the skill cannot reach), TLS certificates by hand (Caddy in the `proxy` container gets them by itself), and handling the user's passwords. For the ones the user must do, give a short checklist and ask for confirmation.

## Where the target comes from

Read `deploy.local.env` at the repository root (ignored by git, one `KEY=value` per line):

```
DEPLOY_SSH=user@host        # day-to-day access: anything `ssh` accepts, including an alias from ~/.ssh/config
DEPLOY_PATH=/opt/standin    # where the code lives on the server (default /opt/standin)
DEPLOY_BRANCH=main          # branch to deploy (default main)
DEPLOY_REPO_URL=...         # only needed for the first install

# only for provisioning a fresh server
DEPLOY_ADMIN_SSH=root@host  # initial access, with root or a sudo user
DEPLOY_USER=deploy          # user to create (default deploy)
DEPLOY_SSH_PUBKEY=~/.ssh/id_ed25519.pub   # key to authorize for that user
```

If the file is missing or the values for the requested mode are empty, ask the user and offer to write the file. Never write the host into a tracked file. After provisioning, `DEPLOY_SSH` becomes `$DEPLOY_USER@host`.

Run every remote command as `ssh "$DEPLOY_SSH" '...'`. Use `ssh -o BatchMode=yes` so a missing key fails instead of hanging on a prompt.

## Rules that always apply

- **Never** run `docker compose down -v`, `docker volume rm`, `docker system prune --volumes` or anything else that can delete the database or the uploads volume.
- **Never** print `.env`, secrets or the output of `docker compose config` (it expands them). To check a variable exists, test that the key is present and non-empty and print only the key name.
- Changes to `sshd`, the firewall and users exist only in provisioning, and only with the confirmations that section asks for. Never in the other modes.
- If `compose.override.yml` exists on the server, it is intentional. Leave it alone and keep using it.
- Do not edit tracked files on the server. If `git status --porcelain` there is not empty, stop and report it.
- Every deploy restarts the API and drops every socket and media session (clients reconnect on their own in seconds). Before deploying, tell the user this, and ask for a go-ahead unless they already said to deploy now.
- Run from the repository root so the relative paths below resolve.

## Step 0: preflight (every mode)

1. Local: `git status --porcelain` empty, the branch is `DEPLOY_BRANCH`, and it is pushed (`git rev-parse HEAD` equals `git rev-parse origin/$DEPLOY_BRANCH` after `git fetch`). If not, tell the user what would not be deployed and ask how to proceed. The server builds from the remote, not from this machine.
2. Remote, one SSH call (read-only): `docker compose version`, `git --version`, `free -h`, `df -h "$DEPLOY_PATH"` (or its parent). Under about 2 GB of free RAM plus swap, warn that the build may be killed (`Killed`) and offer to continue.
3. Decide the mode:
    - Cannot log in as the deploy user, or Docker or git is missing: **provision**. Say what is missing and ask before starting.
    - `$DEPLOY_PATH/.git` exists on the server: **update**.
    - Otherwise: **first install**.

## Mode: provision

Prepares a fresh Debian or Ubuntu server so the next modes work. Connect with `DEPLOY_ADMIN_SSH` (root or a sudo user; prefix commands with `sudo` for the latter).

Keep the first admin session open and untouched until the very end. Anything risky is tested from a **second** connection before it replaces the first way in.

### Inspect (read-only), then present the plan

Run: `cat /etc/os-release`, `id`, `sudo -n true` (if not root), `ss -tlnp` and `ss -ulnp`, `ufw status` (if installed), `docker --version`, `git --version`, `free -h`, `getent passwd "$DEPLOY_USER"`, `grep -rE '^(PermitRootLogin|PasswordAuthentication|Port)' /etc/ssh/sshd_config /etc/ssh/sshd_config.d/ 2>/dev/null`.

- Not Debian or Ubuntu: stop (see Scope).
- Something already listens on `80` or `443` (another web server, another app): **stop and ask**. The default `proxy` container publishes both. Fixing it means a reverse proxy on the host and a local `compose.override.yml`, which is the user's decision. Do not pick for them.
- Show the user the steps below that apply, which ones are skipped because they are already done, and which two need their own confirmation (firewall, SSH hardening). Get one go-ahead for the rest.

### Steps

1. **Update and base packages**: `apt-get update && apt-get upgrade -y`, then `apt-get install -y ca-certificates curl git ufw fail2ban unattended-upgrades openssl`. Use `DEBIAN_FRONTEND=noninteractive`. If `/var/run/reboot-required` appears, ask before rebooting, then wait for the server and reconnect.
2. **Deploy user** (skip if it exists): `adduser --disabled-password --gecos "" "$DEPLOY_USER"`. Authorize the public key from `DEPLOY_SSH_PUBKEY` in `~/.ssh/authorized_keys` (`700` on the folder, `600` on the file, owned by that user). The user has **no password**; the skill never sets or asks for one. Ask whether the user also needs `sudo`; default no, since routine deploys need only `docker`.
3. **Docker** (skip if present): install `docker-ce`, `docker-ce-cli`, `containerd.io`, `docker-buildx-plugin` and `docker-compose-plugin` from Docker's official apt repository for the detected distro (`ID` and `VERSION_CODENAME` from `/etc/os-release`), not the distro's `docker.io`. Then `usermod -aG docker "$DEPLOY_USER"`. Tell the user that the `docker` group is root-equivalent on that machine.
4. **Check the new way in** from a second connection: `ssh -o BatchMode=yes "$DEPLOY_USER@host" 'id && docker run --rm hello-world && docker compose version'`. If this fails, stop here and fix it. Do not continue to steps 5 and 7.
5. **Firewall** (its own confirmation). Tell the user which rules will be set, then: `ufw default deny incoming`, `ufw default allow outgoing`, `ufw allow <sshd port>/tcp` (the real port from `ss`, not an assumed 22), `ufw allow 80/tcp`, `ufw allow 443/tcp`, `ufw allow <MEDIA_LISTEN_PORT>/udp` and `/tcp`, and only then `ufw --force enable`. If `ufw` is already active, only add the missing rules; never reset it. After enabling, confirm a new SSH connection still works. Remind the user that the provider's own firewall (a panel) needs the same ports, and that Docker publishes ports straight into iptables, so `ufw` does not guard them: the compose file publishes only what is meant to be public.
6. **Safety nets**: `systemctl enable --now fail2ban`, enable `unattended-upgrades` (`dpkg-reconfigure -f noninteractive unattended-upgrades`), and if RAM plus swap is under about 4 GB with no swap file, offer a 2 GB swap file (`fallocate`, `chmod 600`, `mkswap`, `swapon`, a line in `/etc/fstab`). The build is what the swap protects.
7. **SSH hardening** (its own confirmation, and only after step 4 passed). Write `/etc/ssh/sshd_config.d/99-hardening.conf` with `PasswordAuthentication no` and `PermitRootLogin prohibit-password`, run `sshd -t`, reload (`systemctl reload ssh`, or `sshd` on non-Ubuntu), and test a new connection as `$DEPLOY_USER`. Root with a key stays possible on purpose, as the way back in for admin work when the deploy user has no sudo. Disabling root entirely (`PermitRootLogin no`) is only offered when the deploy user has `sudo` **and** the user can log in to a sudo-capable account. If anything fails, undo the file and reload before reporting.
8. **Hand-off**: set `DEPLOY_SSH=$DEPLOY_USER@host` in `deploy.local.env`, tell the user what was done and what remains on their side (provider firewall, DNS pointing at the IP), and continue to "first install" if they want.

Rules for this mode: idempotent (re-running changes nothing that is already right), one change at a time with its result shown, and no step edits a file by blind overwrite when it already exists: read it, change only the line needed.

## Mode: first install

1. Confirm with the user: the domain (already pointing at the server), and the server's **public IP** (the address clients send media to; a domain does not work there). Do not guess either. Ports `80` and `443` over TCP and the media port (`MEDIA_LISTEN_PORT`, default `44444`) over **UDP and TCP** must be open in every firewall; the skill cannot see the provider's panel, so ask.
2. Clone: `git clone --branch "$DEPLOY_BRANCH" "$DEPLOY_REPO_URL" "$DEPLOY_PATH"`. A private repo needs a read-only deploy key already set up on the server; if the clone is denied, stop and tell the user.
3. Create `.env` from `.env.example` on the server, generating secrets there so they never cross the terminal:
    - `POSTGRES_USER`, `POSTGRES_DB`: keep the example values or ask. `POSTGRES_PASSWORD`: `openssl rand -hex 24`.
    - `JWT_SECRET`: `openssl rand -hex 32`.
    - `SITE_ADDRESS`: the domain. `SERVER_URL` and `FRONTEND_URL`: `https://` plus the domain, no trailing slash.
    - `MEDIA_ANNOUNCED_ADDRESS`: the public IP. `MEDIA_LISTEN_PORT`: keep `44444` unless asked.
    - `STORAGE_DRIVER`: `local` unless the user wants S3 (then follow `docs/storage.md` and ask for the values).
    - Remove `DATABASE_URL` or leave it: the compose file builds the right one inside the containers.
    - `chmod 600 .env`.
      Tell the user the secrets exist only on the server and that they should keep a copy in a password manager. Do not show them.
4. Start: `cd "$DEPLOY_PATH" && docker compose --profile app up -d --build`. The first build takes minutes; run it with a long timeout (or in the background) and read the result when it ends.
5. Seed the global library once: `docker compose exec -T app pnpm --filter api seed:library`.
6. Verify (below), then give the user the manual check from `docs/deployment.md` step 6 (two browsers on different networks hearing and seeing each other). The skill cannot do that part.

## Mode: update

1. `cd "$DEPLOY_PATH"`; `git fetch origin "$DEPLOY_BRANCH"`.
2. Record the current commit: `OLD=$(git rev-parse --short HEAD)`. If `HEAD` already equals `origin/$DEPLOY_BRANCH`, say there is nothing new and stop, unless the user asked to rebuild anyway.
3. Show what is arriving: `git log --oneline HEAD..origin/$DEPLOY_BRANCH`.
4. Check for new migrations: `git diff --name-only HEAD..origin/$DEPLOY_BRANCH -- packages/database/migrations`. If any, say so and **run a backup first**: `set -a; . ./.env; set +a; ./deploy/backup.sh <backup folder>`. Ask the user for the backup folder if none is known (suggest `/opt/backups/standin`). Do not continue if the backup fails.
5. `git pull --ff-only origin "$DEPLOY_BRANCH"`. If it is not a fast-forward, stop and report; never merge, reset or force on the server.
6. `docker compose --profile app up -d --build`.
7. `docker image prune -f` (dangling images only).
8. Verify (below).

## Verify (first install and update)

All of these must hold; report each one as pass or fail:

- `docker compose --profile app ps`: `postgres` is `healthy`; `app` and `proxy` are `Up` and not restarting.
- `docker compose logs --tail 80 app`: migrations applied without error and the API is listening. No stack traces.
- A `[Media]` line appears in the app logs (the media worker started).
- `curl -sI https://<domain>` returns a 2xx or 3xx with a valid certificate. On a first install the certificate can take a minute; retry a few times before calling it a failure. If it still fails, the usual causes are DNS not propagated, port 80/443 blocked (host or provider), or `SITE_ADDRESS` not set to the domain. Check `docker compose logs proxy`.
- Take the domain from `SITE_ADDRESS` in the server's `.env` (read that one key only).

## Report

End with a short summary: mode, old commit → new commit, migrations applied or not, backup taken or not, each verification result, and anything the user still has to do by hand (firewall, DNS, the two-browser media test).

## Rollback

Code only; migrations do not go back by themselves.

1. If the new version fails verification, say so first and offer the rollback; do not roll back silently.
2. `git checkout <OLD sha>` on the server (detached HEAD is fine), `docker compose --profile app up -d --build`, verify again.
3. If the failed deploy applied migrations, warn that the database is now ahead of the code. Restoring needs the backup (restore commands are in the header of `deploy/backup.sh`) and the user's decision, since it discards data written since the backup.
4. After the user fixes forward, return to the branch: `git checkout "$DEPLOY_BRANCH"`.
